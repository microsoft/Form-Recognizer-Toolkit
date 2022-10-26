export type V3_0_3_AnalyzeResponse = {
    createdDateTime: string;
    lastUpdatedDateTime: string;
    status: string;
    analyzeResult: V3_0_3_AnalyzeResult;
};

export type V3_0_3_AnalyzeResult = {
    apiVersion: string;
    modelId: string;
    stringIndexType: StringIndexType;
    content: string;
    pages: V3_0_3_DocumentPage[];
    blocks?: V3_0_3_Block[];
    paragraphs?: V3_0_3_Paragraph[];
    tables?: V3_0_3_DocumentTable[];
    keyValuePairs?: V3_0_3_DocumentKeyValuePair[];
    entities?: V3_0_3_DocumentEntity[];
    styles?: V3_0_3_DocumentStyle[];
    documents?: V3_0_3_DocumentResult[];
};

type StringIndexType = "textElements" | "unicodeCodePoint" | "utf16CodeUnit";

type V3_0_3_DocumentPage = {
    pageNumber: number;
    angle: number;
    width: number;
    height: number;
    unit: "pixel" | "inch";
    words: V3_0_3_Word[];
    images?: V3_0_3_Image[];
    selectionMarks?: V3_0_3_SelectionMark[];
    lines?: V3_0_3_Line[];
    spans?: V3_0_3_Span[];
    kind?: string;
};

type V3_0_3_DocumentTable = {
    rowCount: number;
    columnCount: number;
    cells: V3_0_3_DocumentTableCell[];
    boundingRegions: BoundingRegion[];
    spans: V3_0_3_Span[];
};

export type V3_0_3_DocumentKeyValuePair = {
    key: V3_0_3_KeyValuePairElement;
    value?: V3_0_3_KeyValuePairElement;
    confidence: Confidence;
};

type V3_0_3_DocumentEntity = {
    category: string;
    subCategory?: string;
    content: string;
    boundingRegions: BoundingRegion[];
    confidence: Confidence;
    spans: V3_0_3_Span[];
};

type V3_0_3_DocumentStyle = {
    confidence?: Confidence;
    spans: V3_0_3_Span[];
    isHandwritten?: boolean;
};

type V3_0_3_DocumentResult = {
    docType: string;
    boundingRegions: BoundingRegion[];
    fields: { [fieldName: string]: V3_0_3_FieldValue };
    confidence: Confidence;
    spans: V3_0_3_Span[];
};

type BoundingRegion = {
    pageNumber: number;
    polygon: Polygon;
};

type V3_0_3_Word = {
    content: string;
    polygon: Polygon;
    confidence: Confidence;
    span: V3_0_3_Span;
};

export type V3_0_3_Image = {
    pageNumber: number;
    confidence?: Confidence;
    span: V3_0_3_Span;
};

type V3_0_3_Line = {
    content: string;
    polygon: Polygon;
    spans: V3_0_3_Span[];
};

type V3_0_3_Block = {
    kind: string;
    boundingRegions: BoundingRegion[];
    content: string;
    spans: V3_0_3_Span[];
    confidence: Confidence;
};

type V3_0_3_Paragraph = {
    spans: V3_0_3_Span[];
    boundingRegions?: BoundingRegion[];
    content: string;
    role?: string;
};

type V3_0_3_SelectionMark = {
    state: SelectionMarkState;
    polygon: Polygon;
    confidence: Confidence;
    span: V3_0_3_Span;
};

export type V3_0_3_DocumentTableCell = {
    kind?: DocumentTableCellKind;
    rowIndex: number;
    columnIndex: number;
    rowSpan?: number;
    columnSpan?: number;
    content: any;
    boundingRegions: BoundingRegion[];
    spans: V3_0_3_Span[];
};

type V3_0_3_KeyValuePairElement = {
    content: string;
    boundingRegions: BoundingRegion[];
    spans: V3_0_3_Span[];
};

type V3_0_3_FieldValue = {
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
    valueArray?: V3_0_3_FieldValue[];
    valueObject?: { [name: string]: V3_0_3_FieldValue };
    valueAddress?: { [name: string]: string };
    content?: string;
    boundingRegions?: BoundingRegion[];
    confidence?: Confidence;
    spans?: V3_0_3_Span[];
};

type V3_0_3_Span = {
    offset: number;
    length: number;
};

type Polygon = [number, number, number, number, number, number, number, number];

type DocumentCurrencyType = {
    currencySymbol?: string;
    currency?: string;
    amount: number;
};

type SelectionMarkState = "selected" | "unselected";

type Confidence = number;

type DocumentTableCellKind = "content" | "rowHeader" | "columnHeader" | "stub" | "description";

type FieldValueType =
    | "string"
    | "date"
    | "time"
    | "phoneNumber"
    | "address"
    | "number"
    | "integer"
    | "selectionMark"
    | "countryRegion"
    | "currency"
    | "signature"
    | "array"
    | "object";

type DocumentSignatureType = "signed" | "unsigned";
