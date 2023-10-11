const MAP_SIZE = 500;
const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;
const PAN_SPEED = 1.5;

export class CanvasService {
  private ctx: CanvasRenderingContext2D;
  private canvasEl: HTMLCanvasElement;

  private zoom: number;
  private panX: number;
  private panY: number;
  private image: HTMLImageElement;
  private mousePressed: boolean;

  private touchStartX: number | undefined;
  private touchStartY: number | undefined;
  private touchPrevious: Touch | undefined;

  constructor(canvasEl: HTMLCanvasElement, image: HTMLImageElement) {
    this.canvasEl = canvasEl;
    this.image = image;

    this.zoom = 3;
    this.panX = 0;
    this.panY = 0;
    this.mousePressed = false;

    const context = canvasEl.getContext("2d");
    if (!context) {
      throw new Error("Canvas context is null");
    }
    this.ctx = context;

    this.resizeCanvas();

    image.onload = () => {
      if (image.naturalHeight < image.naturalWidth) {
        throw new Error("Image height is less than width");
      }
      this.drawMap();
    };

    this.canvasEl.addEventListener("wheel", (e) => this.handleZoomEvent(e));

    this.canvasEl.addEventListener("touchstart", (e) => {
      this.mousePressed = true;
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;
    });
    this.canvasEl.addEventListener("touchend", () => {
      this.mousePressed = false;
      this.touchStartX = undefined;
      this.touchStartY = undefined;
      this.touchPrevious = undefined;
      console.log("touch end !!");
    });
    this.canvasEl.addEventListener("touchmove", (e) =>
      this.handleTouchEvent(e)
    );
    this.canvasEl.addEventListener("mousedown", () => {
      this.mousePressed = true;
    });
    this.canvasEl.addEventListener("mouseup", () => {
      this.mousePressed = false;
    });
    this.canvasEl.addEventListener("mousemove", (e) => {
      this.handleDragEvent(e);
    });

    window.addEventListener("resize", () => this.resizeCanvas());
  }

  drawPoint(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
  }

  private resizeCanvas() {
    this.zoom = 3;
    this.panX = 0;
    this.panY = 0;
    this.canvasEl.height = window.innerHeight;
    this.canvasEl.width = window.innerWidth;
  }

  private draw(callback: () => void) {
    window.requestAnimationFrame(callback);
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }

  private drawMap() {
    const ratio = this.canvasEl.width / this.canvasEl.height;
    this.clearCanvas();
    this.ctx.drawImage(
      this.image,
      this.panX,
      this.panY,
      this.zoom * MAP_SIZE * ratio,
      this.zoom * MAP_SIZE,
      0,
      0,
      this.canvasEl.width,
      this.canvasEl.height
    );
  }

  private handleZoomEvent(event: WheelEvent) {
    if (event.deltaY > 0) {
      this.zoom += ZOOM_SPEED;
    } else {
      this.zoom -= ZOOM_SPEED;
    }
    if (this.zoom > MAX_ZOOM) {
      this.zoom = MAX_ZOOM;
    } else if (this.zoom < MIN_ZOOM) {
      this.zoom = MIN_ZOOM;
    }
    this.draw(() => this.drawMap());
  }

  private panMap(x: number, y: number) {
    const maxWidth = this.image.naturalWidth - this.canvasEl.width;
    const maxHeight = this.image.naturalHeight - this.canvasEl.height;
    let newX = x;
    let newY = y;
    if (x < 0) {
      newX = 0;
    } else if (x > maxWidth) {
      newX = maxWidth;
    }
    if (y < 0) {
      newY = 0;
    } else if (y > maxHeight) {
      newY = maxHeight;
    }
    this.panX = newX;
    this.panY = newY;

    this.draw(() => this.drawMap());
  }

  private handleTouchEvent(event: TouchEvent) {
    if (!this.mousePressed || !this.touchStartX || !this.touchStartY) return;

    if (!this.touchPrevious) {
      this.touchPrevious = event.changedTouches[0];
      return;
    }

    const currentTouchX =
      event.changedTouches[event.changedTouches.length - 1].clientX;
    const currentTouchY =
      event.changedTouches[event.changedTouches.length - 1].clientY;

    const newX =
      this.panX -
      (this.touchPrevious.clientX - currentTouchX) * PAN_SPEED * -0.1;
    const newY =
      this.panY -
      (this.touchPrevious.clientY - currentTouchY) * PAN_SPEED * -0.1;
    this.panMap(newX, newY);
  }

  private handleDragEvent(event: MouseEvent) {
    // get mouse pos and pan
    if (!this.mousePressed) return;
    const newX = this.panX - event.movementX * PAN_SPEED;
    const newY = this.panY - event.movementY * PAN_SPEED;
    this.panMap(newX, newY);
  }
}
