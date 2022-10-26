import { SharedColors } from "@fluentui/react";
import { AnalyzeResultAdapterFactory } from "adapters/analyzeResultAdapter";
import { colors } from "consts/colors";
import { Field, FieldType, Label, Labels, LabelValue, LabelValueCandidate } from "models/customModels";
import { CustomModelAssetService } from "services/assetService/customModelAssetService";
import { FieldLocation, ICustomModelError } from "store/customModel/customModel";
import { IDocument } from "store/documents/documentsTypes";
import { FeatureCategory } from "view/components/imageMap/contracts";
import { createRegionIdFromPolygon } from "view/components/imageMap/utils";

export const buildRegionOrders = (analyzeResult) => {
    const analyzeResultAdapter = AnalyzeResultAdapterFactory.create(analyzeResult);
    const documentPage = analyzeResultAdapter.getDocumentPages();
    const regionOrders = {};
    documentPage.forEach((page) => {
        const { pageNumber, selectionMarks, width, height } = page;

        let order = 0;
        page.words.forEach((word) => {
            const { polygon } = word;
            if (polygon) {
                const normalizedPoints: number[] = [];
                for (let i = 0; i < polygon.length; i += 2) {
                    normalizedPoints.push(polygon[i] / width);
                    normalizedPoints.push(polygon[i + 1] / height);
                }
                const orderId = createRegionIdFromPolygon(normalizedPoints, pageNumber);
                regionOrders[orderId] = order++;
            }
        });

        if (selectionMarks) {
            selectionMarks.forEach((selectionMark) => {
                const { polygon } = selectionMark;
                if (polygon) {
                    const normalizedPoints: number[] = [];
                    for (let i = 0; i < polygon.length; i += 2) {
                        normalizedPoints.push(polygon[i] / width);
                        normalizedPoints.push(polygon[i + 1] / height);
                    }
                    const orderId = createRegionIdFromPolygon(normalizedPoints, pageNumber);
                    regionOrders[orderId] = order++;
                }
            });
        }
    });
    return regionOrders;
};

export const decodeLabelString = (label: string): string => {
    return label.replace(/~1/g, "/").replace(/~0/g, "~");
};

export const getFieldKeyFromLabel = (label: Label): string => {
    return decodeLabelString(label.label.split("/")[0]);
};

export const getTableFieldKeyFromLabel = (label: Label, fieldLocation: FieldLocation): string => {
    const labelIndex = fieldLocation === FieldLocation.field ? 1 : 2;
    return decodeLabelString(label.label.split("/")[labelIndex]);
};

export const getAllDocumentLabels = async (
    labels: Labels,
    documents: IDocument[],
    assetService: CustomModelAssetService
) => {
    const documentsWithoutLabels = documents.filter((document) => !labels[document.name]).map((doc) => doc.name);
    const addedLabels = await assetService.fetchAllDocumentLabels(documentsWithoutLabels);
    return { ...labels, ...addedLabels };
};

export const encodeLabelString = (label: string): string => {
    // Encoding for "/" since it will be used in table labeling result.
    return label.replace(/~/g, "~0").replace(/\//g, "~1");
};

export const getColorByFieldKey = (colorForFields: Record<string, string>[], fieldKey: string) => {
    const getDynamicKey = (obj: Record<string, string>) => Object.keys(obj)[0];

    const colorMap = colorForFields.find((color) => getDynamicKey(color) === fieldKey);
    return colorMap ? colorMap[fieldKey] : SharedColors.gray10;
};

export const getFieldColor = (fields: Field[], key: string): string => {
    const index = fields.findIndex((field) => field.fieldKey === key);
    const colorCounts = colors.length;

    if (index !== -1) {
        return colors[index % colorCounts];
    } else {
        return SharedColors.gray10;
    }
};

export const uniqueByKeepFirst = (array, key) => {
    let seen = new Set();
    return array.filter((item) => {
        let k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
};

export const makeLabelValue = (labelValueCandidate: LabelValueCandidate) => {
    const { page, text, boundingBoxes } = labelValueCandidate;
    return { page, text, boundingBoxes };
};

export const getOrder = (currentOrders: { [key: string]: number }, orderId: string): number => {
    const orderNumber = currentOrders[orderId];
    if (orderNumber !== undefined) {
        return orderNumber;
    }
    return 0;
};

export const compareOrder = (a: LabelValue, b: LabelValue, currentOrders, currentPage) => {
    const order1 = getOrder(currentOrders, createRegionIdFromPolygon(a.boundingBoxes[0], currentPage));
    const order2 = getOrder(currentOrders, createRegionIdFromPolygon(b.boundingBoxes[0], currentPage));
    return order1 >= order2 ? 1 : -1;
};

export const makeError = (name: string, message: string): ICustomModelError => {
    return { name, message };
};

export const validateAssignment = (candidates: LabelValueCandidate[], field: Field) => {
    switch (field.fieldType) {
        case FieldType.Signature:
            if (candidates.length !== 1 || candidates[0].category !== FeatureCategory.DrawnRegion) {
                throw makeError("Label assignment warning", "Signature field only supports one draw region per field.");
            }
            break;
        case FieldType.SelectionMark:
            if (
                candidates.length !== 1 ||
                !(
                    candidates[0].category === FeatureCategory.Checkbox ||
                    candidates[0].category === FeatureCategory.DrawnRegion
                )
            ) {
                throw makeError(
                    "Label assignment warning",
                    "SelectionMark field only supports one draw region or checkbox per field."
                );
            }
            break;
        default:
            // Text or table cell
            if (candidates.length > 1 && candidates.some((c) => c.category === FeatureCategory.DrawnRegion)) {
                throw makeError(
                    "Label assignment warning",
                    "General text field only supports one single draw region, or one or more text boxes."
                );
            }
            break;
    }
};

export const getUnusedFieldColor = (colorForFields: Record<string, string>[]) => {
    const getDynamicValue = (obj: Record<string, string>) => Object.values(obj)[0];

    const colorCounts = colors.length;
    const usedColors = colorForFields.map((field) => getDynamicValue(field));
    const unusedColors = colors.filter((color) => !usedColors.includes(color));

    if (colorForFields.length >= colorCounts && unusedColors.length === 0) {
        const initialUsageCount = colors.reduce((acc, color) => ({ ...acc, [color]: 0 }), {});
        const usageCount = usedColors.reduce((result, value) => ({ ...result, [value]: (result[value] || 0) + 1 }), {});

        const totalUsageCount = { ...initialUsageCount, ...usageCount };
        const colorCycleRound = Math.ceil(colorForFields.length / colorCounts);

        const leastUsedColorIndex = (Object.values(totalUsageCount) as number[]).findIndex(
            (count: number) => count < colorCycleRound
        );

        return colors[leastUsedColorIndex];
    }

    return unusedColors[0];
};
