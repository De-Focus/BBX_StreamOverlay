const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const playersPath = path.join(__dirname, "public", "data", "players.json");

function cleanSortName(name) {
  return String(name || "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();
}

function loadProfiles() {
  try {
    const raw = fs.readFileSync(playersPath, "utf8");
    const parsed = JSON.parse(raw);

    return (parsed.players || []).sort((a, b) => {
      return cleanSortName(a.name).localeCompare(cleanSortName(b.name));
    });
  } catch (error) {
    console.warn("Could not load players.json:", error.message);
    return [];
  }
}

let profiles = loadProfiles();

let state = {
  eventInfo: "SWISS",
  targetScore: 5,

  player1ProfileId: "",
  player1Name: "PLAYER 1",
  player1Team: "",
  player1Score: 0,
  player1Rounds: 0,
  player1Bey1: "",
  player1Bey2: "",
  player1Bey3: "",
  player1SelectedBey: "1",

  player2ProfileId: "",
  player2Name: "PLAYER 2",
  player2Team: "",
  player2Score: 0,
  player2Rounds: 0,
  player2Bey1: "",
  player2Bey2: "",
  player2Bey3: "",
  player2SelectedBey: "1",

  lastPoint: "",
  lastPointId: 0,

  winner: "",

  lowerThirdName: "#Discount Code",
  lowerThirdSub: "website1 | website2",

  nextEventInfo: "NEXT MATCH",
  nextTargetScore: 5,
  nextPlayer1ProfileId: "",
  nextPlayer1Name: "PLAYER 1",
  nextPlayer1Team: "",
  nextPlayer1Bey1: "",
  nextPlayer1Bey2: "",
  nextPlayer1Bey3: "",
  nextPlayer2ProfileId: "",
  nextPlayer2Name: "PLAYER 2",
  nextPlayer2Team: "",
  nextPlayer2Bey1: "",
  nextPlayer2Bey2: "",
  nextPlayer2Bey3: "",
  nextMatchNotes: "",

  judgeCallText: "JUDGE REVIEW",

  tickerCategory: "general",
  tickerText: "WELCOME TO BEYBLADE LIVE  •  GOOD LUCK BLADERS",
  tickerSpeed: 35,

  autoReplayOnScore: true,

  scoreboardVisible: true,
  nextMatchVisible: false,
  lowerThirdVisible: false,
  winnerVisible: false,
  judgeCallVisible: false,
  tickerVisible: true
};

const history = [];

const tickerPresets = {
  general: [
    "WELCOME TO BEYBLADE LIVE",
    "GOOD LUCK BLADERS",
    "CHECK THE DISCORD FOR UPCOMING EVENTS",
    "NEW PLAYERS WELCOME"
  ],
promo: [
    "Next tournament in 1 month!",
    "November 9th",
    "CHECK THE DISCORD FOR UPCOMING EVENTS",
    "Bring your team"
  ],

  points: [
    "SPIN FINISH: WIN WHEN THE OPPONENT STOPS SPINNING FIRST",
    "OVER FINISH: KNOCK THE OPPONENT INTO A POCKET",
    "XTREME FINISH: A HIGH-VALUE STADIUM EXIT",
    "EACH BEY HAS A BLADE, RATCHET, AND BIT"
  ],
  venue: [
    "RESPECT THE VENUE",
    "KEEP WALKWAYS CLEAR",
    "ASK STAFF BEFORE MOVING TABLES OR EQUIPMENT",
    "THANK YOU TO OUR HOST VENUE"
  ],
  stream: [
    "FOLLOW FOR MORE BEYBLADE STREAMS",
    "CLIPS AND VODS WILL BE POSTED AFTER THE EVENT",
    "FINALS WILL BE STREAMED AFTER SWISS ROUNDS",
    "SHARE THE STREAM WITH YOUR LOCAL BLADERS"
  ],
  meta: [
    "WATCH THE OPENING LAUNCH ANGLE",
    "ATTACK TYPES NEED EARLY CONTACT",
    "STAMINA TYPES WANT TO SURVIVE THE FIRST HIT",
    "SELECTED BEYS ARE SHOWN ON THE SCOREBOARD"
  ]
};

function saveHistory() {
  history.push(JSON.parse(JSON.stringify(state)));
  if (history.length > 60) history.shift();
}

function swapPlayers() {
  saveHistory();

  state = {
    ...state,

    player1ProfileId: state.player2ProfileId,
    player1Name: state.player2Name,
    player1Team: state.player2Team,
    player1Score: state.player2Score,
    player1Rounds: state.player2Rounds,
    player1Bey1: state.player2Bey1,
    player1Bey2: state.player2Bey2,
    player1Bey3: state.player2Bey3,
    player1SelectedBey: state.player2SelectedBey,

    player2ProfileId: state.player1ProfileId,
    player2Name: state.player1Name,
    player2Team: state.player1Team,
    player2Score: state.player1Score,
    player2Rounds: state.player1Rounds,
    player2Bey1: state.player1Bey1,
    player2Bey2: state.player1Bey2,
    player2Bey3: state.player1Bey3,
    player2SelectedBey: state.player1SelectedBey
  };

  emitState();
}


function emitState() {
  io.emit("overlayState", state);
}

function updateOverlay(changes) {
  saveHistory();
  state = { ...state, ...changes };
  emitState();
}

function getProfile(id) {
  return profiles.find(player => player.id === id);
}

function applyProfileToPlayer(playerNumber, profileId) {
  const profile = getProfile(profileId);

  if (!profile) return;

  const prefix = `player${playerNumber}`;

  state = {
    ...state,
    [`${prefix}ProfileId`]: profile.id,
    [`${prefix}Name`]: profile.name || `PLAYER ${playerNumber}`,
    [`${prefix}Team`]: profile.team || ""
  };
}

function applyProfileToNextPlayer(playerNumber, profileId) {
  const profile = getProfile(profileId);
  if (!profile) return;

  const prefix = `nextPlayer${playerNumber}`;

  state = {
    ...state,
    [`${prefix}ProfileId`]: profile.id,
    [`${prefix}Name`]: profile.name || `PLAYER ${playerNumber}`,
    [`${prefix}Team`]: profile.team || ""
  };
}

function triggerObsReplayHotkey() {
  const script = `
    $wshell = New-Object -ComObject wscript.shell;
    Start-Sleep -Milliseconds 100;
    $activated = $wshell.AppActivate('OBS');
    Start-Sleep -Milliseconds 150;
    if ($activated) {
      $wshell.SendKeys('^+s');
    }
  `;

  exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script.replace(/\n/g, " ")}"`, error => {
    if (error) {
      console.warn("Replay hotkey trigger failed:", error.message);
    }
  });
}

