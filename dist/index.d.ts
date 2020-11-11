/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import * as React from 'react';

// ---------------
// PDFjs namespace
// ---------------

export declare namespace PdfJs {
        
    // Worker
    const GlobalWorkerOptions: GlobalWorker;
    interface GlobalWorker {
        workerSrc: string;
    }

    // Loading task
    const PasswordResponses: PasswordResponsesValue;
    interface PasswordResponsesValue {
        NEED_PASSWORD: string;
        INCORRECT_PASSWORD: string;
    }

    type VerifyPassword = (password: string) => void;
    type FileData = string | Uint8Array;

    interface LoadingTask {
        onPassword: (verifyPassword: VerifyPassword, reason: string) => void;
        promise: Promise<PdfDocument>;
        destroy(): void;
    }
    interface PdfDocument {
        numPages: number;
        getAttachments(): Promise<{[filename: string]: Attachment}>;
        getDestination(dest: string): Promise<OutlineDestination>;
        getDownloadInfo(): Promise<{ length: number }>;
        getMetadata(): Promise<MetaData>;
        getOutline(): Promise<Outline[]>;
        getPage(pageIndex: number): Promise<Page>;
        getPageIndex(ref: OutlineRef): Promise<number>;
    }
    function getDocument(file: FileData): LoadingTask;

    // Attachment
    interface Attachment {
        content: Uint8Array;
        filename: string;
    }

    // Metadata
    interface MetaData {
        contentDispositionFilename?: string;
        info: MetaDataInfo;
    }
    interface MetaDataInfo {
        Author: string;
        CreationDate: string;
        Creator: string;
        Keywords: string;
        ModDate: string;
        PDFFormatVersion: string;
        Producer: string;
        Subject: string;
        Title: string;
    }

    // Outline
    type OutlineDestinationType = string | OutlineDestination;
    interface Outline {
        bold?: boolean;
        color?: number[];
        dest?: OutlineDestinationType;
        italic?: boolean;
        items: Outline[];
        newWindow?: boolean;
        title: string;
        unsafeUrl?: string;
        url?: string;
    }
    type OutlineDestination = [
        OutlineRef,
        OutlineDestinationName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...any[],
    ];
    interface OutlineDestinationName {
        name: string;   // Can be 'WYZ', 'Fit', ...
    }
    interface OutlineRef {
        gen: number;
        num: number;
    }

    // View port
    interface ViewPortParams {
        rotation?: number;
        scale: number;
    }
    interface ViewPortCloneParams {
        dontFlip: boolean;
    }
    interface ViewPort {
        height: number;
        rotation: number;
        transform: number[];
        width: number;
        clone(params: ViewPortCloneParams): ViewPort;
    }

    // Render task
    interface PageRenderTask {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: Promise<any>;
        cancel(): void;
    }

    // Render SVG
    interface SVGGraphics {
        getSVG(operatorList: PageOperatorList, viewport: ViewPort): Promise<SVGElement>;
    }
    interface SVGGraphicsConstructor {
        new(commonObjs: PageCommonObjects, objs: PageObjects): SVGGraphics;
    }
    let SVGGraphics: SVGGraphicsConstructor;

    // Render text layer
    interface RenderTextLayerParams {
        textContent: PageTextContent;
        container: HTMLDivElement;
        viewport: ViewPort;
    }
    interface PageTextContent {
        items: PageTextItem[];
    }
    interface PageTextItem {
        str: string;
    }
    function renderTextLayer(params: RenderTextLayerParams): PageRenderTask;

    // Annotations layer
    interface AnnotationsParams {
        // Can be 'display' or 'print'
        intent: string;
    }
    interface AnnotationPoint {
        x: number;
        y: number;
    }

    interface Label {
        id: any;
        text: string;
        hotkey: string;
        color: string;
        created_at: any;
    }

    interface Annotation {
        // Label
        label?: Label;
        annotationFlags: number;
        annotationType: number;
        color?: Uint8ClampedArray;
        dest?: string;
        hasAppearance: boolean;
        id: string;
        rect: number[];
        subtype: string;
        // Border style
        borderStyle: {
            dashArray: number[];
            horizontalCornerRadius: number;
            style: number;
            verticalCornerRadius: number;
            width: number;
        };
        // For annotation that has a popup
        hasPopup?: boolean;
        contents?: string;
        modificationDate?: string;
        creationDate?: string;
        // Highlight annotation
        quadPoints?: AnnotationPoint[][];
        title?: string;
        // Parent annotation
        parentId?: string;
        parentType?: string;
        // File attachment annotation
        file?: Attachment;
        // Ink annotation
        inkLists?: AnnotationPoint[][];
        // Line annotation
        lineCoordinates?: number[];
        // Link annotation
        // `action` can be `FirstPage`, `PrevPage`, `NextPage`, `LastPage`, `GoBack`, `GoForward`
        action?: string;
        url?: string;
        newWindow?: boolean;
        // Polyline annotation
        vertices?: AnnotationPoint[];
        // Text annotation
        name?: string;
    }
    const AnnotationLayer: PdfAnnotationLayer;
    interface RenderAnnotationLayerParams {
        annotations: Annotation[];
        div: HTMLDivElement | null;
        linkService: LinkService;
        page: Page;
        viewport: ViewPort;
    }
    interface PdfAnnotationLayer {
        render(params: RenderAnnotationLayerParams): void;
        update(params: RenderAnnotationLayerParams): void;
    }

