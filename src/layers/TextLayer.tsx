/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import React from "react";

import Match from "../search/Match";
import ThemeContext from "../theme/ThemeContext";
import calculateOffset from "../utils/calculateOffset";
import unwrap from "../utils/unwrap";
import wrap from "../utils/wrap";
import PdfJs from "../vendors/PdfJs";
import "./textLayer.less";
import WithScale from "./WithScale";
import nullifyTransforms from "../utils/nullifyTransforms";
import MouseSelection from "./MouseSelection";
import TipContainer from "./TipContainer";
import { LTWH, Rect, Contents } from "../types";
import TextSelection from "./TextSelection";
import { useAddNewAnnotation } from "../contexts/AnnotationContext";
import { AnnotationPoint } from "pdfjs-dist";

interface TextLayerProps {
  keywordRegexp: RegExp;
  match: Match;
  page: PdfJs.Page;
  pageIndex: number;
  rotation: number;
  scale: number;
  onJumpToMatch(pageIndex: number, top: number, left: number): void;
}

const TextLayer: React.FC<TextLayerProps> = ({
  keywordRegexp,
  match,
  page,
  pageIndex,
  rotation,
  scale,
  onJumpToMatch,
}) => {
  const theme = React.useContext(ThemeContext);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const renderTask = React.useRef<PdfJs.PageRenderTask>();
  const isRendered = React.useRef(false);
  const addNewAnnotation = useAddNewAnnotation();

  const getRectFromViewport = React.useCallback(
    ({ left, top, width, height }: LTWH): Rect => {
      const viewport = page
        .getViewport({ rotation, scale })
        .clone({ dontFlip: true });
      const transform = viewport.transform;
      const {
        top: orginTop,
        left: orginLeft,
        width: orginWidth,
        height: orginHeight,
      } = nullifyTransforms({ top, left, width, height }, transform);

      const X0 = orginLeft;
      const Y1 = page.view[1] + page.view[3] - orginTop;
      const Y0 = Y1 - orginHeight;
      const X1 = X0 + orginWidth;
      return [X0, Y0, X1, Y1];
    },
    [page, rotation, scale]
  );

  const getQuadPointsFromViewport = React.useCallback(
    (rects: LTWH[]): AnnotationPoint[][] => {
      return rects.map((rect) => {
        const [X0, Y1, X1, Y0] = getRectFromViewport(rect);
        return [
          { x: X0, y: Y0 },
          { x: X1, y: Y0 },
          { x: X0, y: Y1 },
          { x: X1, y: Y1 },
        ];
      });
    },
    [getRectFromViewport]
  );

  const empty = (): void => {
    const containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    const spans = containerEle.querySelectorAll(
      `span.${theme.prefixClass}-text`
    );
    const numSpans = spans.length;
    for (let i = 0; i < numSpans; i++) {
      const span = spans[i];
      containerEle.removeChild(span);
    }
  };

  const highlight = (span: Element): void => {
    const text = span.textContent;
    if (!keywordRegexp.source.trim() || !text) {
      return;
    }

    const startOffset = text.search(keywordRegexp);
    const firstChild = span.firstChild;
    if (startOffset === -1 || !firstChild) {
      return;
    }
    const endOffset = startOffset + keywordRegexp.source.length;
    const wrapper = wrap(firstChild, startOffset, endOffset);
    wrapper.classList.add(`${theme.prefixClass}-text-highlight`);
  };

  const unhighlightAll = (): void => {
    const containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    const highlightNodes = containerEle.querySelectorAll(
      `span.${theme.prefixClass}-text-highlight`
    );
    const total = highlightNodes.length;
    for (let i = 0; i < total; i++) {
      unwrap(highlightNodes[i]);
    }
  };

  const scrollToMatch = (): void => {
    const containerEle = containerRef.current;
    if (match.pageIndex !== pageIndex || !containerEle) {
      return;
    }

    const spans = containerEle.querySelectorAll(
      `span.${theme.prefixClass}-text-highlight`
    );
    if (match.matchIndex < spans.length) {
      const span = spans[match.matchIndex] as HTMLElement;
      const { top, left } = calculateOffset(span, containerEle);
      onJumpToMatch(pageIndex, top / scale, left / scale);
    }
  };

  const renderText = (): void => {
    const task = renderTask.current;
    if (task) {
      task.cancel();
    }

    const containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    const viewport = page.getViewport({ rotation, scale });

    isRendered.current = false;
    page.getTextContent().then((textContent) => {
      empty();
      renderTask.current = PdfJs.renderTextLayer({
        container: containerEle,
        textContent,
        viewport,
      });
      renderTask.current.promise.then(
        () => {
          isRendered.current = true;
          const spans = containerEle.childNodes;
          const numSpans = spans.length;

          if (keywordRegexp) {
            unhighlightAll();
          }

          for (let i = 0; i < numSpans; i++) {
            const span = spans[i] as HTMLElement;
            span.classList.add(`${theme.prefixClass}-text`);
            if (keywordRegexp) {
              highlight(span);
            }
          }
          scrollToMatch();
        },
        () => {
          /**/
        }
      );
    });
  };

  React.useEffect(() => {
    const containerEle = containerRef.current;
    if (!keywordRegexp || !isRendered.current || !containerEle) {
      return;
    }

    unhighlightAll();

    if (keywordRegexp.source.trim()) {
      const spans = containerEle.querySelectorAll(
        `span.${theme.prefixClass}-text`
      );
      const numSpans = spans.length;
      for (let i = 0; i < numSpans; i++) {
        highlight(spans[i]);
      }
    }
  }, [keywordRegexp, isRendered.current]);

  React.useEffect(() => {
    if (isRendered.current) {
      scrollToMatch();
    }
  }, [match]);

  const [disableSelection, setDisableSelection] = React.useState(false);
  const [ghostAnnotation, setGhostAnnotation] = React.useState<{
    boundingRect: LTWH;
    rect: Rect;
    quadPoints: AnnotationPoint[][];
    contents: Contents;
  } | null>(null);

  const resetSelectionRef = React.useRef<(() => void) | null>(null);

  const getViewport = React.useCallback(() => {
    return page.getViewport({ rotation, scale }).clone({ dontFlip: true });
  }, [page, rotation, scale]);

  const getCanvas = React.useCallback((): HTMLCanvasElement => {
    return containerRef.current?.parentElement?.querySelector(
      `div .${theme.prefixClass}-canvas-layer canvas`
    ) as HTMLCanvasElement;
  }, [containerRef.current]);

  return (
    <WithScale callback={renderText} rotation={rotation} scale={scale}>
      <div className={`${theme.prefixClass}-text-layer`} ref={containerRef}>
        <MouseSelection
          canvas={getCanvas()}
          onDragStart={(): void => {
            setDisableSelection(true);
          }}
          onDragEnd={(): void => {
            setDisableSelection(false);
            setGhostAnnotation(null);
          }}
          textLayerRef={containerRef}
          onChange={(isVisible) => {
            // this.setState({ isAreaSelectionInProgress: isVisible })
          }}
          shouldStart={(event): boolean => {
            const cond1 = event.altKey;
            const cond2 =
              event.target instanceof HTMLElement &&
              event.target.className === `${theme.prefixClass}-text-layer`;
            return cond1 && cond2;
          }}
          onSelection={(image, boundingRect, resetSelection): void => {
            const rect = getRectFromViewport(boundingRect);
            const quadPoints = getQuadPointsFromViewport([boundingRect]);

            setGhostAnnotation({
              boundingRect,
              rect,
              quadPoints,
              contents: { image },
            });
            resetSelectionRef.current = resetSelection;
          }}
        />
      </div>
      <TextSelection
        textLayerRef={containerRef}
        onCancel={() => {
          setGhostAnnotation(null);
        }}
        onSelection={(text, boundingRect, rects, resetSelection): void => {
          const rect = getRectFromViewport(boundingRect);
          const quadPoints = getQuadPointsFromViewport(rects);
          setGhostAnnotation({
            boundingRect,
            rect,
            quadPoints,
            contents: { text },
          });
          resetSelectionRef.current = resetSelection;
        }}
      />
      {containerRef && containerRef.current && ghostAnnotation && (
        <TipContainer
          viewport={getViewport()}
          onConfirm={() => {
            if (resetSelectionRef.current) {
              addNewAnnotation(
                ghostAnnotation.rect,
                ghostAnnotation.quadPoints,
                ghostAnnotation.contents,
                resetSelectionRef.current
              );
              setGhostAnnotation(null);
            }
          }}
          scrollTop={containerRef.current.scrollTop}
          containerBoundingRect={containerRef.current.getBoundingClientRect()}
          boundingRect={ghostAnnotation.boundingRect}
          position={{
            left:
              containerRef.current.offsetLeft +
              ghostAnnotation.boundingRect.left +
              ghostAnnotation.boundingRect.width / 2,
            top:
              ghostAnnotation.boundingRect.top + containerRef.current.offsetTop,
            bottom:
              ghostAnnotation.boundingRect.top +
              containerRef.current.offsetLeft +
              ghostAnnotation.boundingRect.height,
          }}
        />
      )}
    </WithScale>
  );
};

export default TextLayer;
