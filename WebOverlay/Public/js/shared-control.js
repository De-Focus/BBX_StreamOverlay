const socket = io();

let state = {};
let profiles = [];

function update(changes) {
  state = { ...state, ...changes };
  socket.emit("update", changes);
}

function bindButton(id, action) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("click", action);
}

function bindInput(id, key) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("input", () => {
    const value = el.type === "number" ? Number(el.value) : el.value;
    update({ [key]: value });
  });
}

function bindSelect(id, key) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("change", () => {
    update({ [key]: el.value });
  });
}

function populateProfileSelect(id) {
  const select = document.getElementById(id);
  if (!select) return;

  const current = select.value;

  select.innerHTML = `<option value="">Manual / No Profile</option>`;

  profiles.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.team ? `${profile.name} [${profile.team}]` : profile.name;
    select.appendChild(option);
  });

  select.value = current;
}

function selectedBey(playerNumber) {
  const selected = state[`player${playerNumber}SelectedBey`] || "1";
  return state[`player${playerNumber}Bey${selected}`] || "";
}

socket.on("overlayState", newState => {
  state = newState;

  if (typeof window.refreshPage === "function") {
    window.refreshPage(state);
  }
});

function cleanSortName(name) {
  return String(name || "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();
}

socket.on("profiles", newProfiles => {
  profiles = (newProfiles || []).sort((a, b) => {
    return cleanSortName(a.name).localeCompare(cleanSortName(b.name));
  });

  [
    "player1ProfileSelect",
    "player2ProfileSelect",
    "nextPlayer1ProfileSelect",
    "nextPlayer2ProfileSelect"
  ].forEach(populateProfileSelect);

  if (typeof window.refreshPage === "function") {
    window.refreshPage(state);
  }
});

document.addEventListener("click", event => {
  const toggle = event.target.closest(".toggleButton");
  if (toggle) {
    update({
      [toggle.dataset.key]: toggle.dataset.value === "true"
    });
  }

  const score = event.target.closest(".scorePoint");
  if (score) {
    socket.emit("scorePoint", {
      player: score.dataset.player,
      points: Number(score.dataset.points),
      callout: score.dataset.callout
    });
  }

  const point = event.target.closest(".pointButton");
  if (point) {
    update({
      lastPoint: point.dataset.point,
      lastPointId: Date.now()
    });
  }

  const judge = event.target.closest(".judgeButton");
  if (judge) {
    update({
      judgeCallText: judge.dataset.call,
      judgeCallVisible: true
    });
  }

  const ticker = event.target.closest(".tickerCategory");
  if (ticker) {
    socket.emit("setTickerCategory", ticker.dataset.category);
  }
});