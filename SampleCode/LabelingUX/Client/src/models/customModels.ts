import { FeatureCategory } from "view/components/imageMap/contracts";
import { Polygon } from "./analyzeResult";

export type CustomModel = {
    modelId: string;
    description: string;
    createdDateTime: string;
    apiVersion?: string;
    tags?: {
        modelType?: string;
        [key: string]: string | undefined;
    };
};

export type PrimitiveField = {
    fieldKey: string;
    fieldType: FieldType;
    fieldFormat: FieldFormat;
};

export type ObjectField = {
    fieldKey: string;
    fieldType: FieldType;
    fields: Field[];
    fieldFormat: FieldFormat;
    visualizationHint?: VisualizationHint;
};

export type ArrayField = {
    fieldKey: string;
    fieldType: FieldType;
    itemType: string;
    visualizationHint?: VisualizationHint;
};

export type Field = PrimitiveField | ObjectField | ArrayField;

export type FieldsWithOrder = Field & { order: number };

export enum FieldType {
    String = "string",
    Number = "number",
    Date = "date",
    Time = "time",
    Integer = "integer",
    SelectionMark = "selectionMark",
    Signature = "signature",
    Array = "array",
    Object = "object",
}

export enum FieldFormat {
    NotSpecified = "not-specified",
    Currency = "currency",
    Decimal = "decimal",
    DecimalCommaSeparated = "decimal-comma-separated",
    NoWhiteSpaces = "no-white-spaces",
    Alphanumeric = "alphanumeric",
    DMY = "dmy",
    MDY = "mdy",
    YMD = "ymd",
}

export enum VisualizationHint {
    Horizontal = "horizontal",
    Vertical = "vertical",
}

export type Labels = {
    [documentName: string]: Label[];
};

export type Label = {
    label: string;
    value: LabelValue[];
    labelType?: LabelType;
};

export type LabelValue = {
    boundingBoxes: Polygon[];
    page: number;
    text: string;
};

export type LabelValueCandidate = {
    boundingBoxes: Polygon[];
    page: number;
    text: string;
    category: FeatureCategory;
    alreadyAssignedLabelName?: string;
};

export enum LabelType {
    Words = "words",
    Region = "region",
}

export type Definitions = {
    [objectName: string]: ObjectField;
};

export enum TableType {
    dynamic = "dynamic",
    fixed = "fixed",
}

export enum HeaderType {
    row = "row",
    column = "column",
}
