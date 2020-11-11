import { Rect, LTWH } from "../types";
import PdfJs from "../vendors/PdfJs";
import { AnnotationPoint } from "pdfjs-dist";

const stringify = (value: number): string => {
  return ("0" + value).slice(-2);
};

const getDateString = (date: Date): string => {
  let dateString = `D:${date.getFullYear()}${stringify(
    date.getMonth() + 1
  )}${stringify(date.getDate())}`;
  dateString = `${dateString}${stringify(date.getHours())}${stringify(
    date.getMinutes()
  )}${stringify(date.getSeconds())}`;
  const matches = date.toString().match(/GMT(.\w+)/);
  if (!matches) {
    return dateString;
  }
  let timezone = matches[0].replace("GMT", "");
  timezone = `${timezone.substr(0, 3)}'${timezone.substr(3, 5)}'`;
  dateString = `${dateString}${timezone}`;
  return dateString;
};

export type PdfJsAnnotation = Omit<PdfJs.Annotation, "lineCoordinates"| "dest">

export const getNormalizeAnnotation = (
  id: string,
  rect: Rect,
  quadPoints: AnnotationPoint[][]
): PdfJsAnnotation => {
  return {
    annotationFlags: 4,
    borderStyle: {
      width: 1,
      style: 1,
      dashArray: [3],
      horizontalCornerRadius: 0,
      verticalCornerRadius: 0,
    },
    color: new Uint8ClampedArray([255, 237, 0]),
    contents: "",
    hasAppearance: true,
    id,
    modificationDate: getDateString(new Date()),
    rect,
    subtype: "Highlight",
    title: "",
    creationDate: getDateString(new Date()),
    hasPopup: true,
    annotationType: 9,
    quadPoints,
  };
};

export const getAreaAsPng = (
  canvas: HTMLCanvasElement,
  position: LTWH
): string => {
  const { left, top, width, height } = position;

  const newCanvas = document.createElement("canvas");

  if (!(newCanvas instanceof HTMLCanvasElement)) {
    return "";
  }

  newCanvas.width = width;
  newCanvas.height = height;

  const newCanvasContext = newCanvas.getContext("2d");

  if (!newCanvasContext || !canvas) {
    return "";
  }

  const dpr: number = window.devicePixelRatio;

  newCanvasContext.drawImage(
    canvas,
    left * dpr,
    top * dpr,
    width * dpr,
    height * dpr,
    0,
    0,
    width,
    height
  );

  return newCanvas.toDataURL("image/png");
};
