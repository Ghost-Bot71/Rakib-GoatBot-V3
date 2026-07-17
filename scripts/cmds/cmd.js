const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.20",
		author: "NTKhang & Rakib",
		countDown: 5,
		role: 2,
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadall: Load lại tất cả các lệnh trong thư mục"
				+ "\n   {pn} unload <tên file lệnh>"
				+ "\n   {pn} unload all: Unload tất cả các lệnh ngoại trừ lệnh này",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadall: Load all command files in the directory"
				+ "\n   {pn} unload <command file name>"
				+ "\n   {pn} unload all: Unload all commands except this one"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
			loadedSuccess: "✅ | Đã load thành công (%1) command",
			loadedFail: "❌ | Load thất bại (%1) command\n%2",
			openConsoleToSeeError: "👀 | Hãy mở console để xem chi tiết lỗi",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload hoặc gõ 'all'",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
			unloadAllSuccess: "✅ | Đã unload thành công (%1) command, ngoại trừ lệnh '%2'",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
			invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
			unloadedFile: "✅ | Đã unload lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✅ | Loaded successfully (%1) command",
			loadedFail: "❌ | Failed to load (%1) command\n%2",
			openConsoleToSeeError: "👀 | Open console to see error details",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload or type 'all'",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
			unloadAllSuccess: "✅ | Unloaded successfully (%1) commands, except command '%2'",
			missingFile: "⚠️ | Command file \"%1\" not found",
			invalidFileName: "⚠️ | Invalid command file name",
			unloadedFile: "✅ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts, loadScripts } = global.utils;

		// Handle cmd loadall OR cmd load all
		if (
			(args[0] || "").toLowerCase() == "loadall" || 
			(args[0] == "load" && args[1] && args[1].toLowerCase() == "all")
		) {
			configCommands.commandUnload = [];
			fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

			const fileNeedToLoad = fs.readdirSync(__dirname)
				.filter(file =>
					file.endsWith(".js") &&
					!file.match(/(eg)\.js$/g) &&
					(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g))
				)
				.map(item => item.split(".")[0]);

			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				if (infoLoad.status == "success")
					arraySucces.push(fileName);
				else
					arrayFail.push(` ❗ ${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0) {
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
				msg += "\n" + getLang("openConsoleToSeeError");
			}

			return message.reply(msg);
		}
		else if (
			args[0] == "load"
			&& args.length == 2
		) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(
					getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
					+ "\n" + infoLoad.error.stack
				);
				console.log(infoLoad.errorWithThoutRemoveHomeDir);
			}
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			
			// Unload all files except this command file
			if (args[1].toLowerCase() == "all") {
				const allFiles = fs.readdirSync(__dirname)
					.filter(file => file.endsWith(".js") && file != path.basename(__filename));
				
				let countUnloaded = 0;
				for (const file of allFiles) {
					try {
						const fileName = file.split(".")[0];
						const checkCmd = require(path.join(__dirname, file));
						if (!checkCmd || !checkCmd.config || !checkCmd.config.name) {
							delete require.cache[require.resolve(path.join(__dirname, file))];
							continue;
						}
						
						unloadScripts("cmds", fileName, configCommands, getLang);
						countUnloaded++;
					} catch (e) {
						try {
							delete require.cache[require.resolve(path.join(__dirname, file))];
						} catch(err){}
					}
				}
				return message.reply(getLang("unloadAllSuccess", countUnloaded, this.config.name));
			}

			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else
			message.SyntaxError();
	}
};

// do not edit this code because it use for obfuscate code
const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode) {
	const storageCommandFilesPath = global.GoatBot[folder == "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"];

	try {
		if (rawCode) {
			fileName = fileName.slice(0, -3);
			fs.writeFileSync(path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`), rawCode);
		}
		const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
		const { GoatBot } = global;
		const { onFirstChat: allOnFirstChat, onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
		let setMap, typeEnvCommand, commandType;
		if (folder == "cmds") {
			typeEnvCommand = "envCommands";
			setMap = "commands";
			commandType = "command";
		}
		else if (folder == "events") {
			typeEnvCommand = "envEvents";
			setMap = "eventCommands";
			commandType = "event command";
		}
		let pathCommand;
		if (process.env.NODE_ENV == "development") {
			const devPath = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.dev.js`);
			if (fs.existsSync(devPath))
				pathCommand = devPath;
			else
				pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);
		}
		else
			pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);

		const contentFile = fs.readFileSync(pathCommand, "utf8");
		let allPackage = contentFile.match(regExpCheckPackage);
		if (allPackage) {
			allPackage = allPackage
				.map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
				.filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
			for (let packageName of allPackage) {
				if (packageName.startsWith('@'))
					packageName = packageName.split('/').slice(0, 2).join('/');
				else
					packageName = packageName.split('/')[0];

				if (!packageAlready.includes(packageName)) {
					packageAlready.push(packageName);
					if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
						let wating;
						try {
							wating = setInterval(() => {
								count++;
								loading.info("PACKAGE", `Installing ${packageName} ${spinner[count % spinner.length]}`);
							}, 80);
							execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
							clearInterval(wating);
							process.stderr.clearLine();
						}
						catch (error) {
							clearInterval(wating);
							process.stderr.clearLine();
							throw new Error(`Can't install package ${packageName}`);
						}
					}
				}
			}
		}
		const oldCommand = require(pathCommand);
		const oldCommandName = oldCommand?.config?.name;
		if (!oldCommandName) {
			if (GoatBot[setMap].get(oldCommandName)?.location != pathCommand)
				throw new Error(`${commandType} name "${oldCommandName}" is already exist in command "${removeHomeDir(GoatBot[setMap].get(oldCommandName)?.location || "")}"`);
		}
		if (oldCommand.config && oldCommand.config.aliases) {
			let oldAliases = oldCommand.config.aliases;
			if (typeof oldAliases == "string")
				oldAliases = [oldAliases];
			for (const alias of oldAliases)
				GoatBot.aliases.delete(alias);
		}
		delete require.cache[require.resolve(pathCommand)];

		const command = require(pathCommand);
		command.location = pathCommand;
		const configCommand = command.config;
		if (!configCommand || typeof configCommand != "object")
			throw new Error("config of command must be an object");
		const scriptName = configCommand.name;

		const indexOnChat = allOnChat.findIndex(item => item == oldCommandName);
		if (indexOnChat != -1)
			allOnChat.splice(indexOnChat, 1);

		const indexOnFirstChat = allOnChat.findIndex(item => item == oldCommandName);
		let oldOnFirstChat;
		if (indexOnFirstChat != -1) {
			oldOnFirstChat = allOnFirstChat[indexOnFirstChat];
			allOnFirstChat.splice(indexOnFirstChat, 1);
		}

		const indexOnEvent = allOnEvent.findIndex(item => item == oldCommandName);
		if (indexOnEvent != -1)
			allOnEvent.splice(indexOnEvent, 1);

		const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == oldCommandName);
		if (indexOnAnyEvent != -1)
			allOnAnyEvent.splice(indexOnAnyEvent, 1);

		if (command.onLoad)
			command.onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });

		const { envGlobal, envConfig } = configCommand;
		if (!command.onStart)
			throw new Error('Function onStart is missing!');
		if (typeof command.onStart != "function")
			throw new Error('Function onStart must be a function!');
		if (!scriptName)
			throw new Error('Name of command is missing!');
		if (configCommand.aliases) {
			let { aliases } = configCommand;
			if (typeof aliases == "string")
				aliases = [aliases];
			for (const alias of aliases) {
				if (aliases.filter(item => item == alias).length > 1)
					throw new Error(`alias "${alias}" duplicate in ${commandType} "${scriptName}" with file name "${removeHomeDir(pathCommand || "")}"`);
				if (GoatBot.aliases.has(alias))
					throw new Error(`alias "${alias}" is already exist in ${commandType} "${GoatBot.aliases.get(alias)}" with file name "${removeHomeDir(GoatBot[setMap].get(GoatBot.aliases.get(alias))?.location || "")}"`);
				GoatBot.aliases.set(alias, scriptName);
			}
		}
		if (envGlobal) {
			if (typeof envGlobal != "object" || Array.isArray(envGlobal))
				throw new Error("envGlobal must be an object");
			for (const key in envGlobal)
				configCommands.envGlobal[key] = envGlobal[key];
		}
		if (envConfig && typeof envConfig == "object" && !Array.isArray(envConfig)) {
			if (!configCommands[typeEnvCommand][scriptName])
				configCommands[typeEnvCommand][scriptName] = {};
			configCommands[typeEnvCommand][scriptName] = envConfig;
		}
		GoatBot[setMap].delete(oldCommandName);
		GoatBot[setMap].set(scriptName, command);
		fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
		const keyUnloadCommand = folder == "cmds" ? "commandUnload" : "commandEventUnload";
		const findIndex = (configCommands[keyUnloadCommand] || []).indexOf(`${fileName}.js`);
		if (findIndex != -1)
			configCommands[keyUnloadCommand].splice(findIndex, 1);
		fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));


		if (command.onChat)
			allOnChat.push(scriptName);

		if (command.onFirstChat)
			allOnFirstChat.push({ commandName: scriptName, threadIDsChattedFirstTime: oldOnFirstChat?.threadIDsChattedFirstTime || [] });

		if (command.onEvent)
			allOnEvent.push(scriptName);

		if (command.onAnyEvent)
			allOnAnyEvent.push(scriptName);

		const indexStorageCommandFilesPath = storageCommandFilesPath.findIndex(item => item.filePath == pathCommand);
		if (indexStorageCommandFilesPath != -1)
			storageCommandFilesPath.splice(indexStorageCommandFilesPath, 1);
		storageCommandFilesPath.push({
			filePath: pathCommand,
			commandName: [scriptName, ...configCommand.aliases || []]
		});

		return {
			status: "success",
			name: fileName,
			command
		};
	}
	catch (err) {
		const defaultError = new Error();
		defaultError.name = err.name;
		defaultError.message = err.message;
		defaultError.stack = err.stack;

		err.stack ? err.stack = removeHomeDir(err.stack || "") : "";
		fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
		return {
			status: "failed",
			name: fileName,
			error: err,
			errorWithThoutRemoveHomeDir: defaultError
		};
	}
}

