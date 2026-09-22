const socket = io();

const ticker = document.getElementById("ticker");
const tickerText = document.getElementById("tickerText");

socket.on("overlayState", state => {
  ticker.classList.toggle("tickerHidden", !state.tickerVisible);

  const text =
    state.tickerText ||
    "WELCOME TO BEYBLADE LIVE  •  CHECK THE DISCORD FOR UPCOMING EVENTS";

  tickerText.textContent = `${text}  •  ${text}`;

  const speed = Number(state.tickerSpeed || 35);
  tickerText.style.animationDuration = `${speed}s`;
});