/* match-info-control.js */

let matchInfoState = {};
let matchInfoProfiles = [];

const matchInfoSocket = typeof socket !== "undefined" ? socket : io();

function sendUpdate(changes) {
  matchInfoState = {
    ...matchInfoState,
    ...changes
  };

  matchInfoSocket.emit("update", changes);
}

function safeBindInput(id, key) {
  const element = document.getElementById(id);

  if (!element) {
    console.warn(`Missing input: ${id}`);
    return;
  }

  element.addEventListener("input", () => {
    const value = element.type === "number"
      ? Number(element.value)
      : element.value;

    sendUpdate({
      [key]: value
    });
  });
}

function safeBindButton(id, action) {
  const button = document.getElementById(id);

  if (!button) {
    console.warn(`Missing button: ${id}`);
    return;
  }

  button.addEventListener("click", action);
}

function cleanSortName(name) {
  return String(name || "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();
}

function populateProfileSelect(selectId, selectedValue) {
  const select = document.getElementById(selectId);

  if (!select) {
    console.warn(`Missing profile select: ${selectId}`);
    return;
  }

  const currentValue = selectedValue || select.value || "";

  select.innerHTML = "";

  const manualOption = document.createElement("option");
  manualOption.value = "";
  manualOption.textContent = "Manual / No Profile";
  select.appendChild(manualOption);

  const sortedProfiles = [...matchInfoProfiles].sort((a, b) => {
    return cleanSortName(a.name).localeCompare(cleanSortName(b.name));
  });

  sortedProfiles.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.team
      ? `${profile.name} [${profile.team}]`
      : profile.name;

    select.appendChild(option);
  });

  select.value = currentValue;
}

function refreshMatchInfoPage(newState) {
  matchInfoState = newState;

  const fields = [
    "eventInfo",
    "targetScore",

    "player1Name",
    "player1Team",
    "player1Bey1",
    "player1Bey2",
    "player1Bey3",

    "player2Name",
    "player2Team",
    "player2Bey1",
    "player2Bey2",
    "player2Bey3",

    "lowerThirdName",
    "lowerThirdSub",

    "tickerText",
    "tickerSpeed"
  ];

  fields.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;

    element.value = matchInfoState[id] ?? "";
  });

  populateProfileSelect("player1ProfileSelect", matchInfoState.player1ProfileId);
  populateProfileSelect("player2ProfileSelect", matchInfoState.player2ProfileId);
}

matchInfoSocket.on("overlayState", refreshMatchInfoPage);

matchInfoSocket.on("profiles", profiles => {
  matchInfoProfiles = profiles || [];

  populateProfileSelect("player1ProfileSelect", matchInfoState.player1ProfileId);
  populateProfileSelect("player2ProfileSelect", matchInfoState.player2ProfileId);
});

/* Match setup */
safeBindInput("eventInfo", "eventInfo");
safeBindInput("targetScore", "targetScore");

/* Player 1 info */
safeBindInput("player1Name", "player1Name");
safeBindInput("player1Team", "player1Team");
safeBindInput("player1Bey1", "player1Bey1");
safeBindInput("player1Bey2", "player1Bey2");
safeBindInput("player1Bey3", "player1Bey3");

/* Player 2 info */
safeBindInput("player2Name", "player2Name");
safeBindInput("player2Team", "player2Team");
safeBindInput("player2Bey1", "player2Bey1");
safeBindInput("player2Bey2", "player2Bey2");
safeBindInput("player2Bey3", "player2Bey3");

/* Lower third */
safeBindInput("lowerThirdName", "lowerThirdName");
safeBindInput("lowerThirdSub", "lowerThirdSub");

/* Ticker */
safeBindInput("tickerText", "tickerText");
safeBindInput("tickerSpeed", "tickerSpeed");

/* Apply player profiles */
safeBindButton("applyP1Profile", () => {
  const select = document.getElementById("player1ProfileSelect");
  const profileId = select ? select.value : "";

  matchInfoSocket.emit("applyProfile", {
    playerNumber: 1,
    profileId
  });
});

safeBindButton("applyP2Profile", () => {
  const select = document.getElementById("player2ProfileSelect");
  const profileId = select ? select.value : "";

  matchInfoSocket.emit("applyProfile", {
    playerNumber: 2,
    profileId
  });
});

/* Ticker category buttons */
document.querySelectorAll(".tickerCategory").forEach(button => {
  button.addEventListener("click", () => {
    matchInfoSocket.emit("setTickerCategory", button.dataset.category);
  });
});

/* Overlay toggles */
document.querySelectorAll(".toggleButton").forEach(button => {
  button.addEventListener("click", () => {
    sendUpdate({
      [button.dataset.key]: button.dataset.value === "true"
    });
  });
});

/* Match controls */
safeBindButton("undo", () => {
  matchInfoSocket.emit("undo");
});

safeBindButton("resetScores", () => {
  matchInfoSocket.emit("resetScores");
});

safeBindButton("loadNextMatch", () => {
  matchInfoSocket.emit("loadNextMatch");
});