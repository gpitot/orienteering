import "./style.css";
import visualMapImg from "/visualmap.png";
import { CanvasService } from "./canvas";

const setUpCavnas = (canvasId: string, imgUrl: string): CanvasService => {
  const canvasEl = document.getElementById(canvasId) as HTMLCanvasElement;
  const img = new Image();
  img.src = imgUrl;
  return new CanvasService(canvasEl, img);
};

setUpCavnas("visualMap", visualMapImg);
