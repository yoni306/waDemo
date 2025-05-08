// tadiran_monitor_multi.js
// ---------------------------------------------------------
// 1) login    2) monitorStart לכל שלוחה בודדת
// 3) monitorStart משולב רק למוצלחות
// 4) getEvents raw loop  5) keep-alive & logout
// ---------------------------------------------------------
const https = require("https");

/* -------- CONFIG --------------------------------------- */
const HOST = "az-prod.aeonix4cloud.co.il";
const PORT = 30557;
const USER = "AeonixAPI972527755722";
const PASS = "Bpa1D2.";
const APP = "or-hashen-app";
const VER = "V1.0";

/* -------- רשימת השלוחות לבדיקת monitor ---------------- */
const ALL_EXT = [
  "733712337",
  "733712336",
  "733980240",
  "732545639",
  "39335017",
  "88676447",
  "86738359",
  "86236108",
  "26249851",
  "25803337",
  "35795399",
  "36186020",
  "733980266",
  "97432773",
  "99585949",
  "35547255",
  "35627394",
  "48383389",
  "48444924",
  "48330433",
  "26264885",
  "25022131",
  "26248694",
  "26481402",
  "733980207",
  "732545630",
  "89263968",
  "89263968",
  "89931920",
  "733712334",
  "98992002",
  "98615766",
  "98941110",
  "733980250",
  "39040072",
  "35345584",
  "86811978",
  "36244157",
  "35627384",
  "89365776",
  "733980300",
  "86624477",
  "89237314",
  "36417455",
  "775070185",
  "36728069",
  "733977579",
  "36730042",
  "35498442",
  "97440461",
  "733980333",
  "35055531",
  "36950264",
  "86311313",
  "26481402",
  "97673277",
].filter((v, i, a) => a.indexOf(v) === i); // מסיר כפילויות

/* -------- helper funcs --------------------------------- */
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const hex = (s) => Buffer.from(s, "utf8").toString("hex").toUpperCase();
function post(path, body) {
  const data = JSON.stringify(body);
  return new Promise((ok, err) => {
    const req = https.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
      },
      (res) => {
        let o = "";
        res.on("data", (c) => (o += c));
        res.on("end", () => ok(o));
      }
    );
    req.on("error", err);
    req.write(data);
    req.end();
  });
}

/* -------- STEP 1: login -------------------------------- */
async function login() {
  const xml = await post("/rest/csta/startApplicationSession", {
    applicationInfo: {
      applicationID: APP,
      applicationSpecificInfo: {
        user: USER,
        pass: b64(PASS),
        appCnxnType: "THIRD_PARTY_CONNECTION",
      },
    },
    requestedProtocolVersions: { protocolVersion: [VER] },
    requestedSessionDuration: 300,
  });
  const m = xml.match(/<sessionID>(\d+)<\/sessionID>/);
  if (!m) throw new Error("login failed\n" + xml);
  console.log("🔑 sessionID =", m[1]);
  return m[1];
}

/* -------- STEP 2: individual monitorStart -------------- */
async function monitorOne(sid, ext) {
  const res = await post("/rest/csta/monitorStart", {
    sessionID: sid,
    monitorObject: { deviceObject: `N<${ext}>` },
    monitorType: "device",
    extensions: { security: { securityInfo: { string: hex(sid) } } },
  });
  if (/monitorCrossRefID/.test(res)) {
    console.log(`✅ ${ext} monitored`);
    return true;
  }
  console.log(`❌ ${ext} failed:`, res.trim().slice(0, 120));
  return false;
}

/* -------- STEP 3: combined monitorStart ---------------- */
async function monitorCombined(sid, good) {
  if (!good.length) {
    console.warn("⚠️  no valid extensions");
    return;
  }
  const list = "N<" + good.join(">,N<") + ">";
  const res = await post("/rest/csta/monitorStart", {
    sessionID: sid,
    monitorObject: { deviceObject: list },
    monitorType: "device",
    extensions: { security: { securityInfo: { string: hex(sid) } } },
  });
  console.log("\n📡 combined monitorStart reply:\n", res.trim());
}

/* -------- STEP 4: getEvents raw loop ------------------- */
function pollRaw(sid) {
  post("/rest/csta/getEvents", { sessionID: sid })
    .then((r) => {
      if (r.trim())
        console.log(`\n📨 ${new Date().toISOString()}:\n${r.trim()}`);
    })
    .catch((e) => console.error("getEvents error:", e.message))
    .finally(() => setImmediate(() => pollRaw(sid)));
}

/* -------- keep-alive & logout -------------------------- */
const keep = (sid) =>
  setInterval(
    () =>
      post("/rest/csta/resetApplicationSessionTimer", {
        sessionID: sid,
        requestedSessionDuration: 300,
      }).catch(() => {}),
    150_000
  );
const bye = (sid) =>
  post("/rest/csta/stopApplicationSession", {
    sessionID: sid,
    sessionEndReason: { definedEndReason: "normal", appEndReason: "by-script" },
  }).finally(() => process.exit());

/* -------- MAIN ----------------------------------------- */
(async () => {
  try {
    const sid = await login();
    const okList = [];
    for (const ext of ALL_EXT) {
      try {
        if (await monitorOne(sid, ext)) okList.push(ext);
      } catch (e) {
        console.error(`🛑 ${ext}:`, e.message);
      }
    }
    await monitorCombined(sid, okList);
    const ka = keep(sid);
    pollRaw(sid);
    process.on("SIGINT", () => {
      clearInterval(ka);
      bye(sid);
    });
    process.on("SIGTERM", () => {
      clearInterval(ka);
      bye(sid);
    });
  } catch (e) {
    console.error("FATAL:", e.message);
    process.exit(1);
  }
})();
