/**
 * @author NTKhang
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! Do not remove author credit
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");

const app = express();

// ===============================
// CONFIG
// ===============================
const PORT = process.env.PORT || 3000;

let child = null;
let lastHeartbeat = Date.now();
let restarting = false;

// ===============================
// EXPRESS SERVER
// ===============================
app.get("/", (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Rakib Goat Bot</title>

			<style>
				*{
					margin:0;
					padding:0;
					box-sizing:border-box;
				}

				html,body{
					width:100%;
					height:100%;
					overflow:hidden;
					background:#000;
				}

				iframe{
					width:100%;
					height:100%;
					border:none;
				}
			</style>
		</head>

		<body>
			<iframe src="https://bdrakib6t9.vercel.app"></iframe>
		</body>
		</html>
	`);
});

app.listen(PORT, () => {
	log.info("WEB SERVER", `Running on port ${PORT}`);
});

// ===============================
// GLOBAL ERROR GUARD
// ===============================
process.on("uncaughtException", err => {
	if (
		err?.code === "ECONNRESET" ||
		String(err).includes("ECONNRESET")
	) {
		log.warn(
			"NETWORK",
			"ECONNRESET ignored"
		);

		return;
	}

	log.err("UNCAUGHT_EXCEPTION", err);
});

process.on("unhandledRejection", err => {
	if (
		err?.code === "ECONNRESET" ||
		String(err).includes("ECONNRESET")
	) {
		log.warn(
			"NETWORK",
			"ECONNRESET ignored"
		);

		return;
	}

	log.err("UNHANDLED_REJECTION", err);
});

// ===============================
// START BOT
// ===============================
function startProject() {
	if (restarting)
		return;

	restarting = true;

	log.info(
		"GOATBOT",
		"Starting Goat Bot..."
	);

	child = spawn("node", ["Goat.js"], {
		cwd: __dirname,

		stdio: [
			"inherit",
			"inherit",
			"inherit",
			"ipc"
		],

		shell: true
	});

	lastHeartbeat = Date.now();

	// ===========================
	// HEARTBEAT RECEIVE
	// ===========================
	child.on("message", msg => {
		if (msg === "heartbeat") {
			lastHeartbeat = Date.now();
		}
	});

	// ===========================
	// EXIT / RESTART
	// ===========================
	child.on("close", code => {
		log.warn(
			"GOATBOT",
			`Exited with code ${code}`
		);

		restarting = false;

		setTimeout(() => {
			startProject();
		}, 3000);
	});

	child.on("error", err => {
		log.err(
			"GOATBOT_ERROR",
			err
		);

		restarting = false;
	});
}

// ===============================
// HEARTBEAT WATCHDOG
// ===============================
setInterval(() => {
	const heartbeatTimeout =
		1000 * 60 * 5;

	if (
		Date.now() - lastHeartbeat >
		heartbeatTimeout
	) {
		log.warn(
			"WATCHDOG",
			"Heartbeat lost, restarting..."
		);

		if (child) {
			child.kill();
		}
	}
}, 1000 * 60);

// ===============================
// SAFE SHUTDOWN
// ===============================
function shutdown(signal) {
	log.warn(
		"SYSTEM",
		`${signal} received, shutting down...`
	);

	if (child) {
		child.kill();
	}

	process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ===============================
// START
// ===============================
startProject();
