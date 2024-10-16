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

class MarkerLine {
    private points: Array<{ x: number; y: number }>;
    private thickness: number;
  
    constructor(initialX: number, initialY: number, thickness: number) {
      this.points = [{ x: initialX, y: initialY }];
      this.thickness = thickness;
    }
  
    drag(x: number, y: number) {
      this.points.push({ x, y });
    }
  
    display(ctx: CanvasRenderingContext2D) {
      if (this.points.length === 0) return;
  
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
  
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
  
      ctx.strokeStyle = "black";
      ctx.lineWidth = this.thickness;
      ctx.stroke();
      ctx.closePath();
    }
}  
  
let currentThickness = 3;

let drawing: Array<MarkerLine> = [];
let currentStroke: MarkerLine | null = null;
let redo: Array<MarkerLine> = [];

let isDrawing = false;

const context = canvas.getContext("2d");

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentStroke = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
});
  
canvas.addEventListener("mousemove", (e) => {
  if (currentStroke && isDrawing) {
    currentStroke.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});
  
  window.addEventListener("mouseup", () => {
    if (isDrawing && currentStroke) {
      isDrawing = false;
      drawing.push(currentStroke);
      currentStroke = null;
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });
  
  canvas.addEventListener("drawing-changed", () => {
    if (context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        let copy = [...drawing];
        if (currentStroke){
          copy.push(currentStroke);
        }
        for (const stroke of copy) {
            stroke.display(context);
        }
    }
  });

function clearCanvas() {
    if (context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        // confused if slides want clear->undo to be viable...
        drawing = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
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
    else if (currentStroke){
        currentStroke = null;
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

function setMarkerThickness(thickness: number, selectedButton: HTMLButtonElement) {
    if (selectedButton.classList.contains("selectedTool")){
        currentThickness = 3;
        selectedButton.classList.remove("selectedTool");
        return;
    }
    currentThickness = thickness;
    document.querySelectorAll(".tool-button").forEach(button => button.classList.remove("selectedTool"));
    selectedButton.classList.add("selectedTool");
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", clearCanvas);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", undoCanvas);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", redoCanvas);

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin Marker";
thinButton.classList.add("tool-button");
thinButton.addEventListener("click", () => setMarkerThickness(1, thinButton));

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Marker";
thickButton.classList.add("tool-button");
thickButton.addEventListener("click", () => setMarkerThickness(6, thickButton));

app.append(thinButton, thickButton, clearButton, undoButton, redoButton);