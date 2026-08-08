module.exports = {
	config: {
		name: "dice",
		aliases: ["roll"],
		version: "1.0",
		author: "Rakib Islam",
		countDown: 5,
		role: 0,
		description: {
			en: "Dice betting game"
		},
		category: "game",
		guide: {
			en: "{pn} <1-6> <amount>"
		}
	},

	langs: {
		en: {
			win: "🎲 𝐃𝐈𝐂𝐄 𝐆𝐀𝐌𝐄\n━━━━━━━━━━━━━━\n🎯 Your Guess: %1\n🎲 Dice Result: %2\n🏆 You Win: %3$\n💰 Balance: %4$",
			lose: "🎲 𝐃𝐈𝐂𝐄 𝐆𝐀𝐌𝐄\n━━━━━━━━━━━━━━\n🎯 Your Guess: %1\n🎲 Dice Result: %2\n💀 You Lost: %3$\n💰 Balance: %4$"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {

		const formatBoldSerif = (text) => {
			const map = {
				a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
				k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
				u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
				A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
				K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
				U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
				"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",
				"$":"$"," ":" "
			};
			return text.split("").map(c => map[c] || c).join("");
		};

		const guess = parseInt(args[0]);
		const bet = parseInt(args[1]);

		if (!guess || guess < 1 || guess > 6)
			return message.reply("⚠️ Choose a number between 1-6.");

		if (!bet || bet <= 0)
			return message.reply("⚠️ Enter bet amount.");

		const userData = await usersData.get(event.senderID);
		let money = userData.money || 0;

		if (bet > money)
			return message.reply("❌ Not enough money.");

		const dice = Math.floor(Math.random() * 6) + 1;

		if (guess === dice) {
			money += bet;
			await usersData.set(event.senderID, { money });

			return message.reply(
				formatBoldSerif(getLang("win", guess, dice, bet * 2, money))
			);
		}
		else {
			money -= bet;
			await usersData.set(event.senderID, { money });

			return message.reply(
				formatBoldSerif(getLang("lose", guess, dice, bet, money))
			);
		}
	}
};
