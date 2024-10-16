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

let drawing: Array<Array<{ x: number; y: number }>> = [];
let currentStroke: Array<{ x: number; y: number }> = [];
let redo: Array<Array<{ x: number; y: number }>> = [];

let isDrawing = false;

const context = canvas.getContext("2d");

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentStroke = [];
    const point = { x: e.offsetX, y: e.offsetY };
    currentStroke.push(point);
  });
  
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const point = { x: e.offsetX, y: e.offsetY };
      currentStroke.push(point);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });
  
  window.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      if (currentStroke.length > 0) {
        drawing.push(currentStroke);
        currentStroke = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
      }
    }
  });
  
  canvas.addEventListener("drawing-changed", () => {
    if (context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        let copy = [...drawing];
        copy.push(currentStroke);
        for (const stroke of copy) {
            context.beginPath();
            for (let i = 0; i < stroke.length; i++) {
                const { x, y } = stroke[i];
                if (i === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
        }
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
        }
    }
  });

function clearCanvas() {
    if (context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawing = [];
    }
}

function undoCanvas() {
    if (drawing.length > 0){
        const pop = drawing.pop();
        if (pop) {
            redo.push(pop);
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    else if (currentStroke.length > 0){
        currentStroke = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

function redoCanvas() {
    if (redo.length > 0) {
        const pop = redo.pop();
        if (pop){
            drawing.push(pop);
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", clearCanvas);
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", undoCanvas);
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", redoCanvas);
app.append(redoButton);