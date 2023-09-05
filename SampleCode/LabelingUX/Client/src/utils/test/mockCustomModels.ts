import {
    ArrayField,
    Definitions,
    Field,
    Label,
    LabelType,
    ObjectField,
    LabelValueCandidate,
} from "models/customModels";
import { SharedColors } from "@fluentui/react";
import { FeatureCategory } from "view/components/imageMap/contracts";

export const mockFields = [
    {
        fieldKey: "Address",
        fieldType: "string",
        fieldFormat: "not-specified",
    },
    {
        fieldKey: "SelectionMark",
        fieldType: "selectionMark",
        fieldFormat: "not-specified",
    },
    {
        fieldKey: "Signature",
        fieldType: "signature",
        fieldFormat: "not-specified",
    },
    {
        fieldKey: "DynamicTable/abc",
        fieldType: "array",
        fieldFormat: "not-specified",
        itemType: "DynamicTable/abc_object",
        fields: null,
    },
    {
        fieldKey: "FixedRowTable",
        fieldType: "object",
        fieldFormat: "not-specified",
        itemType: null,
        fields: [
            {
                fieldKey: "abc",
                fieldType: "FixedRowTable_object",
                fieldFormat: "not-specified",
            },
            {
                fieldKey: "def",
                fieldType: "FixedRowTable_object",
                fieldFormat: "not-specified",
            },
        ],
        visualizationHint: "horizontal",
    },
    {
        fieldKey: "FixedColumnTable",
        fieldType: "object",
        fieldFormat: "not-specified",
        itemType: null,
        fields: [
            {
                fieldKey: "addr",
                fieldType: "FixedColumnTable_object",
                fieldFormat: "not-specified",
            },
        ],
        visualizationHint: "vertical",
    },
] as Field[];

export const mockInvalidFields = {
    $schema: "https://schema.cognitiveservices.azure.com/formrecognizer/2021-03-01/fields.json",
    fields: [
        {
            fieldKey: "Distributions",
            fieldFormat: "not-specified",
            fieldType: "array",
        },
        {
            fieldKey: "TaxExempt",
            fieldFormat: "not-specified",
            fieldType: "array",
            itemType: "CodeAmount_object",
        },
        {
            fieldKey: "OtherInformation",
            fieldFormat: "not-specified",
            fieldType: "array",
            itemType: "CodeAmount_object",
        },
    ],
    definitions: {
        CodeAmount_object: {
            fieldKey: "CodeAmount_object",
            fieldType: "object",
            fieldFormat: "not-specified",
            fields: [
                {
                    fieldKey: "Code",
                    fieldType: "string",
                    fieldFormat: "not-specified",
                },
                {
                    fieldKey: "Amount",
                    fieldType: "string",
                    fieldFormat: "not-specified",
                },
            ],
        },
    },
};

const firstField = "firstField";
const secondField = "secondField";
const thirdField = "thirdField";
const newFieldName = "newFieldName";

export const mockColorForFields: Record<any, string>[] = [
    { [firstField]: SharedColors.red10 },
    { [secondField]: SharedColors.orange10 },
    { [thirdField]: SharedColors.gray10 },
];

export const mockSetColorForFieldsByNamePayload = {
    fieldName: firstField,
    newFieldName: newFieldName,
};

export const mockSetColorForFieldsByNameResult = [
    { [newFieldName]: SharedColors.red10 },
    { [secondField]: SharedColors.orange10 },
    { [thirdField]: SharedColors.gray10 },
];

export const mockAddedField = {
    fieldKey: "MockAddedField",
    fieldType: "string",
    fieldFormat: "not-specified",
} as Field;

export const mockDynamicTableField = mockFields[3] as ArrayField;
export const mockFixedRowTableField = mockFields[4] as ObjectField;
export const mockFixedColumnTableField = mockFields[5] as ObjectField;
export const mockDynamicTableDefinition = {
    fieldKey: "DynamicTable/abc_object",
    fieldType: "object",
    fieldFormat: "not-specified",
    itemType: null,
    fields: [
        {
            fieldKey: "CUSTOMER#",
            fieldType: "number",
            fieldFormat: "not-specified",
        },
        {
            fieldKey: "LICNESE#",
            fieldType: "number",
            fieldFormat: "not-specified",
        },
        {
            fieldKey: "TERMS",
            fieldType: "string",
            fieldFormat: "not-specified",
        },
    ],
};
export const mockFixedRowTableDefinition = {
    fieldKey: "FixedRowTable_object",
    fieldType: "object",
    fieldFormat: "not-specified",
    fields: [
        {
            fieldKey: "DATE",
            fieldType: "date",
            fieldFormat: "not-specified",
        },
        {
            fieldKey: "INVOICE#",
            fieldType: "number",
            fieldFormat: "not-specified",
        },
    ],
};
export const mockFixedColumnTableDefinition = {
    fieldKey: "FixedColumnTable_object",
    fieldType: "object",
    fieldFormat: "not-specified",
    fields: [
        {
            fieldKey: "BILL TO",
            fieldType: "string",
            fieldFormat: "not-specified",
        },
    ],
};

