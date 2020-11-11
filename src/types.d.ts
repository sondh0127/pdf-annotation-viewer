export interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

// TODO bounding Rect, multiple rect
export type Rect = [number, number, number, number];

export type Contents = { text?: string; image?: string };

export type PopoverEleType = React.ElementType<{
  style: React.CSSProperties;
  onConfirm: () => void;
  content?: React.ReactElement;
  data?: Record<string, any>;
}>;
