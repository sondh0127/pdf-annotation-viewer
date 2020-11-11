import React, {
  useRef,
  useContext,
  useState,
  ReactElement,
  useEffect,
  useMemo,
} from "react";
import ThemeContext from "../theme/ThemeContext";
import { LTWH } from "../types";
import PdfJs from "../vendors/PdfJs";
import { useSelectionPopover } from "../contexts/AnnotationContext";

interface TipContainerProps {
  children?: ReactElement;
  position: {
    top: number;
    left: number;
    bottom: number;
  };
  scrollTop: number;
  containerBoundingRect: LTWH;
  onConfirm: () => void;
  viewport: PdfJs.ViewPort;
  boundingRect: LTWH;
}

const clamp = (value: number, left: number, right: number): number =>
  Math.min(Math.max(value, left), right);

const TipContainer: React.FC<TipContainerProps> = ({
  position,
  containerBoundingRect,
  scrollTop,
  onConfirm,
  viewport,
  boundingRect,
}) => {
  const theme = useContext(ThemeContext);
  const Popover = useSelectionPopover();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
      setHeight(containerRef.current.offsetHeight);
    }
  }, [containerRef.current]);

  const shouldMove = position.top - height - 5 < scrollTop;

  const top = shouldMove ? position.bottom + 5 : position.top - height - 5;
  const left = clamp(
    position.left - width / 2,
    0,
    containerBoundingRect.width - width
  );
  return (
    <Popover
      onConfirm={onConfirm}
      style={{ ...boundingRect, position: "absolute" }}
      content={<div style={{ ...boundingRect }} />}
    />
  );
};

{
  /* <div
  className={`${theme.prefixClass}-tip`}
  ref={containerRef}
  style={{
    // visibility: isStyleCalculationInProgress ? 'hidden' : 'visible',
    top: boundingRect.top,
    left: boundingRect.left,
    // transform: `matrix(${matrix})`,
  }}
>
  <div
    className={`${theme.prefixClass}-tip-compact`}
    onClick={() => {
      onConfirm()
    }}
  >
    Add annotation
  </div>
</div> */
}

export default React.memo(TipContainer);