export const mockDefinitions = {
    [mockDynamicTableDefinition.fieldKey]: mockDynamicTableDefinition,
    [mockFixedRowTableDefinition.fieldKey]: mockFixedRowTableDefinition,
    [mockFixedColumnTableDefinition.fieldKey]: mockFixedColumnTableDefinition,
} as Definitions;

export const mockDynamicTableLabels = [
    {
        label: "DynamicTable~1abc/0/CUSTOMER#",
        value: [
            {
                page: 1,
                text: "13267",
                boundingBoxes: [
                    [
                        0.8563411764705883, 0.18608181818181818, 0.8621529411764706, 0.18608181818181818,
                        0.8621529411764706, 0.1929909090909091, 0.8563411764705883, 0.1929909090909091,
                    ],
                ],
            },
        ],
    },
];

export const mockNewDynamicTableLabels = [
    {
        label: "DynamicTable~1abc/1/CUSTOMER#",
        value: [
            {
                page: 1,
                text: "13267",
                boundingBoxes: [
                    [
                        0.8563411764705883, 0.18608181818181818, 0.8621529411764706, 0.18608181818181818,
                        0.8621529411764706, 0.1929909090909091, 0.8563411764705883, 0.1929909090909091,
                    ],
                ],
            },
        ],
    },
];

export const mockTableRegionLabels = [
    {
        label: "DynamicTable~1abc/1/CUSTOMER#",
        labelType: LabelType.Region,
        value: [
            {
                page: 1,
                text: "",
                boundingBoxes: [
                    [
                        0.14386946533493017, 0.5834019229712163, 0.20390065437038565, 0.5834019229712163,
                        0.20390065437038565, 0.6099782306171211, 0.14386946533493017, 0.6099782306171211,
                    ],
                ],
            },
        ],
    },
];

export const mockFixedRowTableLabels = [
    {
        label: "FixedRowTable/abc/DATE",
        value: [
            {
                page: 1,
                text: "130",
                boundingBoxes: [
                    [
                        0.10788235294117647, 0.6268090909090909, 0.1326, 0.6268090909090909, 0.1326, 0.6343545454545455,
                        0.10788235294117647, 0.6343545454545455,
                    ],
                ],
            },
        ],
    },
];
export const mockFixedColumnTableLabels = [
    {
        label: "FixedColumnTable/addr/BILL TO",
        key: null,
        value: [
            {
                page: 1,
                text: "NEW",
                boundingBoxes: [
                    [
                        0.06801711033336869, 0.2118040068814229, 0.09837263289379101, 0.2118040068814229,
                        0.09837263289379101, 0.22309099680505365, 0.06801711033336869, 0.22309099680505365,
                    ],
                ],
            },
        ],
    },
];

export const mockStringRegionDocumentLabels = [
    {
        label: "Address",
        value: [
            {
                page: 1,
                text: "",
                boundingBoxes: [
                    [
                        0.8573176470588235, 0.1557818181818182, 0.8605529411764706, 0.1557818181818182,
                        0.8605529411764706, 0.1626909090909091, 0.8573176470588235, 0.1626909090909091,
                    ],
                ],
            },
        ],
        labelType: LabelType.Region,
    },
] as Label[];

