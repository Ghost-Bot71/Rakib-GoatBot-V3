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
let restarting = false;

// ===============================
// EXPRESS SERVER
// ===============================
app.get("/", (req, res) => {
	res.status(200).send("Rakib Goat Bot Running");
});

app.get("/ping", (req, res) => {
	res.status(200).json({
		status: "online",
		uptime: process.uptime(),
		time: new Date()
	});
});

app.listen(PORT, () => {
	log.info(
		"WEB SERVER",
		`Running on port ${PORT}`
	);
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

	log.err(
		"UNCAUGHT_EXCEPTION",
		err
	);
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

	log.err(
		"UNHANDLED_REJECTION",
		err
	);
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

	child = spawn("node", ["./Goat.js"], {
		cwd: __dirname,

		stdio: [
			"inherit",
			"inherit",
			"inherit",
			"ipc"
		],

		shell: true
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
