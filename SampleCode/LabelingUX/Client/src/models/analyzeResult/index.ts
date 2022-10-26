import { V3_0_3_AnalyzeResult } from "./v3_0_3";

export type AnalyzeResponse = {
    createdDateTime: string;
    lastUpdatedDateTime: string;
    status: string;
    analyzeResult: V3_0_3_AnalyzeResult;
};

export type StudioAnalyzeResult = {
    apiVersion: string;
    modelId: string;
    stringIndexType: StringIndexType;
    content: string;
    pages: StudioDocumentPage[];
    blocks?: StudioBlock[];
    paragraphs?: StudioParagraph[];
    tables?: StudioDocumentTable[];
    keyValuePairs?: StudioDocumentKeyValuePair[];
    entities?: StudioDocumentEntity[];
    styles?: StudioDocumentStyle[];
    documents?: StudioDocumentResult[];
};

type StringIndexType = "textElements" | "unicodeCodePoint" | "utf16CodeUnit";

export type StudioDocumentPage = {
    pageNumber: number;
    angle: number;
    width: number;
    height: number;
    unit: "pixel" | "inch";
    words: StudioWord[];
    images?: StudioImage[];
    selectionMarks?: StudioSelectionMark[];
    lines?: StudioLine[];
    spans?: StudioSpan[];
    kind?: string;
};

export type StudioDocumentTable = {
    rowCount: number;
    columnCount: number;
    cells: StudioDocumentTableCell[];
    boundingRegions: BoundingRegion[];
    spans: StudioSpan[];
};

export type StudioDocumentKeyValuePair = {
    key: StudioKeyValuePairElement;
    value?: StudioKeyValuePairElement;
    confidence: Confidence;
};

export type StudioDocumentEntity = {
    category: string;
    subCategory?: string;
    content: string;
    boundingRegions: BoundingRegion[];
    confidence: Confidence;
    spans: StudioSpan[];
};

export type StudioDocumentStyle = {
    confidence?: Confidence;
    spans: StudioSpan[];
    isHandwritten?: boolean;
};

export type StudioDocumentResult = {
    docType: string;
    boundingRegions: BoundingRegion[];
    fields: { [fieldName: string]: StudioFieldValue };
    confidence: Confidence;
    spans: StudioSpan[];
};

export type BoundingRegion = {
    pageNumber: number;
    polygon: Polygon;
};

export type StudioWord = {
    content: string;
    polygon: Polygon;
    confidence?: Confidence;
    span?: StudioSpan;
};

export type StudioImage = {
    pageNumber: number;
    confidence?: Confidence;
    span: StudioSpan;
};

export type StudioLine = {
    content: string;
    polygon: Polygon;
    spans: StudioSpan[];
};

export type StudioBlock = {
    kind: string;
    BoundingRegion: BoundingRegion[];
    content: string;
    spans: StudioSpan[];
    confidence: Confidence;
};

export type StudioParagraph = {
    spans: StudioSpan[];
    boundingRegions?: BoundingRegion[];
    content: string;
    role?: string;
};

export type StudioSelectionMark = {
    state: SelectionMarkState;
    polygon: Polygon;
    confidence?: Confidence;
    span?: StudioSpan;
};

export type StudioDocumentTableCell = {
    kind?: DocumentTableCellKind;
    rowIndex: number;
    columnIndex: number;
    rowSpan?: number;
    columnSpan?: number;
    content: any;
    boundingRegions: BoundingRegion[];
    spans?: StudioSpan[];
};

type StudioKeyValuePairElement = {
    content: string;
    boundingRegions: BoundingRegion[];
    spans: StudioSpan[];
};

export type StudioFieldValue = {
    type: FieldValueType;
    valueString?: string;
    valueDate?: string;
    valueTime?: string;
    valuePhoneNumber?: string;
    valueNumber?: number;
    valueInteger?: number;
    valueSelectionMark?: SelectionMarkState;
    valueSignature?: DocumentSignatureType;
    valueCountryRegion?: string;
    valueCurrency?: DocumentCurrencyType;
    valueArray?: StudioFieldValue[];
    valueObject?: { [name: string]: StudioFieldValue };
    valueAddress?: { [name: string]: string };
    content?: string;
    boundingRegions?: BoundingRegion[];
    confidence?: Confidence;
    spans?: StudioSpan[];
};

export type StudioSpan = {
    offset: number;
    length: number;
};

export type Polygon = [number, number, number, number, number, number, number, number];

type DocumentCurrencyType = {
    currencySymbol?: string;
    currency?: string;
    amount?: number;
};

export type SelectionMarkState = "selected" | "unselected";

type Confidence = number;

type DocumentTableCellKind = "content" | "rowHeader" | "columnHeader" | "stub" | "description";

type FieldValueType =
    | "string"
    | "date"
    | "time"
    | "phoneNumber"
    | "number"
    | "integer"
    | "selectionMark"
    | "countryRegion"
    | "currency"
    | "signature"
    | "array"
    | "object"
    | "address";

type DocumentSignatureType = "signed" | "unsigned";

export type SpanPositions = {
    offset: number;
    length: number;
    iconName: string;
    pageNumber?: number;
    tableIndex?: number;
};

export type AnalyzeContentParseResult = {
    documentName: string;
    content: string;
    displayedContent: string;
    positions: Array<{
        column: number;
        lineNumber: number;
        iconName: string;
        shouldDisplayAsIcon: boolean;
        pageNumber?: number;
        tableIndex?: number;
    }>;
};

export type ParsedContentTextBlock = {
    kind?: string | undefined;
    role?: string | undefined;
    content: string;
    boundingRegions?: BoundingRegion[];
};

export type ParsedContentPagedText = {
    [pageNumber: string]: ParsedContentTextBlock[];
};

export type ParsedContentPagedTables = {
    [pageNumber: string]: StudioDocumentTable[];
};

export type ParsedContentPagedSelectionMarks = {
    [pageNumber: string]: StudioSelectionMark[];
};

export type StudioGeneralKeyValue = StudioDocumentKeyValuePair & {
    fieldColor?: string;
};

export type StudioGeneralEntityValue = {
    category: string;
    fieldColor: string;
    valueArray: StudioDocumentEntity[];
};
