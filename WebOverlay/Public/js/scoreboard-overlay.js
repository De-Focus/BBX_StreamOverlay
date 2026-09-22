const socket = io();

let previousState = null;
let pointTimeout = null;
let lastShownPointId = 0;

const el = {
  scoreboard: document.getElementById("scoreboard"),

  player1Name: document.getElementById("player1Name"),
  player1Team: document.getElementById("player1Team"),
  player1Score: document.getElementById("player1Score"),
  player1SelectedBey: document.getElementById("player1SelectedBey"),

  player2Name: document.getElementById("player2Name"),
  player2Team: document.getElementById("player2Team"),
  player2Score: document.getElementById("player2Score"),
  player2SelectedBey: document.getElementById("player2SelectedBey"),

  p1Round1: document.getElementById("p1Round1"),
  p1Round2: document.getElementById("p1Round2"),
  p2Round1: document.getElementById("p2Round1"),
  p2Round2: document.getElementById("p2Round2"),

  eventInfo: document.getElementById("eventInfo"),
  targetScore: document.getElementById("targetScore"),
  lastPoint: document.getElementById("lastPoint")
};

function getSelectedBey(state, playerNumber) {
  const selected = state[`player${playerNumber}SelectedBey`] || "1";
  return state[`player${playerNumber}Bey${selected}`] || "";
}

function animate(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function showPointCallout(pointText) {
  clearTimeout(pointTimeout);

  el.lastPoint.textContent = pointText;
  el.lastPoint.classList.remove("hiddenPoint");
  animate(el.lastPoint, "flash");

  pointTimeout = setTimeout(() => {
    el.lastPoint.classList.add("hiddenPoint");
  }, 3000);
}

function renderRoundWins(state) {
  const p1Rounds = Number(state.player1Rounds || 0);
  const p2Rounds = Number(state.player2Rounds || 0);

  el.p1Round1.classList.toggle("hiddenRound", p1Rounds < 1);
  el.p1Round2.classList.toggle("hiddenRound", p1Rounds < 2);
  el.p2Round1.classList.toggle("hiddenRound", p2Rounds < 1);
  el.p2Round2.classList.toggle("hiddenRound", p2Rounds < 2);
}

function render(state) {
  el.scoreboard.classList.toggle("hidden", !state.scoreboardVisible);

  el.player1Name.textContent = state.player1Name || "PLAYER 1";
  el.player1Team.textContent = state.player1Team || "";
  el.player1Score.textContent = state.player1Score ?? 0;
  el.player1SelectedBey.textContent = getSelectedBey(state, 1);

  el.player2Name.textContent = state.player2Name || "PLAYER 2";
  el.player2Team.textContent = state.player2Team || "";
  el.player2Score.textContent = state.player2Score ?? 0;
  el.player2SelectedBey.textContent = getSelectedBey(state, 2);

  renderRoundWins(state);

  el.eventInfo.textContent = state.eventInfo || "";
  el.targetScore.textContent = state.targetScore || 4;

  if (previousState) {
    if (state.player1Score !== previousState.player1Score) {
      animate(el.player1Score, "bump");
    }

    if (state.player2Score !== previousState.player2Score) {
      animate(el.player2Score, "bump");
    }

    if (getSelectedBey(state, 1) !== getSelectedBey(previousState, 1)) {
      animate(el.player1SelectedBey, "bumpSmall");
    }

    if (getSelectedBey(state, 2) !== getSelectedBey(previousState, 2)) {
      animate(el.player2SelectedBey, "bumpSmall");
    }
  }

  if (
    state.lastPoint &&
    state.lastPointId &&
    state.lastPointId !== lastShownPointId
  ) {
    lastShownPointId = state.lastPointId;
    showPointCallout(state.lastPoint);
  }

  previousState = JSON.parse(JSON.stringify(state));
}

socket.on("overlayState", render);