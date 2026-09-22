function setScore(player, amount) {
  const key = `${player}Score`;
  const next = Math.max(0, Number(state[key] || 0) + amount);
  update({ [key]: next });
}

window.refreshPage = function refreshPage(newState) {
  state = newState;

  document.getElementById("currentP1").textContent = state.player1Name || "PLAYER 1";
  document.getElementById("currentP2").textContent = state.player2Name || "PLAYER 2";
  document.getElementById("currentP1Score").textContent = state.player1Score ?? 0;
  document.getElementById("currentP2Score").textContent = state.player2Score ?? 0;

  document.getElementById("player1Score").textContent = state.player1Score ?? 0;
  document.getElementById("player2Score").textContent = state.player2Score ?? 0;

  document.getElementById("player1SelectedBey").value = state.player1SelectedBey || "1";
  document.getElementById("player2SelectedBey").value = state.player2SelectedBey || "1";

document.querySelectorAll(".roundButton").forEach(button => {
  button.addEventListener("click", () => {
    socket.emit("roundWin", {
      player: button.dataset.player,
      amount: Number(button.dataset.amount)
    });
  });
});

bindButton("resetRounds", () => {
  socket.emit("resetRounds");
});

  document.getElementById("player1SelectedPreview").textContent =
    selectedBey(1) || "No Bey selected / slot is blank";

  document.getElementById("player2SelectedPreview").textContent =
    selectedBey(2) || "No Bey selected / slot is blank";

  document.getElementById("autoReplayStatus").textContent =
    `Auto Replay: ${state.autoReplayOnScore ? "On" : "Off"}`;
};

bindSelect("player1SelectedBey", "player1SelectedBey");
bindSelect("player2SelectedBey", "player2SelectedBey");

bindButton("p1Minus", () => setScore("player1", -1));
bindButton("p1Plus1", () => setScore("player1", 1));
bindButton("p1Plus2", () => setScore("player1", 2));
bindButton("p1Plus3", () => setScore("player1", 3));

bindButton("p2Minus", () => setScore("player2", -1));
bindButton("p2Plus1", () => setScore("player2", 1));
bindButton("p2Plus2", () => setScore("player2", 2));
bindButton("p2Plus3", () => setScore("player2", 3));

bindButton("p1WinsRound", () => socket.emit("playerWinsRound", { player: "player1" }));
bindButton("p2WinsRound", () => socket.emit("playerWinsRound", { player: "player2" }));
bindButton("p1WinsMatch", () => socket.emit("playerWinsMatch", { player: "player1" }));
bindButton("p2WinsMatch", () => socket.emit("playerWinsMatch", { player: "player2" }));

bindButton("resetScores", () => socket.emit("resetScores"));
bindButton("resetRounds", () => socket.emit("resetRounds"));
bindButton("undo", () => socket.emit("undo"));
bindButton("triggerReplay", () => socket.emit("triggerReplay"));

bindButton("toggleAutoReplay", () => {
  update({ autoReplayOnScore: !state.autoReplayOnScore });
});

bindButton("clearWinner", () => {
  update({
    winner: "",
    winnerVisible: false
  });
});

bindButton("swapPlayers", () => {
  update({
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
  });
});