function scorePoint(player, points, callout) {
  saveHistory();

  const scoreKey = `${player}Score`;
  const currentScore = Number(state[scoreKey] || 0);

  state = {
    ...state,
    [scoreKey]: Math.max(0, currentScore + Number(points || 0)),
    lastPoint: callout || "",
    lastPointId: Date.now()
  };

  emitState();

  if (state.autoReplayOnScore) {
    triggerObsReplayHotkey();
  }
}

function roundWin(player, amount) {
  saveHistory();

  const key = `${player}Rounds`;
  const currentRounds = Number(state[key] || 0);

  state = {
    ...state,
    [key]: Math.max(0, Math.min(2, currentRounds + Number(amount || 0)))
  };

  emitState();
}

function playerWinsRound(player) {
  saveHistory();

  const roundKey = `${player}Rounds`;
  const scoreKey1 = "player1Score";
  const scoreKey2 = "player2Score";
  const currentRounds = Number(state[roundKey] || 0);
  const label = player === "player1" ? "P1 WINS ROUND" : "P2 WINS ROUND";

  state = {
    ...state,
    [roundKey]: Math.max(0, Math.min(2, currentRounds + 1)),
    [scoreKey1]: 0,
    [scoreKey2]: 0,
    lastPoint: label,
    lastPointId: Date.now()
  };

  emitState();
}

function playerWinsMatch(player) {
  const winnerName =
    player === "player1"
      ? state.player1Name || "PLAYER 1"
      : state.player2Name || "PLAYER 2";

  updateOverlay({
    winner: winnerName,
    winnerVisible: true
  });
}

