/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import React, { useContext } from "react";

import ThemeContext from "../theme/ThemeContext";
import PdfJs from "../vendors/PdfJs";
import Annotation from "./Annotation";
import { useAnnotationPopover } from "src/contexts/AnnotationContext";

interface HighlightProps {
  annotation: PdfJs.Annotation;
  page: PdfJs.Page;
  viewport: PdfJs.ViewPort;
}

const Highlight: React.FC<HighlightProps> = ({
  annotation,
  page,
  viewport,
}) => {
  const theme = useContext(ThemeContext);
  const hasPopup = annotation.hasPopup === false;
  const isRenderable = !!(
    annotation.hasPopup ||
    annotation.title ||
    annotation.contents
  );

  const Popover = useAnnotationPopover();

  const annotations = (annotation.quadPoints ? annotation.quadPoints : []).map(
    (quadPoint) => {
      const cloneAnno: PdfJs.Annotation = {
        ...annotation,
        rect: [quadPoint[0].x, quadPoint[3].y, quadPoint[3].x, quadPoint[0].y],
      };
      return cloneAnno;
    }
  );

  return (
    <>
      {annotations.map((annotation, idx) => {
        return (
          <Annotation
            key={idx}
            annotation={annotation}
            hasPopup={hasPopup}
            ignoreBorder={true}
            isRenderable={isRenderable}
            page={page}
            viewport={viewport}
          >
            {(props): React.ReactElement => {
              const attrs = {
                ...props.slot.attrs,
                style: {
                  ...props.slot.attrs.style,
                  backgroundColor: `rgb(${annotation.color}, 0.4)`,
                  outline: `0.5px solid rgb(${annotation.color}, 0.8)`,
                },
              };
              const contentStyle = {
                height: props.slot.attrs.style?.height,
                width: props.slot.attrs.style?.width,
              };
              return (
                <React.Fragment>
                  {/* <div {...props.slot.attrs} className={`${theme.prefixClass}-annotation`}>
                      {props.slot.children}
                    </div> */}
                  <Popover
                    style={{ 
                      ...attrs.style,
                      position: "absolute",
                      cursor: 'pointer',
                      mixBlendMode: 'multiply'
                    }}
                    data={annotation}
                    onConfirm={() => {
                      console.log("onConfirm");
                    }}
                    content={
                      <div
                        style={contentStyle}
                        // {...attrs}
                        // className={`${theme.prefixClass}-annotation ${theme.prefixClass}-annotation-highlight`}
                        data-annotation-id={annotation.id}
                        onClick={props.popup.toggleOnClick}
                        onMouseEnter={props.popup.openOnHover}
                        onMouseLeave={props.popup.closeOnHover}
                      >
                        {props.slot.children}
                      </div>
                    }
                  ></Popover>
                </React.Fragment>
              );
            }}
          </Annotation>
        );
      })}
    </>
  );
};

export default Highlight;
