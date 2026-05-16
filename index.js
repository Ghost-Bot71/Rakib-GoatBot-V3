/**
 * @author NTKhang
 * Modified & optimized by Rakib
 */

process.env.NODE_ENV = "production";
process.env.EXPRESS_NO_WARNINGS = "true";

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");

const app = express();

// ===============================
const PORT = process.env.PORT || 3000;

let child = null;
let restarting = false;
let restartCount = 0;

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
	log.info("WEB SERVER", `Running on port ${PORT}`);
});

// ===============================
// GLOBAL ERROR GUARD
// ===============================
function ignoreECONNRESET(err) {
	return (
		err?.code === "ECONNRESET" ||
		String(err).includes("ECONNRESET")
	);
}

process.on("uncaughtException", err => {
	if (ignoreECONNRESET(err)) {
		log.warn("NETWORK", "ECONNRESET ignored");
		return;
	}

	log.err("UNCAUGHT_EXCEPTION", err);
});

process.on("unhandledRejection", err => {
	if (ignoreECONNRESET(err)) {
		log.warn("NETWORK", "ECONNRESET ignored");
		return;
	}

	log.err("UNHANDLED_REJECTION", err);
});

// ===============================
// START BOT (IMPROVED)
// ===============================
function startProject() {
	if (restarting) return;

	restarting = true;

	log.info("GOATBOT", "Starting Goat Bot...");

	child = spawn("node", ["./Goat.js"], {
		cwd: __dirname,
		stdio: ["inherit", "inherit", "inherit", "ipc"],
		shell: false // FIXED (better)
	});

	child.on("message", msg => {
		if (msg === "heartbeat") {
			log.info("HEARTBEAT", "Bot alive");
		}
	});

	child.on("close", code => {
		log.warn("GOATBOT", `Exited with code ${code}`);

		restarting = false;
		restartCount++;

		// 🔥 Crash loop protection
		if (restartCount > 10) {
			log.err("GOATBOT", "Too many restarts! Stopping...");
			process.exit(1);
		}

		setTimeout(startProject, 3000);
	});

	child.on("error", err => {
		log.err("GOATBOT_ERROR", err);
		restarting = false;
	});
}

// ===============================
// SAFE SHUTDOWN (IMPROVED)
// ===============================
function shutdown(signal) {
	log.warn("SYSTEM", `${signal} received, shutting down...`);

	if (child) {
		child.kill("SIGTERM");
	}

	setTimeout(() => {
		process.exit(0);
	}, 1000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ===============================
// START
// ===============================
startProject();
