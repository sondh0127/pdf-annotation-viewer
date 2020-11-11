/* eslint-disable @typescript-eslint/member-delimiter-style */
import React, { useCallback, useState, useContext, ReactNode } from "react";
import PdfJs from "../vendors/PdfJs";
import { Rect, Contents, PopoverEleType } from "../types";
import { getNormalizeAnnotation, PdfJsAnnotation } from "src/utils/annotationUtils";
import { AnnotationPoint } from "pdfjs-dist";

type StateType = PdfJs.Annotation[];

type AddNewAnnotationType = (
  rect: Rect,
  quadPoints: AnnotationPoint[][],
  contents: Contents,
  hideTipAndSelection: () => void
) => void;

export type ContextValue = [
  AddNewAnnotationType,
  {
    state: StateType;
    SelectionPopover: PopoverEleType;
    AnnotationPopover: PopoverEleType;
  }
];

const Popover: PopoverEleType = ({ children }) => {
  return <div className="Popover">{children}</div>;
};

export const AnnotationContext = React.createContext<ContextValue>([
  () => {
    throw new Error("Not implement AnnotationContext.onNewAnnotation");
  },
  { state: [], SelectionPopover: Popover, AnnotationPopover: Popover },
]);

type AnnotationProviderProps = {
  value?: PdfJs.Annotation[];
  onNewAnnotation?(
    newAnnotation: PdfJsAnnotation,
    contents: Contents,
    hideTipAndSelection: () => void
  ): void;
  SelectionPopover?: PopoverEleType;
  AnnotationPopover?: PopoverEleType;
};

export const AnnotationProvider: React.FC<AnnotationProviderProps> = ({
  children,
  onNewAnnotation,
  value,
  SelectionPopover = Popover,
  AnnotationPopover = Popover,
}) => {
  const addNewAnnotation = useCallback<AddNewAnnotationType>(
    (rect, quadPoints, contents, hideTipAndSelection) => {
      const getLocalId = (): string => {
        const existId = value ? value.map((item) => item.id) : [];
        let newId;
        do {
          newId =
            Math.random().toString().substr(2, 3) +
            Math.random()
              .toString(36)
              .replace(/[^a-z]+/g, "")
              .substr(0, 1)
              .toUpperCase();
        } while (existId.includes(newId));
        return newId;
      };
      const newAnno = getNormalizeAnnotation(getLocalId(), rect, quadPoints);
      if (onNewAnnotation) {
        onNewAnnotation(newAnno, contents, hideTipAndSelection);
      }
    },
    [onNewAnnotation]
  );

  return (
    <AnnotationContext.Provider
      value={[
        addNewAnnotation,
        { state: value || [], SelectionPopover, AnnotationPopover },
      ]}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotationState = (): StateType => {
  const [_, { state }] = useContext(AnnotationContext);
  return state;
};

export const useSelectionPopover = (): PopoverEleType => {
  const [_, { SelectionPopover }] = useContext(AnnotationContext);
  return SelectionPopover;
};

export const useAnnotationPopover = (): PopoverEleType => {
  const [_, { AnnotationPopover }] = useContext(AnnotationContext);
  return AnnotationPopover;
};

export const useAddNewAnnotation = (): AddNewAnnotationType => {
  const [addNewAnnotation] = useContext(AnnotationContext);
  return addNewAnnotation;
};
