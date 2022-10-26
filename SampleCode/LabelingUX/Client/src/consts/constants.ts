export const constants = {
    defaultSplitPaneSizes: {
        analyzeSplitPaneSize: [70, 30],
        labelSplitPaneSize: [80, 20],
        labelTableSplitPaneSize: [65, 35],
    },
    dynamicTableImgSrc: "/images/customModels/dynamic-table.png",
    fixedTableImgSrc: "/images/customModels/fixed-table.png",
    fieldsSchema: "https://schema.cognitiveservices.azure.com/formrecognizer/2021-03-01/fields.json",
    labelsSchema: "https://schema.cognitiveservices.azure.com/formrecognizer/2021-03-01/labels.json",
    fieldsFile: "fields.json",
    labelFileExtension: ".labels.json",
    ocrFileExtension: ".ocr.json",
};

export enum LoadingOverlayWeights {
    ExtraLight = 0,
    Light = 10,
    Default = 20,
    SemiHeavy = 30,
    Heavy = 40,
    ExtraHeavy = 50,
}

export enum KeyEventType {
    KeyDown = "keydown",
    KeyUp = "keyup",
}

export enum KeyEventCode {
    Shift = "Shift",
    Escape = "Escape",
}