    // Link service
    interface LinkService {
        externalLinkTarget?: number | null;
        getDestinationHash(dest: OutlineDestinationType): string;
        navigateTo(dest: OutlineDestinationType): void;
    }

    // Render page
    interface PageRenderParams {
        canvasContext: CanvasRenderingContext2D;
        // Should be 'print' when printing
        intent?: string;
        transform?: number[];
        viewport: ViewPort;
    }
    interface Page {
        getAnnotations(params: AnnotationsParams): Promise<Annotation[]>;
        getTextContent(): Promise<PageTextContent>;
        getViewport(params: ViewPortParams): ViewPort;
        render(params: PageRenderParams): PageRenderTask;
        getOperatorList(): Promise<PageOperatorList>;
        commonObjs: PageCommonObjects;
        objs: PageObjects;
        view: number[];
    }

    /* eslint-disable @typescript-eslint/no-empty-interface */
    interface PageCommonObjects {}
    interface PageObjects {}
    interface PageOperatorList {}
    /* eslint-enable @typescript-eslint/no-empty-interface */
}

// --------------------
// Interfaces and types
// --------------------

export interface LocalizationMap {
    [key: string]: LocalizationMap;
}

export interface Offset {
    left: number;
    top: number;
}

export enum Position {
    TopLeft = 'TOP_LEFT',
    TopCenter = 'TOP_CENTER',
    TopRight = 'TOP_RIGHT',
    RightTop = 'RIGHT_TOP',
    RightCenter = 'RIGHT_CENTER',
    RightBottom = 'RIGHT_BOTTOM',
    BottomLeft = 'BOTTOM_LEFT',
    BottomCenter = 'BOTTOM_CENTER',
    BottomRight = 'BOTTOM_RIGHT',
    LeftTop = 'LEFT_TOP',
    LeftCenter = 'LEFT_CENTER',
    LeftBottom = 'LEFT_BOTTOM',
}

export type RenderToolbarSlot = (toolbarSlot: ToolbarSlot) => React.ReactElement;
export type RenderToolbar = (renderToolbar: RenderToolbarSlot) => React.ReactElement;

export function defaultToolbar(toolbarSlot: ToolbarSlot): RenderToolbarSlot;

export interface SlotAttr extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.MutableRefObject<HTMLDivElement | null>;
}
export interface Slot {
    attrs: SlotAttr;
    children: React.ReactNode;
}

export enum ToggleStatus {
    Close = 'Close',
    Open = 'Open',
    Toggle = 'Toggle',
}
export type Toggle = (status?: ToggleStatus) => void;

export interface ToolbarSlot {
    currentPage: number;
    numPages: number;
    toggleSidebarButton: React.ReactNode;
    searchPopover: React.ReactNode;
    previousPageButton: React.ReactNode;
    nextPageButton: React.ReactNode;
    currentPageInput: React.ReactNode;
    zoomOutButton: React.ReactNode;
    zoomPopover: React.ReactNode;
    zoomInButton: React.ReactNode;
    fullScreenButton: React.ReactNode;
    downloadButton: React.ReactNode;
    openFileButton: React.ReactNode;
    printButton: React.ReactNode;
    goToFirstPageButton: React.ReactNode;
    goToLastPageButton: React.ReactNode;
    rotateClockwiseButton: React.ReactNode;
    rotateCounterclockwiseButton: React.ReactNode;
    textSelectionButton: React.ReactNode;
    handToolButton: React.ReactNode;
    verticalScrollingButton: React.ReactNode;
    horizontalScrollingButton: React.ReactNode;
    wrappedScrollingButton: React.ReactNode;
    documentPropertiesButton: React.ReactNode;
    moreActionsPopover: React.ReactNode;
}

export enum ScrollMode {
    Horizontal = 'Horizontal',
    Vertical = 'Vertical',
    Wrapped = 'Wrapped',
}

export enum SelectionMode {
    Hand,
    Text,
}

export enum SpecialZoomLevel {
    ActualSize = 'ActualSize',
    PageFit = 'PageFit',
    PageWidth = 'PageWidth',
}

// ----------
// Components
// ----------

// Button
export interface ButtonProps {
    isSelected?: boolean;
    onClick(): void;
}

export class Button extends React.Component<ButtonProps> {}

// Icon
export interface IconProps {
    size?: number;
}

export class Icon extends React.Component<IconProps> {}

// MenuDivider
export class MenuDivider extends React.Component<{}> {}

