import "./style.css";

const APP_NAME = "cool sketch thingy";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;
const title = document.createElement("h1");
title.innerHTML = APP_NAME
app.append(title);

const canvas = document.createElement("canvas");
canvas.classList.add("custom-canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const boxContainer = document.createElement("div")
const upperBox = document.createElement("div");
const lowerBox = document.createElement("div");

app.append(boxContainer);
boxContainer.classList.add("boxContainer");

boxContainer.append(upperBox);
boxContainer.append(lowerBox);



interface MarkerLine {
  points: Array<{ x: number; y: number }>;
  thickness: number;
  drag: (x: number, y: number) => void;
  display: (ctx: CanvasRenderingContext2D) => void;
}

interface ToolPreview {
  x: number;
  y: number;
  thickness: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

interface Sticker {
  x: number;
  y: number;
  emoji: string;
  drag: (x: number, y: number) => void;
  display: (ctx: CanvasRenderingContext2D) => void;
}

function createMarkerLine(
  initialX: number,
  initialY: number,
  thickness: number,
  color: string
): MarkerLine {
  const points: Array<{ x: number; y: number }> = [{ x: initialX, y: initialY }];
  return {
    points,
    thickness,
    drag(x: number, y: number) {
      points.push({ x, y });
    },
    display(ctx: CanvasRenderingContext2D) {
      if (this.points.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = this.thickness;
      ctx.stroke();
      ctx.closePath();
    },
  };
}

function createToolPreview(x: number, y: number, thickness: number): ToolPreview {
  return {
    x,
    y,
    thickness,
    draw(ctx: CanvasRenderingContext2D) {
      if (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness, 0, 2 * Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
      }
    },
  };
}

function createSticker(x: number, y: number, emoji: string): Sticker {
  return {
    x,
    y,
    emoji,
    drag(newX: number, newY: number) {
      this.x = newX;
      this.y = newY;
    },
    display(ctx: CanvasRenderingContext2D) {
      if (ctx) {
        ctx.font = "30px Arial";
        ctx.fillText(this.emoji, this.x, this.y);
      }
    },
  };
}

let currentThickness = 5;
let currentColor = "#000000";
let selectedSticker: string | null = null;
let drawing: Array<MarkerLine | Sticker> = [];
let currentStroke: MarkerLine | null = null;
let redo: Array<MarkerLine | Sticker> = [];
let currentToolPreview: ToolPreview | null = null;
let isDrawing = false;

const context = canvas.getContext("2d");

canvas.addEventListener("mousedown", (e) => {
  if (selectedSticker) {
    const sticker = createSticker(e.offsetX, e.offsetY, selectedSticker);
    drawing.push(sticker);
    canvas.dispatchEvent(new Event("drawing-changed"));
    
    selectedSticker = null;
    updateCursorWithEmoji("");
    clearButtonSelection();
    
    return;
  }
  
  isDrawing = true;
  currentStroke = createMarkerLine(e.offsetX, e.offsetY, currentThickness, currentColor);
  currentToolPreview = null;
  canvas.style.cursor = "none";
});

function colorSwap(){
  currentColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function clearButtonSelection() {
  document
    .querySelectorAll(".tool-button")
    .forEach((button) => button.classList.remove("selectedTool"));
    lastButton.classList.add("selectedTool");
    updateCursor(currentThickness);
}

canvas.addEventListener("mousemove", (e) => {
  if (currentStroke && isDrawing) {
    currentStroke.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (selectedSticker) {
    currentToolPreview = createToolPreview(e.offsetX, e.offsetY, currentThickness);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

window.addEventListener("mouseup", () => {
  if (isDrawing && currentStroke) {
    isDrawing = false;
    drawing.push(currentStroke);
    currentStroke = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
    updateCursor(currentThickness);
  }
});

canvas.addEventListener("drawing-changed", () => {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let copy = [...drawing];
    if (currentStroke) {
      copy.push(currentStroke);
    }
    for (const item of copy) {
      item.display(context);
    }
  }
});

canvas.addEventListener("tool-moved", () => {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const item of drawing) {
      item.display(context);
    }

    currentToolPreview?.draw(context);
  }
});

const stickers = ["😀", "🔥", "🍕"];
let customStickers: string[] = [];

function createStickerButton(emoji: string) {
  const stickerButton = document.createElement("button");
  stickerButton.innerHTML = emoji;
  stickerButton.addEventListener("click", () => {
    selectedSticker = emoji;
    updateCursorWithEmoji(emoji);
    updateButtonSelection(stickerButton);
    canvas.dispatchEvent(new Event("tool-moved"));
  });
  stickerButton.classList.add("tool-button");
  upperBox.append(stickerButton);
};

stickers.forEach((sticker) => createStickerButton(sticker));

function addCustomSticker() {
  const customSticker = prompt("Enter your custom sticker:", "🌟");

  if (customSticker && customSticker.length > 0) {
    customStickers.push(customSticker);
    createStickerButton(customSticker);
  }
}

function updateCursorWithEmoji(emoji: string) {
  if (emoji === "") {
    canvas.style.cursor = "default";
    return;
  }

  const cursorCanvas = document.createElement("canvas");
  cursorCanvas.width = 50;
  cursorCanvas.height = 50;
  colorSwap();
  const ctx = cursorCanvas.getContext("2d");
  if (ctx) {
    ctx.font = "40px Arial";
    ctx.fillText(emoji, 5, 35);
  }

  const dataURL = cursorCanvas.toDataURL("image/png");
  canvas.style.cursor = `url(${dataURL}) 25 25, auto`;
}

function updateButtonSelection(selectedButton: HTMLButtonElement) {
  document
    .querySelectorAll(".tool-button")
    .forEach((button) => button.classList.remove("selectedTool"));

    if (!selectedSticker){
      lastButton = selectedButton;
    }
  selectedButton.classList.add("selectedTool");
}

function clearCanvas() {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawing = [];
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

function undoCanvas() {
  if (drawing.length > 0) {
    const pop = drawing.pop();
    if (pop) {
      redo.push(pop);
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

function redoCanvas() {
  if (redo.length > 0) {
    const pop = redo.pop();
    if (pop) {
      drawing.push(pop);
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

function setMarkerThickness(thickness: number, selectedButton: HTMLButtonElement) {
  currentThickness = thickness;
  document
    .querySelectorAll(".tool-button")
    .forEach((button) => button.classList.remove("selectedTool"));
  selectedButton.classList.add("selectedTool");
  colorSwap();
  updateCursor(thickness);
}

function updateCursor(thickness: number) {
  const cursorCanvas = document.createElement("canvas");
  cursorCanvas.width = thickness * 2;
  cursorCanvas.height = thickness * 2;
  const ctx = cursorCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.arc(thickness, thickness, thickness, 0, 2 * Math.PI);
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.closePath();
  }

  const dataURL = cursorCanvas.toDataURL("image/png");
  canvas.style.cursor = `url(${dataURL}) ${thickness} ${thickness}, auto`;
}

function exportDrawing() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d");
  
  if (exportContext) {
    exportContext.scale(4, 4);

    exportContext.fillStyle = "white";
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    drawing.forEach((stroke) => stroke.display(exportContext));

    const dataURL = exportCanvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = "sketchpad.png";
    downloadLink.click();
  }
}

function createButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerHTML = label;
  button.classList.add(className);
  button.addEventListener("click", onClick);
  return button;
}

const clearButton = createButton("Clear", "tool-button", clearCanvas);
const undoButton = createButton("Undo", "tool-button", undoCanvas);
const redoButton = createButton("Redo", "tool-button", redoCanvas);

upperBox.append(clearButton, undoButton, redoButton);

const sizeButtonSmall = createButton("Thin Marker", "tool-button", () =>
  setMarkerThickness(2, sizeButtonSmall)
);
const sizeButtonMedium = createButton("Medium Marker", "tool-button", () =>
  setMarkerThickness(5, sizeButtonMedium)
);
const sizeButtonLarge = createButton("Large Marker", "tool-button", () =>
  setMarkerThickness(10, sizeButtonLarge)
);

lowerBox.append(sizeButtonSmall, sizeButtonMedium, sizeButtonLarge);

let lastButton: HTMLButtonElement = sizeButtonMedium;

const customStickerButton = createButton("Custom Sticker", "tool-button", addCustomSticker);
lowerBox.append(customStickerButton);

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.addEventListener("click", exportDrawing);
upperBox.append(exportButton);

[clearButton, undoButton, redoButton].forEach(
  (button) => {
    button.classList.add("tool-button");
    upperBox.append(button);
  }
);

[sizeButtonSmall, sizeButtonMedium, sizeButtonLarge, customStickerButton].forEach(
  (button) => {
    button.classList.add("tool-button");
    lowerBox.append(button);
  }
);
