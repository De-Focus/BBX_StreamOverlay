const socket = io();

let profiles = [];

function getProfile(id) {
  return profiles.find(profile => profile.id === id) || {};
}

function selectedBey(state, playerNumber) {
  const selected = state[`player${playerNumber}SelectedBey`] || "1";
  return state[`player${playerNumber}Bey${selected}`] || "";
}

socket.on("profiles", newProfiles => {
  profiles = newProfiles || [];
});

socket.on("overlayState", state => {
  const p1Profile = getProfile(state.player1ProfileId);
  const p2Profile = getProfile(state.player2ProfileId);

  document.getElementById("assistMatch").textContent =
    `${state.eventInfo || "ROUND 1"} | FIRST TO ${state.targetScore || 4}`;

  document.getElementById("assistP1Name").textContent = state.player1Name || "PLAYER 1";
  document.getElementById("assistP2Name").textContent = state.player2Name || "PLAYER 2";
  document.getElementById("assistP1Score").textContent = state.player1Score ?? 0;
  document.getElementById("assistP2Score").textContent = state.player2Score ?? 0;

  document.getElementById("assistP1Team").textContent = state.player1Team || "";
  document.getElementById("assistP2Team").textContent = state.player2Team || "";

  document.getElementById("assistP1Bey").textContent = selectedBey(state, 1) || "No selected Bey";
  document.getElementById("assistP2Bey").textContent = selectedBey(state, 2) || "No selected Bey";

  document.getElementById("assistP1Playstyle").textContent = p1Profile.playstyle || "";
  document.getElementById("assistP2Playstyle").textContent = p2Profile.playstyle || "";

  document.getElementById("assistP1Signature").textContent = p1Profile.signatureBey || "";
  document.getElementById("assistP2Signature").textContent = p2Profile.signatureBey || "";

  document.getElementById("assistP1Result").textContent = p1Profile.recentResult || "";
  document.getElementById("assistP2Result").textContent = p2Profile.recentResult || "";

  document.getElementById("assistP1Note").textContent = p1Profile.note || p1Profile.funFact || "";
  document.getElementById("assistP2Note").textContent = p2Profile.note || p2Profile.funFact || "";

  document.getElementById("assistNextUp").textContent =
    `${state.nextEventInfo || "NEXT MATCH"}: ${state.nextPlayer1Name || "PLAYER 1"} vs ${state.nextPlayer2Name || "PLAYER 2"} — ${state.nextMatchNotes || ""}`;
});