function resetScores() {
  saveHistory();

  state = {
    ...state,
    player1Score: 0,
    player2Score: 0,
    lastPoint: "",
    lastPointId: 0,
    winner: "",
    winnerVisible: false
  };

  emitState();
}

function resetRounds() {
  saveHistory();

  state = {
    ...state,
    player1Rounds: 0,
    player2Rounds: 0
  };

  emitState();
}

function loadNextMatch() {
  saveHistory();

  state = {
    ...state,

    eventInfo: state.nextEventInfo || "ROUND 1",
    targetScore: state.nextTargetScore || 4,

    player1ProfileId: state.nextPlayer1ProfileId || "",
    player1Name: state.nextPlayer1Name || "PLAYER 1",
    player1Team: state.nextPlayer1Team || "",
    player1Score: 0,
    player1Rounds: 0,
    player1Bey1: state.nextPlayer1Bey1 || "",
    player1Bey2: state.nextPlayer1Bey2 || "",
    player1Bey3: state.nextPlayer1Bey3 || "",
    player1SelectedBey: "1",

    player2ProfileId: state.nextPlayer2ProfileId || "",
    player2Name: state.nextPlayer2Name || "PLAYER 2",
    player2Team: state.nextPlayer2Team || "",
    player2Score: 0,
    player2Rounds: 0,
    player2Bey1: state.nextPlayer2Bey1 || "",
    player2Bey2: state.nextPlayer2Bey2 || "",
    player2Bey3: state.nextPlayer2Bey3 || "",
    player2SelectedBey: "1",

    lastPoint: "",
    lastPointId: 0,
    winner: "",
    winnerVisible: false,
    nextMatchVisible: false,
    scoreboardVisible: true
  };

  emitState();
}

function getSelectedBey(playerNumber) {
  const selectedSlot = state[`player${playerNumber}SelectedBey`] || "1";
  return state[`player${playerNumber}Bey${selectedSlot}`] || "";
}

function setTickerCategory(category) {
  const preset = tickerPresets[category];
  if (!preset) return;

  state = {
    ...state,
    tickerCategory: category,
    tickerText: preset.join("  •  ")
  };
}

io.on("connection", socket => {
  socket.emit("overlayState", state);
  socket.emit("profiles", profiles);
  socket.emit("tickerPresets", tickerPresets);

  socket.on("update", changes => {
    updateOverlay(changes);
  });

socket.on("applyProfile", data => {
  saveHistory();

  applyProfileToPlayer(data.playerNumber, data.profileId);

  emitState();
});

  socket.on("scorePoint", data => {
    scorePoint(data.player, data.points, data.callout);
  });

  socket.on("roundWin", data => {
    roundWin(data.player, data.amount);
  });

  socket.on("playerWinsRound", data => {
    playerWinsRound(data.player);
  });

  socket.on("playerWinsMatch", data => {
    playerWinsMatch(data.player);
  });

  socket.on("resetScores", () => resetScores());
  socket.on("resetRounds", () => resetRounds());

  socket.on("undo", () => {
    const previous = history.pop();
    if (previous) {
      state = previous;
      emitState();
    }
  });

  socket.on("loadNextMatch", () => loadNextMatch());

  socket.on("applyProfile", data => {
    saveHistory();
    applyProfileToPlayer(data.playerNumber, data.profileId);
    emitState();
  });

  socket.on("applyNextProfile", data => {
    saveHistory();
    applyProfileToNextPlayer(data.playerNumber, data.profileId);
    emitState();
  });

  socket.on("setTickerCategory", category => {
    saveHistory();
    setTickerCategory(category);
    emitState();
  });

  socket.on("triggerReplay", () => {
    triggerObsReplayHotkey();
  });

  socket.on("reloadProfiles", () => {
    profiles = loadProfiles();
    io.emit("profiles", profiles);
  });
});

/* ---------------- API ---------------- */

app.get("/api/state", (req, res) => res.json(state));
app.get("/api/profiles", (req, res) => res.json({ players: profiles }));
app.get("/api/ticker-presets", (req, res) => res.json(tickerPresets));

app.get("/api/value/:key", (req, res) => {
  const key = req.params.key;
  if (!(key in state)) return res.status(400).send("Invalid key");
  res.type("text/plain").send(String(state[key] ?? ""));
});

