const socket = io();

socket.on("overlayState", state => {
  const nextMatch = document.getElementById("nextMatch");

  if (nextMatch) {
    nextMatch.classList.toggle("hiddenSide", !state.nextMatchVisible);

    document.getElementById("nextEventInfo").textContent =
      state.nextEventInfo || "ROUND 1";

    document.getElementById("nextPlayer1Name").textContent =
      state.nextPlayer1Name || "PLAYER 1";

    document.getElementById("nextPlayer1Team").textContent =
      state.nextPlayer1Team || "";

    document.getElementById("nextPlayer2Name").textContent =
      state.nextPlayer2Name || "PLAYER 2";

    document.getElementById("nextPlayer2Team").textContent =
      state.nextPlayer2Team || "";

    document.getElementById("nextTargetScore").textContent =
      `FIRST TO ${state.nextTargetScore || 4}`;

    document.getElementById("nextMatchNotes").textContent =
      state.nextMatchNotes || "";
  }

  const lowerThird = document.getElementById("lowerThird");

  if (lowerThird) {
    lowerThird.classList.toggle("hiddenSide", !state.lowerThirdVisible);

    document.getElementById("lowerName").textContent =
      state.lowerThirdName || "PLAYER NAME";

    document.getElementById("lowerSub").textContent =
      state.lowerThirdSub || "";
  }

  const winnerCard = document.getElementById("winnerCard");

  if (winnerCard) {
    winnerCard.classList.toggle("winnerHidden", !state.winnerVisible);

    document.getElementById("winnerName").textContent =
      state.winner || "PLAYER NAME";
  }

  const judgeCall = document.getElementById("judgeCall");

  if (judgeCall) {
    judgeCall.classList.toggle("judgeHidden", !state.judgeCallVisible);

    document.getElementById("judgeCallText").textContent =
      state.judgeCallText || "JUDGE REVIEW";
  }
});