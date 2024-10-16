import "./style.css";

const APP_NAME = "Hi";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.innerHTML = "Cool sketch thingy"
app.append(title);

const canvas = document.createElement("canvas");
canvas.classList.add('custom-canvas');
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

let isDrawing = false;
let x = 0;
let y = 0;

const context = canvas.getContext("2d");

canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function clearCanvas() {
    if (context){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", clearCanvas);
app.append(clearButton);
