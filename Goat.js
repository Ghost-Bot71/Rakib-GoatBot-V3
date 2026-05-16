/**
 * @author NTKhang
 * Modified & optimized by Rakib
 */

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

// ===============================
// ERROR HANDLING
// ===============================
process.on("unhandledRejection", error => {
	console.log("[ UNHANDLED_REJECTION ]", error);
});

process.on("uncaughtException", error => {
	console.log("[ UNCAUGHT_EXCEPTION ]", error);
});

const fs = require("fs-extra");
const google = require("googleapis").google;
const nodemailer = require("nodemailer");
const log = require("./logger/log.js");
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// ===============================
// VALID JSON (NO jsonlint)
// ===============================
function validJSON(pathDir) {
	try {
		if (!fs.existsSync(pathDir))
			throw new Error(`File "${pathDir}" not found`);

		JSON.parse(fs.readFileSync(pathDir, "utf-8"));
		return true;
	}
	catch (err) {
		throw new Error(err.message);
	}
}

// ===============================
// ENV
// ===============================
const { NODE_ENV } = process.env;

const dirConfig = path.normalize(
	`${__dirname}/config${NODE_ENV === "development" ? ".dev.json" : ".json"}`
);

const dirConfigCommands = path.normalize(
	`${__dirname}/configCommands${NODE_ENV === "development" ? ".dev.json" : ".json"}`
);

const dirAccount = path.normalize(
	`${__dirname}/account${NODE_ENV === "development" ? ".dev.txt" : ".txt"}`
);

// ===============================
// VALIDATE CONFIG
// ===============================
for (const pathDir of [dirConfig, dirConfigCommands]) {
	try {
		validJSON(pathDir);
	}
	catch (err) {
		log.error(
			"CONFIG",
			`Invalid JSON "${pathDir}":\n${err.message}`
		);
		process.exit(1); // FIXED
	}
}

// ===============================
// LOAD CONFIG
// ===============================
const config = require(dirConfig);

if (Array.isArray(config.whiteListMode?.whiteListIds)) {
	config.whiteListMode.whiteListIds =
		config.whiteListMode.whiteListIds.map(id => id.toString());
}

const configCommands = require(dirConfigCommands);

// ===============================
// GLOBAL
// ===============================
global.GoatBot = {
	startTime: Date.now() - process.uptime() * 1000,

	commands: new Map(),
	eventCommands: new Map(),

	commandFilesPath: [],
	eventCommandsFilesPath: [],

	aliases: new Map(),

	onFirstChat: [],
	onChat: [],
	onEvent: [],
	onReply: new Map(),
	onReaction: new Map(),
	onAnyEvent: [],

	config,
	configCommands,

	envCommands: {},
	envEvents: {},
	envGlobal: {},

	// reLoginBot removed (useless)

	Listening: null,
	oldListening: [],
	callbackListenTime: {},

	storage5Message: [],

	fcaApi: null,
	botID: null
};

// ===============================
// DATABASE
// ===============================
global.db = {
	allThreadData: [],
	allUserData: [],
	allDashBoardData: [],
	allGlobalData: [],

	threadModel: null,
	userModel: null,
	dashboardModel: null,
	globalModel: null,

	threadsData: null,
	usersData: null,
	dashBoardData: null,
	globalData: null,

	receivedTheFirstMessage: {}
};

// ===============================
global.client = {
	dirConfig,
	dirConfigCommands,
	dirAccount,

	countDown: {},
	cache: {},

	database: {
		creatingThreadData: [],
		creatingUserData: [],
		creatingDashBoardData: [],
		creatingGlobalData: []
	},

	commandBanned: configCommands.commandBanned
};

// ===============================
const utils = require("./utils.js");
global.utils = utils;

// ===============================
global.temp = {
	createThreadData: [],
	createUserData: [],
	createThreadDataError: [],

	filesOfGoogleDrive: {
		arraybuffer: {},
		stream: {},
		fileNames: {}
	},

	contentScripts: {
		cmds: {},
		events: {}
	}
};

// ===============================
// STABLE WATCH (FIXED)
// ===============================
const watchAndReloadConfig = (dir, prop, logName) => {
	fs.watchFile(dir, { interval: 500 }, () => {
		try {
			const newData = JSON.parse(fs.readFileSync(dir, "utf-8"));
			global.GoatBot[prop] = newData;

			log.success(logName, `Reloaded ${dir}`);
		}
		catch (err) {
			log.warn(logName, `Reload failed: ${err.message}`);
		}
	});
};

watchAndReloadConfig(dirConfigCommands, "configCommands", "CONFIG COMMANDS");
watchAndReloadConfig(dirConfig, "config", "CONFIG");

// ===============================
global.GoatBot.envGlobal = configCommands.envGlobal;
global.GoatBot.envCommands = configCommands.envCommands;
global.GoatBot.envEvents = configCommands.envEvents;

const getText = global.utils.getText;

// ===============================
// AUTO RESTART
// ===============================
if (config.autoRestart?.time > 0) {
	setTimeout(() => {
		utils.log.info("AUTO RESTART", "Restarting...");
		process.exit(2);
	}, config.autoRestart.time);
}

// ===============================
// MAIN
// ===============================
(async () => {
	const { gmailAccount } = config.credentials;
	const { email, clientId, clientSecret, refreshToken } = gmailAccount;

	const OAuth2 = google.auth.OAuth2;
	const OAuth2_client = new OAuth2(clientId, clientSecret);

	OAuth2_client.setCredentials({
		refresh_token: refreshToken
	});

	let accessToken = null;

	try {
		accessToken = await OAuth2_client.getAccessToken();
	}
	catch (err) {
		log.warn("GMAIL", "Token expired");
		console.log(err); // FIXED debug
	}

	let transporter = null;

	if (accessToken) {
		transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				type: "OAuth2",
				user: email,
				clientId,
				clientSecret,
				refreshToken,
				accessToken
			}
		});
	}

	global.utils.sendMail = async function (options) {
		if (!transporter) return null;
		return transporter.sendMail(options);
	};

	global.utils.transporter = transporter;

	// GOOGLE DRIVE
	try {
		const parentId = await utils.drive.checkAndCreateParentFolder("GoatBot");
		utils.drive.parentID = parentId;
	}
	catch (err) {
		log.warn("GOOGLE_DRIVE", "Setup failed");
	}

	// LOGIN
	require(
		`./bot/login/login${
			NODE_ENV === "development" ? ".dev.js" : ".js"
		}`
	);
})();

// ===============================
// HEARTBEAT (OPTIMIZED)
// ===============================
setInterval(() => {
	if (process.send) process.send("heartbeat");
}, 1000 * 30);
