module.exports = {
config: {
name: "time",
version: "2.0",
author: "Rakib",
countDown: 2,
role: 0,
category: "utility",
guide: "{pn} [country] | {pn} list"
},

onStart: async function ({ message, args }) {

const zones = {
  bangladesh: "Asia/Dhaka",
  india: "Asia/Kolkata",
  pakistan: "Asia/Karachi",
  dubai: "Asia/Dubai",
  london: "Europe/London",
  germany: "Europe/Berlin",
  france: "Europe/Paris",
  italy: "Europe/Rome",
  russia: "Europe/Moscow",
  // Asia
  afghanistan: "Asia/Kabul",
  armenia: "Asia/Yerevan",
  azerbaijan: "Asia/Baku",
  bahrain: "Asia/Bahrain",
  bhutan: "Asia/Thimphu",
  brunei: "Asia/Brunei",
  cambodia: "Asia/Phnom_Penh",
  georgia: "Asia/Tbilisi",
  hongkong: "Asia/Hong_Kong",
  indonesia: "Asia/Jakarta",
  iran: "Asia/Tehran",
  iraq: "Asia/Baghdad",
  israel: "Asia/Jerusalem",
  jordan: "Asia/Amman",
  kazakhstan: "Asia/Almaty",
  kuwait: "Asia/Kuwait",
  kyrgyzstan: "Asia/Bishkek",
  laos: "Asia/Vientiane",
  lebanon: "Asia/Beirut",
  mongolia: "Asia/Ulaanbaatar",
  myanmar: "Asia/Yangon",
  nepal: "Asia/Kathmandu",
  oman: "Asia/Muscat",
  philippines: "Asia/Manila",
  qatar: "Asia/Qatar",
  saudi: "Asia/Riyadh",
  sri_lanka: "Asia/Colombo",
  syria: "Asia/Damascus",
  taiwan: "Asia/Taipei",
  tajikistan: "Asia/Dushanbe",
  turkmenistan: "Asia/Ashgabat",
  uzbekistan: "Asia/Tashkent",
  vietnam: "Asia/Ho_Chi_Minh",
  yemen: "Asia/Aden",

  // Europe
  austria: "Europe/Vienna",
  belgium: "Europe/Brussels",
  bulgaria: "Europe/Sofia",
  croatia: "Europe/Zagreb",
  cyprus: "Europe/Nicosia",
  czech: "Europe/Prague",
  denmark: "Europe/Copenhagen",
  estonia: "Europe/Tallinn",
  finland: "Europe/Helsinki",
  greece: "Europe/Athens",
  hungary: "Europe/Budapest",
  iceland: "Atlantic/Reykjavik",
  ireland: "Europe/Dublin",
  latvia: "Europe/Riga",
  lithuania: "Europe/Vilnius",
  luxembourg: "Europe/Luxembourg",
  malta: "Europe/Malta",
  netherlands: "Europe/Amsterdam",
  norway: "Europe/Oslo",
  poland: "Europe/Warsaw",
  portugal: "Europe/Lisbon",
  romania: "Europe/Bucharest",
  serbia: "Europe/Belgrade",
  slovakia: "Europe/Bratislava",
  slovenia: "Europe/Ljubljana",
  spain: "Europe/Madrid",
  sweden: "Europe/Stockholm",
  switzerland: "Europe/Zurich",
  ukraine: "Europe/Kiev",

  // Africa
  algeria: "Africa/Algiers",
  angola: "Africa/Luanda",
  botswana: "Africa/Gaborone",
  burundi: "Africa/Bujumbura",
  cameroon: "Africa/Douala",
  chad: "Africa/Ndjamena",
  congo: "Africa/Brazzaville",
  egypt: "Africa/Cairo",
  ethiopia: "Africa/Addis_Ababa",
  ghana: "Africa/Accra",
  kenya: "Africa/Nairobi",
  libya: "Africa/Tripoli",
  madagascar: "Indian/Antananarivo",
  malawi: "Africa/Blantyre",
  mali: "Africa/Bamako",
  morocco: "Africa/Casablanca",
  mozambique: "Africa/Maputo",
  namibia: "Africa/Windhoek",
  nigeria: "Africa/Lagos",
  rwanda: "Africa/Kigali",
  senegal: "Africa/Dakar",
  somalia: "Africa/Mogadishu",
  sudan: "Africa/Khartoum",
  tanzania: "Africa/Dar_es_Salaam",
  tunisia: "Africa/Tunis",
  uganda: "Africa/Kampala",
  zambia: "Africa/Lusaka",
  zimbabwe: "Africa/Harare",

  // America
  argentina: "America/Argentina/Buenos_Aires",
  bolivia: "America/La_Paz",
  chile: "America/Santiago",
  colombia: "America/Bogota",
  costa_rica: "America/Costa_Rica",
  cuba: "America/Havana",
  dominican: "America/Santo_Domingo",
  ecuador: "America/Guayaquil",
  el_salvador: "America/El_Salvador",
  guatemala: "America/Guatemala",
  haiti: "America/Port-au-Prince",
  honduras: "America/Tegucigalpa",
  jamaica: "America/Jamaica",
  mexico: "America/Mexico_City",
  nicaragua: "America/Managua",
  panama: "America/Panama",
  paraguay: "America/Asuncion",
  peru: "America/Lima",
  uruguay: "America/Montevideo",
  venezuela: "America/Caracas",

  // Oceania
  fiji: "Pacific/Fiji",
  kiribati: "Pacific/Tarawa",
  marshall: "Pacific/Majuro",
  micronesia: "Pacific/Pohnpei",
  nauru: "Pacific/Nauru",
  new_zealand: "Pacific/Auckland",
  palau: "Pacific/Palau",
  papua_new_guinea: "Pacific/Port_Moresby",
  samoa: "Pacific/Apia",
  solomon: "Pacific/Guadalcanal",
  tonga: "Pacific/Tongatapu",
  tuvalu: "Pacific/Funafuti",
  vanuatu: "Pacific/Efate",
  usa: "America/New_York",
  canada: "America/Toronto",
  brazil: "America/Sao_Paulo",
  japan: "Asia/Tokyo",
  korea: "Asia/Seoul",
  china: "Asia/Shanghai",
  thailand: "Asia/Bangkok",
  singapore: "Asia/Singapore",
  malaysia: "Asia/Kuala_Lumpur",
  australia: "Australia/Sydney",
  turkey: "Europe/Istanbul"
};

const input = args[0]?.toLowerCase() || "bangladesh";

if (input === "list") {
  return message.reply(

`🌍 Available Countries:

${Object.keys(zones).map(c => "• " + c).join("\n")}`
);
}

if (!zones[input]) {
  return message.reply("❌ Country not found. Use `time list`.");
}

const now = new Date();

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: zones[input],
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

const time = formatter.format(now);

message.reply(

`⏰ 𝐖𝐨𝐫𝐥𝐝 𝐂𝐥𝐨𝐜𝐤

🌍 Location: ${input}
📅 ${time}`
);
}
};
