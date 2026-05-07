const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
	config: {
		name: "welcome",
		version: "1.0",
		author: "Rakib",
		category: "events"
	},

	onStart: async function ({ message, event, api }) {
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID, author } = event;
		const user = event.logMessageData.addedParticipants[0];
		const userName = user.fullName;

		const threadInfo = await api.getThreadInfo(threadID);
		const threadName = threadInfo.threadName || "this group";
		const memberCount = threadInfo.participantIDs.length;

		// 👤 added by
		let adderName = "User";
		try {
			const info = await api.getUserInfo(author);
			adderName = info[author]?.name || "User";
		} catch {}

		// 🖼️ avatar → base64
		const avatarPath = await getAvatarUrl(user.userFbId);
		const avatarBase64 = fs.readFileSync(avatarPath).toString("base64");

		const imgPath = path.join(__dirname, `welcome_${Date.now()}.png`);

		const html = `
		<!DOCTYPE html>
		<html>
		<head>
		<meta charset="UTF-8">
		<style>
		body {
		  margin:0;
		  display:flex;
		  justify-content:center;
		  align-items:center;
		  height:100vh;
		  background:#020308;
		  font-family:sans-serif;
		}

		.card {
		  width:900px;
		  height:420px;
		  border-radius:20px;
		  background:linear-gradient(135deg,#020308,#071c33,#000);
		  color:white;
		  position:relative;
		  display:flex;
		  align-items:center;
		  justify-content:center;
		}

		/* 🔥 TITLE */
		.title-box {
		  position:absolute;
		  top:20px;
		  width:100%;
		  text-align:center;
		}

		.title {
		  font-size:30px;
		  font-weight:800;
		  color:#00c3ff;
		}

		.subtitle {
		  font-size:16px;
		  margin-top:5px;
		  color:#ffcc00;
		  opacity:0.9;
		}

		.content {
		  display:flex;
		  align-items:center;
		  gap:40px;
		}

		.profile {
		  width:150px;
		  height:150px;
		  border-radius:50%;
		  border:4px solid #00c3ff;
		  overflow:hidden;
		}

		.profile img {
		  width:100%;
		  height:100%;
		}

		.info {
		  display:flex;
		  flex-direction:column;
		  gap:10px;
		}

		.username {
		  font-size:34px;
		  font-weight:800;
		  color:#ff00cc;
		}

		.sub {
		  font-size:16px;
		  opacity:.8;
		}

		.box {
		  margin-top:10px;
		  display:flex;
		  gap:15px;
		}

		.card-box {
		  padding:12px 18px;
		  border-radius:12px;
		  background:rgba(255,255,255,0.05);
		  font-size:15px;
		  font-weight:600;
		}

		.footer {
		  position:absolute;
		  bottom:15px;
		  right:25px;
		  font-size:13px;
		}

		.bot {
		  position:absolute;
		  bottom:15px;
		  left:25px;
		  font-size:13px;
		  color:#00c3ff;
		}
		</style>
		</head>

		<body>

		<div class="card">

		<div class="title-box">
		  <div class="title">${threadName}</div>
		  <div class="subtitle">Welcome Our Group</div>
		</div>

		<div class="content">

		  <div class="profile">
			<img src="data:image/png;base64,${avatarBase64}">
		  </div>

		  <div class="info">
			<div class="username">${userName}</div>
			<div class="sub">New member joined 🎉</div>

			<div class="box">
			  <div class="card-box">Member #${memberCount}</div>
			  <div class="card-box">Added by ${adderName}</div>
			</div>
		  </div>

		</div>

		<div class="footer">Welcome to the family</div>
		<div class="bot">Tessa Bot</div>

		</div>

		</body>
		</html>
		`;

		const browser = await puppeteer.launch({
			args: ["--no-sandbox"]
		});
		const page = await browser.newPage();

		await page.setContent(html);
		await page.setViewport({ width: 1000, height: 500 });

		await page.screenshot({ path: imgPath });

		await browser.close();

		await message.send({
			body: `🎉 Welcome ${userName} to ${threadName}\n👤 Added by ${adderName}`,
			attachment: fs.createReadStream(imgPath)
		});

		// cleanup
		fs.unlinkSync(imgPath);
		if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
	}
};