app.get("/api/swap-players", (req, res) => {
  swapPlayers();

  res.json({
    ok: true,
    action: "swap-players"
  });
});

app.get("/api/selected-bey/:player", (req, res) => {
  if (req.params.player === "p2" || req.params.player === "player2") {
    return res.type("text/plain").send(getSelectedBey(2));
  }

  res.type("text/plain").send(getSelectedBey(1));
});

app.post("/api/update", (req, res) => {
  updateOverlay(req.body || {});
  res.json({ ok: true, state });
});

app.get("/api/score/:player/:finish", (req, res) => {
  const playerMap = {
    p1: "player1",
    p2: "player2",
    player1: "player1",
    player2: "player2"
  };

  const finishMap = {
    spin: { points: 1, label: "Spin Finish" },
    over: { points: 2, label: "Over Finish" },
    burst: { points: 2, label: "Burst Finish" },
    xtreme: { points: 3, label: "Xtreme Finish" },
    penalty: { points: 1, label: "Penalty" }
  };

  const player = playerMap[req.params.player];
  const finish = finishMap[req.params.finish];

  if (!player || !finish) {
    return res.status(400).json({ ok: false, error: "Invalid player or finish" });
  }

  const playerLabel = player === "player1" ? "P1" : "P2";

  scorePoint(
    player,
    finish.points,
    `${playerLabel} ${finish.label} +${finish.points}`
  );

  res.json({ ok: true });
});

app.get("/api/win-round/:player", (req, res) => {
  const player = req.params.player === "p2" ? "player2" : "player1";
  playerWinsRound(player);
  res.json({ ok: true });
});

app.get("/api/win-match/:player", (req, res) => {
  const player = req.params.player === "p2" ? "player2" : "player1";
  playerWinsMatch(player);
  res.json({ ok: true });
});

app.get("/api/replay", (req, res) => {
  triggerObsReplayHotkey();
  res.json({ ok: true, action: "trigger-replay" });
});

app.get("/api/ticker/:category", (req, res) => {
  if (!tickerPresets[req.params.category]) {
    return res.status(400).json({ ok: false, error: "Invalid ticker category" });
  }

  updateOverlay({
    tickerCategory: req.params.category,
    tickerText: tickerPresets[req.params.category].join("  •  ")
  });

  res.json({ ok: true });
});

app.get("/api/toggle/:overlay/:mode", (req, res) => {
  const overlayMap = {
    scoreboard: "scoreboardVisible",
    next: "nextMatchVisible",
    nextmatch: "nextMatchVisible",
    lower: "lowerThirdVisible",
    lowerthird: "lowerThirdVisible",
    winner: "winnerVisible",
    judge: "judgeCallVisible",
    judgecall: "judgeCallVisible",
    ticker: "tickerVisible"
  };

  const key = overlayMap[req.params.overlay];
  const mode = req.params.mode;

  if (!key || !["show", "hide"].includes(mode)) {
    return res.status(400).json({ ok: false });
  }

  updateOverlay({ [key]: mode === "show" });
  res.json({ ok: true });
});

app.get("/api/judge/:call", (req, res) => {
  const callMap = {
    review: "JUDGE REVIEW",
    reshoot: "RESHOOT",
    penalty: "PENALTY",
    deckcheck: "DECK CHECK",
    equipment: "EQUIPMENT CHECK",
    paused: "MATCH PAUSED"
  };

  const text = callMap[req.params.call] || req.params.call.toUpperCase();

  updateOverlay({
    judgeCallText: text,
    judgeCallVisible: true
  });

  res.json({ ok: true });
});

app.get("/api/reset-scores", (req, res) => {
  resetScores();
  res.json({ ok: true });
});

app.get("/api/reset-rounds", (req, res) => {
  resetRounds();
  res.json({ ok: true });
});

app.get("/api/undo", (req, res) => {
  const previous = history.pop();
  if (previous) {
    state = previous;
    emitState();
  }
  res.json({ ok: true });
});

app.get("/api/load-next-match", (req, res) => {
  loadNextMatch();
  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log("Beyblade Overlay V3 running at http://localhost:3000");
  console.log("Home: http://localhost:3000/index.html");
});