export const mockDocumentLabels = [
    {
        label: "Address",
        value: [
            {
                page: 1,
                text: "NEW",
                boundingBoxes: [
                    [
                        0.8573176470588235, 0.1557818181818182, 0.8605529411764706, 0.1557818181818182,
                        0.8605529411764706, 0.1626909090909091, 0.8573176470588235, 0.1626909090909091,
                    ],
                ],
            },
            {
                page: 1,
                text: "BELGIUM",
                boundingBoxes: [
                    [
                        0.8705411764705883, 0.1557818181818182, 0.8902823529411765, 0.1557818181818182,
                        0.8902823529411765, 0.1628, 0.8705411764705883, 0.1628,
                    ],
                ],
            },
            {
                page: 1,
                text: "BREWERY",
                boundingBoxes: [
                    [
                        0.8986117647058824, 0.1557818181818182, 0.918364705882353, 0.1557818181818182,
                        0.918364705882353, 0.1628, 0.8986117647058824, 0.1628,
                    ],
                ],
            },
        ],
    },
    {
        label: "SelectionMark",
        value: [
            {
                page: 1,
                text: "unselected",
                boundingBoxes: [
                    [
                        0.8775058823529411, 0.17092727272727273, 0.8903176470588235, 0.17092727272727273,
                        0.8903176470588235, 0.17794545454545455, 0.8775058823529411, 0.17794545454545455,
                    ],
                ],
            },
        ],
    },
    {
        label: "Signature",
        labelType: "region",
        value: [
            {
                page: 1,
                text: "",
                boundingBoxes: [
                    [
                        0.8984470588235294, 0.17092727272727273, 0.9167058823529411, 0.17092727272727273,
                        0.9167058823529411, 0.17784545454545453, 0.8984470588235294, 0.17784545454545453,
                    ],
                ],
            },
        ],
    },
    ...mockDynamicTableLabels,
    ...mockFixedRowTableLabels,
    ...mockFixedColumnTableLabels,
] as Label[];

export const mockLabelCandidateSameBoundingBoxDiffPage: LabelValueCandidate[] = [
    {
        boundingBoxes: [
            [
                0.8573176470588235, 0.1557818181818182, 0.8605529411764706, 0.1557818181818182, 0.8605529411764706,
                0.1626909090909091, 0.8573176470588235, 0.1626909090909091,
            ],
        ],
        page: 2,
        text: "NEW",
        category: FeatureCategory.Text,
    },
    {
        boundingBoxes: [
            [
                0.8705411764705883, 0.1557818181818182, 0.8902823529411765, 0.1557818181818182, 0.8902823529411765,
                0.1628, 0.8705411764705883, 0.1628,
            ],
        ],
        page: 2,
        text: "NEW",
        category: FeatureCategory.Text,
    },
    {
        boundingBoxes: [
            [
                0.8986117647058824, 0.1557818181818182, 0.918364705882353, 0.1557818181818182, 0.918364705882353,
                0.1628, 0.8986117647058824, 0.1628,
            ],
        ],
        page: 2,
        text: "NEW",
        category: FeatureCategory.Text,
    },
];

export const mockStringLabelValueCandidates: LabelValueCandidate[] = [
    {
        boundingBoxes: [
            [
                0.8323647058823529, 0.05354545454545454, 0.9398352941176471, 0.05354545454545454, 0.9398352941176471,
                0.06997272727272728, 0.8323647058823529, 0.06997272727272728,
            ],
        ],
        page: 1,
        text: "Depreciation",
        category: FeatureCategory.Text,
    },
    {
        boundingBoxes: [
            [
                0.2169529411764706, 0.06253636363636363, 0.2727176470588235, 0.06253636363636363, 0.2727176470588235,
                0.07863636363636363, 0.2169529411764706, 0.07863636363636363,
            ],
        ],
        page: 1,
        text: "and",
        category: FeatureCategory.Text,
    },
    {
        boundingBoxes: [
            [
                0.06954117647058823, 0.062336363636363634, 0.2053058823529412, 0.062336363636363634, 0.2053058823529412,
                0.07876363636363636, 0.06954117647058823, 0.07876363636363636,
            ],
        ],
        page: 1,
        text: "Amortization",
        category: FeatureCategory.Text,
    },
];

export const mockSelectionMarkLabelValueCandidates: LabelValueCandidate[] = [
    {
        boundingBoxes: [
            [
                0.5086, 0.5116272727272727, 0.5595529411764706, 0.5116272727272727, 0.5595529411764706,
                0.5332181818181818, 0.5086, 0.5332181818181818,
            ],
        ],
        page: 1,
        text: "unselected",
        category: FeatureCategory.Checkbox,
    },
];

export const mockRegionLabelValueCandidates: LabelValueCandidate[] = [
    {
        boundingBoxes: [
            [
                0.18709411764705883, 0.8890454545454546, 0.23390588235294119, 0.8890454545454546, 0.23390588235294119,
                0.8988818181818182, 0.18709411764705883, 0.8988818181818182,
            ],
        ],
        page: 1,
        text: "",
        category: FeatureCategory.DrawnRegion,
    },
];
