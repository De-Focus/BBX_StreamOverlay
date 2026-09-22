window.refreshPage = function refreshPage(newState) {
  state = newState;

  [
    "nextEventInfo",
    "nextTargetScore",
    "nextMatchNotes",
    "nextPlayer1Name",
    "nextPlayer1Team",
    "nextPlayer1Bey1",
    "nextPlayer1Bey2",
    "nextPlayer1Bey3",
    "nextPlayer2Name",
    "nextPlayer2Team",
    "nextPlayer2Bey1",
    "nextPlayer2Bey2",
    "nextPlayer2Bey3"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = state[id] ?? "";
  });

  const p1Select = document.getElementById("nextPlayer1ProfileSelect");
  const p2Select = document.getElementById("nextPlayer2ProfileSelect");

  if (p1Select) p1Select.value = state.nextPlayer1ProfileId || "";
  if (p2Select) p2Select.value = state.nextPlayer2ProfileId || "";
};

[
  "nextEventInfo",
  "nextTargetScore",
  "nextMatchNotes",
  "nextPlayer1Name",
  "nextPlayer1Team",
  "nextPlayer1Bey1",
  "nextPlayer1Bey2",
  "nextPlayer1Bey3",
  "nextPlayer2Name",
  "nextPlayer2Team",
  "nextPlayer2Bey1",
  "nextPlayer2Bey2",
  "nextPlayer2Bey3"
].forEach(id => bindInput(id, id));

bindButton("applyNextP1Profile", () => {
  const profileId = document.getElementById("nextPlayer1ProfileSelect").value;
  socket.emit("applyNextProfile", { playerNumber: 1, profileId });
});

bindButton("applyNextP2Profile", () => {
  const profileId = document.getElementById("nextPlayer2ProfileSelect").value;
  socket.emit("applyNextProfile", { playerNumber: 2, profileId });
});

bindButton("loadNextMatch", () => socket.emit("loadNextMatch"));