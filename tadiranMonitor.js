const axios = require("axios");

function createMonitor(options) {
  const cfg = {
    baseUrl: options.baseUrl,
    user: options.user,
    pass64: Buffer.from(options.pass).toString("base64"),
    monitoredExts: new Set(options.monitoredExts || []),
    onCall: options.onCall,
    keepAliveInterval: options.keepAliveInterval || 30_000,
  };

  let sessionID;

  /* 1️⃣  LOGIN */
  async function login() {
    const body = {
      applicationInfo: {
        applicationID: "generic-whatsapp-bot",
        applicationSpecificInfo: {
          user: cfg.user,
          pass: cfg.pass64,
          appCnxnType: "THIRD_PARTY_CONNECTION",
        },
      },
      requestedProtocolVersions: { protocolVersion: ["V1.0"] },
      requestedSessionDuration: 300,
    };

    const { data } = await axios.post(
      `${cfg.baseUrl}/rest/csta/startApplicationSession`,
      body
    );
    sessionID = data.sessionID;

    await startMonitor();
    setInterval(keepAlive, cfg.keepAliveInterval);
    poll();
  }

  /* 2️⃣  monitorStart */
  async function startMonitor() {
    if (cfg.monitoredExts.size === 0 || !sessionID) return;
    const list = "N<" + [...cfg.monitoredExts].join(">,N<") + ">,";
    await axios.post(`${cfg.baseUrl}/rest/csta/monitorStart`, {
      sessionID,
      monitorObject: { deviceObject: list },
      monitorType: "device",
    });
  }

  /* 3️⃣  getEvents loop */
  async function poll() {
    try {
      const { data } = await axios.post(
        `${cfg.baseUrl}/rest/csta/getEvents`,
        { sessionID }
      );
      (data?.DeliveredEvent || []).forEach(handleDeliveredEvent);
    } catch (err) {
      console.error("Tadiran poll error:", err.message);
    } finally {
      setImmediate(poll);
    }
  }

  function parseExt(deviceId) {
    return deviceId?.match(/^N<(\d+)/)?.[1];
  }

  async function handleDeliveredEvent(ev) {
    const caller = parseExt(ev.callingDevice?.deviceIdentifier);
    const called = parseExt(ev.calledDevice?.deviceIdentifier);
    if (!caller || !called) return;
    if (!cfg.monitoredExts.has(called)) return;     // we care only inbound
    if (typeof cfg.onCall === "function") {
      try {
        await cfg.onCall({ callerExt: caller, calledExt: called });
      } catch (e) {
        console.error("onCall callback failed:", e.message);
      }
    }
  }

  /* 4️⃣  keep-alive */
  function keepAlive() {
    axios
      .post(`${cfg.baseUrl}/rest/csta/resetApplicationSessionTimer`, {
        sessionID,
        requestedSessionDuration: 300,
      })
      .catch((e) => console.error("Tadiran keepAlive error:", e.message));
  }

  /* public helpers */
  function addExtension(ext) {
    cfg.monitoredExts.add(String(ext));
    startMonitor();
  }
  function removeExtension(ext) {
    cfg.monitoredExts.delete(String(ext));
  }

  return { login, addExtension, removeExtension };
}

module.exports.init = function (opts) {
  const monitor = createMonitor(opts);
  monitor.login().catch((err) =>
    console.error("Tadiran login failed:", err.message)
  );
  return monitor;
};
