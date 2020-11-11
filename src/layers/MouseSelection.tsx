import React, { useState, useCallback, useRef } from "react";
import ThemeContext from "../theme/ThemeContext";
import "./mouseSelection.less";
import { LTWH } from "../types";
import { useEventListener } from "@umijs/hooks";
import { getAreaAsPng } from "../utils/annotationUtils";

interface MouseSelectionProps {
  onSelection: (
    image: string,
    boundingRect: LTWH,
    resetSelection: () => void
  ) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  shouldStart: (event: MouseEvent) => boolean;
  onChange: (isVisible: boolean) => void;
  canvas: HTMLCanvasElement;
}

interface Coords {
  x: number;
  y: number;
}

export const getBoundingRect = (start: Coords, end: Coords): LTWH => {
  return {
    left: Math.min(end.x, start.x),
    top: Math.min(end.y, start.y),

    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
};

const shouldRender = (boundingRect: LTWH): boolean => {
  return boundingRect.width >= 1 && boundingRect.height >= 1;
};

const MouseSelection: React.FC<
  MouseSelectionProps & { textLayerRef: React.RefObject<HTMLDivElement> }
> = ({
  onSelection,
  onDragStart,
  onDragEnd,
  shouldStart,
  textLayerRef,
  canvas,
}) => {
  const theme = React.useContext(ThemeContext);
  const [start, setStart] = useState<Coords | null>(null);
  const [end, setEnd] = useState<Coords | null>(null);
  const [locked, setLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    onDragEnd();
    setStart(null);
    setEnd(null);
    setLocked(false);
  }, [onDragEnd]);

  const containerCoords = useCallback(
    (pageX: number, pageY: number): Coords | null => {
      const textLayerEle = textLayerRef.current;
      if (!textLayerEle) {
        return null;
      }
      const parentEle = textLayerEle.parentElement;
      if (!(parentEle instanceof HTMLElement)) {
        return null;
      }
      let containerBoundingRect;
      if (!containerBoundingRect) {
        containerBoundingRect = parentEle.getBoundingClientRect();
      }

      return {
        x: pageX - containerBoundingRect.left + parentEle.scrollLeft,
        y: pageY - containerBoundingRect.top + parentEle.scrollTop,
      };
    },
    [textLayerRef.current]
  );

  const mousedownHandler = useCallback(
    (event: MouseEvent): void => {
      if (!shouldStart(event)) {
        reset();
        return;
      }

      onDragStart();
      const newStart = containerCoords(event.pageX, event.pageY);

      setStart(newStart);
      setEnd(null);
      setLocked(false);
    },
    [containerCoords]
  );

  const mousemoveHandler = useCallback(
    (event: MouseEvent): void => {
      if (!start || locked) {
        return;
      }
      const newEnd = containerCoords(event.pageX, event.pageY);
      setEnd(newEnd);
    },
    [start, locked]
  );

  const mouseUpHandler = useCallback(
    (event: MouseEvent): void => {
      const textLayerEle = textLayerRef.current;
      if (!textLayerEle) {
        return;
      }
      const parentEle = textLayerEle.parentElement;
      if (!(parentEle instanceof HTMLElement)) {
        return;
      }
      if (event.currentTarget) {
        event.currentTarget.removeEventListener("mouseup", () =>
          mouseUpHandler(event)
        );
      }
      const ended = containerCoords(event.pageX, event.pageY);

      if (!start || !ended) {
        return;
      }

      const boundingRect = getBoundingRect(start, ended);

      if (
        !(event.target instanceof HTMLElement) ||
        !parentEle.contains(event.target) ||
        !shouldRender(boundingRect)
      ) {
        reset();
        return;
      }
      setEnd(ended);
      setLocked(true);

      if (!start || !ended) {
        return;
      }

      const image = getAreaAsPng(canvas, boundingRect);

      if (event.target instanceof HTMLElement) {
        onSelection(image, boundingRect, reset);
      }
    },
    [start, textLayerRef.current, canvas]
  );

  useEventListener("mousedown", mousedownHandler, {
    dom: textLayerRef.current,
  });

  useEventListener("mousemove", mousemoveHandler, {
    dom: textLayerRef.current,
  });

  useEventListener("mouseup", mouseUpHandler, {
    dom: textLayerRef.current,
  });

  return (
    <div className={`${theme.prefixClass}-mouse-selection`} ref={containerRef}>
      {start && end ? (
        <div
          className={`${theme.prefixClass}-mouse-selection-content`}
          style={getBoundingRect(start, end)}
        />
      ) : null}
    </div>
  );
};

export default MouseSelection;
