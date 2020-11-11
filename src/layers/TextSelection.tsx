/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React, {
  useRef,
  useContext,
  useCallback,
  useState,
  Fragment,
} from "react";
import "./textSelection.less";
import ThemeContext from "../theme/ThemeContext";
import { LTWH } from "src/types";
import { useEventListener } from "@umijs/hooks";
import optimizeClientRects from "src/utils/optimize-client-rects";
import createRangy from "./createRangy";

interface TextSelectionProps {
  onSelection: (
    text: string,
    boundingRect: LTWH,
    rects: LTWH[],
    resetSelection: () => void
  ) => void;
  onCancel: () => void;
}

const getClientRects = (range: Range, containerEle: HTMLDivElement): LTWH[] => {
  const clientRects = Array.from(range.getClientRects());

  return clientRects.map((rect) => {
    return {
      left: rect.left - containerEle.getBoundingClientRect().left,
      top: rect.top - containerEle.getBoundingClientRect().top,
      width: rect.width,
      height: rect.height,
    };
  });
};

const getBoundingtRect = (range: Range, containerEle: HTMLDivElement): LTWH => {
  const clientRects = range.getBoundingClientRect();

  return {
    left: clientRects.left - containerEle.getBoundingClientRect().left,
    top: clientRects.top - containerEle.getBoundingClientRect().top,
    width: clientRects.width,
    height: clientRects.height,
  };
};

const TextSelection: React.FC<
  TextSelectionProps & { textLayerRef: React.RefObject<HTMLDivElement> }
> = ({ textLayerRef, onSelection, onCancel }) => {
  const theme = useContext(ThemeContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [postions, setPostions] = useState<LTWH[]>([]);

  const reset = useCallback(() => {
    onCancel();
    setPostions([]);
  }, [onCancel]);

  const mousedownHandler = useCallback((): void => {
    const selObj = createRangy();
    if (!selObj) return;
    reset();
    selObj.removeAllRanges();
  }, [reset]);

  const mouseupHandler = useCallback(
    (event: MouseEvent): void => {
      const element = event.target as HTMLElement;
      if (element.className !== "viewer-text") return;

      const selObj = createRangy();
      // @ts-ignore
      selObj.expand("word", {
        trim: true,
      });
      if (!selObj) return;
      setPostions([]);
      const text = selObj ? selObj.toString() : "";
      if (text && selObj && selObj.rangeCount >= 1) {
        const rangeRangy = selObj.getRangeAt(0);
        // @ts-ignore
        const range = rangeRangy.nativeRange;

        const containerEle = textLayerRef.current;
        if (range && range.startContainer.parentElement && containerEle) {
          const LTWHs = optimizeClientRects(
            getClientRects(range, containerEle)
          );
          const LTWH = getBoundingtRect(range, containerEle);
          setPostions(LTWHs);
          onSelection(text, LTWH, LTWHs, reset);
          selObj.removeAllRanges();
        }
      }
    },
    [textLayerRef.current, reset]
  );

  useEventListener("mousedown", mousedownHandler, {
    dom: textLayerRef.current,
  });

  useEventListener("mouseup", mouseupHandler, {
    dom: textLayerRef.current,
  });

  return (
    <Fragment>
      {postions.map((postion, idx) => (
        <div
          key={idx}
          className={`${theme.prefixClass}-text-selection`}
          ref={containerRef}
          style={postion}
        />
      ))}
    </Fragment>
  );
};

export default TextSelection;