// MenuItem
export interface MenuItemProps {
    checked?: boolean;
    icon?: React.ReactElement;
    onClick(): void;
}

export class MenuItem extends React.Component<MenuItemProps> {}

// Modal
export interface ModalProps {
    closeOnClickOutside: boolean;
    closeOnEscape: boolean;
    content: RenderContent;
    target: RenderTarget;
}

export class Modal extends React.Component<ModalProps> {}

// Popover
export interface PopoverProps {
    closeOnClickOutside: boolean;
    closeOnEscape: boolean;
    content: RenderContent;
    offset: Offset;
    position: Position;
    target: RenderTarget;
}

export class Popover extends React.Component<PopoverProps> {}

// Portal
export type RenderContent = (toggle: Toggle) => React.ReactNode;
export type RenderTarget = (toggle: Toggle, opened: boolean) => React.ReactNode;

// Primary button
export interface PrimaryButtonProps {
    onClick(): void;
}

export class PrimaryButton extends React.Component<PrimaryButtonProps> {}

// Progress bar
export interface ProgressBarProps {
    progress: number;
}

export class ProgressBar extends React.Component<ProgressBarProps> {}

// Separator
export class Separator extends React.Component<{}> {}

// Spinner
export class Spinner extends React.Component<{}> {}

// Tooltip
export type RenderTooltipContent = () => React.ReactNode;

export interface TooltipProps {
    content: RenderTooltipContent;
    offset: Offset;
    position: Position;
    target: React.ReactElement;
}

export class Tooltip extends React.Component<TooltipProps> {}

// Viewer
export interface RenderViewerProps {
    viewer: React.ReactElement;
    doc: PdfJs.PdfDocument;
    download(): void;
    changeScrollMode(mode: ScrollMode): void;
    changeSelectionMode(mode: SelectionMode): void;
    // Jump to given page
    // `page` is zero-index based
    jumpToPage(page: number): void;
    print(): void;
    rotate(degree: number): void;
    zoom(level: number | SpecialZoomLevel): void;
}
export type RenderViewer = (props: RenderViewerProps) => React.ReactElement;

// Represents the error in case the document can't be loaded
export interface LoadError {
    message?: string;
    // Some possible values for `name` are
    // - AbortException
    // - FormatError
    // - InvalidPDFException
    // - MissingPDFException
    // - PasswordException
    // - UnexpectedResponseException
    // - UnknownErrorException
    name?: string;
}
export type RenderError = (error: LoadError) => React.ReactElement;

export interface RenderPageProps {
    annotationLayer: Slot;
    canvasLayer: Slot;
    doc: PdfJs.PdfDocument;
    height: number;
    pageIndex: number;
    rotation: number;
    scale: number;
    svgLayer: Slot;
    textLayer: Slot;
    width: number;
}
export type RenderPage = (props: RenderPageProps) => React.ReactElement;

export type Layout = (
    isSidebarOpened: boolean,
    container: Slot,
    main: Slot,
    toolbar: RenderToolbar,
    sidebar: Slot,
) => React.ReactElement;

export function defaultLayout(
    isSidebarOpened: boolean,
    container: Slot,
    main: Slot,
    toolbar: React.ReactElement,
    sidebar: Slot,
): React.ReactElement;


export interface LTWH {
    left: number;
    top: number;
    width: number;
    height: number;
  }
  
export type Rect = [number, number, number, number]; 
  
export type Contents = { text?: string; image?: string };
export type PopoverEleType = React.ElementType<{
    style: React.CSSProperties;
    onConfirm: () => void;
    content?: React.ReactElement;
    data?: Record<string, any>;
}>

export interface ViewerProps {
    // The default zoom level
    // If it's not set, the initial zoom level will be calculated based on the dimesion of page and the container width
    // So that, the document will fit best within the container
    defaultScale?: number | SpecialZoomLevel;
    fileUrl: string | Uint8Array;
    // The page (zero-index based) that will be displayed initially
    initialPage?: number;
    // The keyword that will be highlighted in all pages
    keyword?: string | RegExp;
    layout?: Layout;
    localization?: LocalizationMap;
    // The prefix for CSS classes
    prefixClass?: string;
    render?: RenderViewer;
    renderError?: RenderError;
    renderPage?: RenderPage;
    selectionMode?: SelectionMode;
    onDocumentLoad?(doc: PdfJs.PdfDocument): void;
    onZoom?(doc: PdfJs.PdfDocument, scale: number): void;
    annotationValue?: PdfJs.Annotation[][];
    onPageNumberChange?(page: number): void;
    onNewAnnotation?(newAnnotation: PdfJs.Annotation, contents: Contents, pageNumber: number, hideTipAndSelection: () => void ): void;
    SelectionPopover?: PopoverEleType;
    AnnotationPopover?: PopoverEleType;
}
export default class Viewer extends React.Component<ViewerProps> {}

// Worker
export interface WorkerProps {
    workerUrl: string;
}

export class Worker extends React.Component<WorkerProps> {}