function unloadScripts(folder, fileName, configCommands, getLang) {
	const pathCommand = `${process.cwd()}/scripts/${folder}/${fileName}.js`;
	if (!fs.existsSync(pathCommand)) {
		const err = new Error(getLang("missingFile", `${fileName}.js`));
		err.name = "FileNotFound";
		throw err;
	}
	const command = require(pathCommand);
	const commandName = command.config?.name;
	if (!commandName)
		throw new Error(getLang("invalidFileName", `${fileName}.js`));
	const { GoatBot } = global;
	const { onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
	const indexOnChat = allOnChat.findIndex(item => item == commandName);
	if (indexOnChat != -1)
		allOnChat.splice(indexOnChat, 1);
	const indexOnEvent = allOnEvent.findIndex(item => item == commandName);
	if (indexOnEvent != -1)
		allOnEvent.splice(indexOnEvent, 1);
	const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == commandName);
	if (indexOnAnyEvent != -1)
		allOnAnyEvent.splice(indexOnAnyEvent, 1);
	if (command.config && command.config.aliases) {
		let aliases = command.config?.aliases || [];
		if (typeof aliases == "string")
			aliases = [aliases];
		for (const alias of aliases)
			GoatBot.aliases.delete(alias);
	}
	const setMap = folder == "cmds" ? "commands" : "eventCommands";
	delete require.cache[require.resolve(pathCommand)];
	GoatBot[setMap].delete(commandName);
	log.master("UNLOADED", getLang("unloaded", commandName));
	const commandUnload = configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] || [];
	if (!commandUnload.includes(`${fileName}.js`))
		commandUnload.push(`${fileName}.js`);
	configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] = commandUnload;
	fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
	return {
		status: "success",
		name: fileName
	};
}

global.utils.loadScripts = loadScripts;
global.utils.unloadScripts = unloadScripts;
