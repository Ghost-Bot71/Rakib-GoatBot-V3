module.exports = {
config: {
name: "age",
version: "2.0",
author: "Rakib",
category: "utility",
guide: {
en: "Usage: age <YYYY-MM-DD>"
}
},

onStart: async function ({ args, message }) {

if (!args[0]) {
  return message.reply("❗ Please provide your date of birth in the format YYYY-MM-DD");
}

const dob = new Date(args[0]);

if (dob == "Invalid Date") {
  return message.reply("❌ Invalid date format. Example: age 2005-03-07");
}

const today = new Date();

let years = today.getFullYear() - dob.getFullYear();
let months = today.getMonth() - dob.getMonth();
let days = today.getDate() - dob.getDate();

if (days < 0) {
  months--;
  const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  days += lastMonth.getDate();
}

if (months < 0) {
  years--;
  months += 12;
}

return message.reply(

`🎂 Age Calculator

📅 Date of Birth: ${args[0]}

👤 Your Age:
Years: ${years}
Months: ${months}
Days: ${days}`
);
}
};
