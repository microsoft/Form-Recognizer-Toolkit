import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

import { ApplicationState } from "store";
import {
    getFieldKeyFromLabel,
    getTableFieldKeyFromLabel,
    getAllDocumentLabels,
    encodeLabelString,
    uniqueByKeepFirst,
    buildRegionOrders,
    makeLabelValue,
    compareOrder,
    decodeLabelString,
    validateAssignment,
    makeError,
} from "utils/customModel";
import {
    Labels,
    Field,
    Definitions,
    FieldType,
    LabelValueCandidate,
    FieldFormat,
    LabelValue,
    LabelType,
    HeaderType,
    TableType,
    VisualizationHint,
} from "models/customModels";
import { CustomModelAssetService } from "services/assetService/customModelAssetService";
import { setDocumentPrediction } from "store/predictions/predictions";
import { FeatureCategory } from "view/components/imageMap/contracts";

export enum FieldLocation {
    field,
    definition,
}

export type MessageDescriptorArguments = {
    [name: string]: string;
};

export interface ICustomModelError {
    name: string;
    message: string;
    messageArguments?: MessageDescriptorArguments;
}

export type CustomModelState = {
    definitions: Definitions;
    fields: Field[];
    colorForFields: Record<string, string>[];
    labels: Labels;

    orders: {
        [documentName: string]: { [orderId: string]: number };
    };
    labelValueCandidates: LabelValueCandidate[];
    labelError: ICustomModelError | null;
    hideInlineLabelMenu: boolean;
};

export const initialState: CustomModelState = {
    definitions: {},
    fields: [],
    colorForFields: [],
    labels: {},
    orders: {},
    labelValueCandidates: [],
    labelError: null,
    hideInlineLabelMenu: false,
};

export const addField = createAsyncThunk<Field, Field, { rejectValue: any }>(
    "customModel/addField",
    async (field: Field, { getState, rejectWithValue }) => {
        try {
            const { customModel } = getState() as ApplicationState;
            const { fields, definitions } = customModel;
            const assetService = new CustomModelAssetService();
            const updatedFields = fields.concat(field);
            await assetService.updateFields(updatedFields, definitions);
            return field;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateFieldsOrder = createAsyncThunk<Field[], Field[], { rejectValue: any }>(
    "customModel/updateFieldsOrder",
    async (updatedFields: Field[], { getState, rejectWithValue }) => {
        try {
            const { customModel } = getState() as ApplicationState;
            const { definitions } = customModel;
            const assetService = new CustomModelAssetService();
            await assetService.updateFields(updatedFields, definitions);
            return updatedFields;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const addTableField = createAsyncThunk<
    {
        fields: Field[];
        definitions: Definitions;
    },
    { fieldKey: string; tableType: TableType; headerType?: HeaderType },
    { rejectValue: any }
>(
    "customModel/addTableField",
    async (
        args: { fieldKey: string; tableType: TableType; headerType?: HeaderType },
        { getState, rejectWithValue }
    ) => {
        try {
            const { fieldKey, tableType, headerType } = args;
            const { customModel } = getState() as ApplicationState;
            const { fields, definitions } = customModel;
            const assetService = new CustomModelAssetService();

            const getTableFields = (headerType: HeaderType, fieldType) =>
                new Array(2).fill(null).map((_, index) => ({
                    fieldKey: headerType === HeaderType.column ? `COLUMN${index + 1}` : `ROW${index + 1}`,
                    fieldType,
                    fieldFormat: FieldFormat.NotSpecified,
                }));

            const objectName = `${fieldKey}_object`;
            let field: any = { fieldKey, fieldFormat: FieldFormat.NotSpecified };
            let definition: any = {
                fieldKey: objectName,
                fieldType: FieldType.Object,
                fieldFormat: FieldFormat.NotSpecified,
            };

            if (tableType === TableType.dynamic) {
                field = { ...field, fieldType: FieldType.Array, itemType: objectName };
                definition = { ...definition, fields: getTableFields(HeaderType.column, FieldType.String) };
            } else {
                if (headerType === HeaderType.column) {
                    field = {
                        ...field,
                        fieldType: FieldType.Object,
                        fields: getTableFields(HeaderType.row, objectName),
                        visualizationHint: VisualizationHint.Vertical,
                    };
                    definition = { ...definition, fields: getTableFields(HeaderType.column, FieldType.String) };
                } else {
                    field = {
                        ...field,
                        fieldType: FieldType.Object,
                        fields: getTableFields(HeaderType.column, objectName),
                        visualizationHint: VisualizationHint.Horizontal,
                    };
                    definition = { ...definition, fields: getTableFields(HeaderType.row, FieldType.String) };
                }
            }

            const updatedFields = fields.concat(field);
            const updatedDefinitions = { ...definitions, [objectName]: definition };

            await assetService.updateFields(updatedFields, updatedDefinitions);
            return { fields: updatedFields, definitions: updatedDefinitions };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const switchSubType = createAsyncThunk<
    { index: number; field: Field },
    { fieldKey: string; fieldType: FieldType },
    { rejectValue: any }
>(
    "customModel/switchSubType",
    async (args: { fieldKey: string; fieldType: FieldType }, { getState, rejectWithValue }) => {
        try {
            const { fieldKey, fieldType } = args;
            const { customModel } = getState() as ApplicationState;
            const { fields, definitions } = customModel;
            const assetService = new CustomModelAssetService();

            // Find the target field and switch its type.
            const fieldIndex = fields.findIndex((field) => field.fieldKey === fieldKey)!;
            const updatedField = { ...fields[fieldIndex] };
            updatedField.fieldType = fieldType;

            // Update to origin fields.
            const updatedFields = fields.slice();
            updatedFields.splice(fieldIndex, 1, updatedField);
            await assetService.updateFields(updatedFields, definitions);

            return { index: fieldIndex, field: updatedField };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const switchTableFieldsSubType = createAsyncThunk<
    {
        definitions: Definitions;
    },
    { tableFieldKey: string; headerField: Field; newType: FieldType },
    { rejectValue: any }
>(
    "customModel/switchTableFieldsSubType ",
    async (args: { tableFieldKey: string; headerField: Field; newType: FieldType }, { getState, rejectWithValue }) => {
        try {
            const { tableFieldKey, headerField, newType } = args;
            const { customModel } = getState() as ApplicationState;
            const { fields, definitions } = customModel;
            const { fieldKey, fieldType } = headerField;
            if (fieldType === newType) {
                return {
                    definitions,
                };
            }

            const assetService = new CustomModelAssetService();
            const updatedDefinitions = { ...definitions };
            const originTableFieldIndex = fields.findIndex((field) => field.fieldKey === tableFieldKey);
            const originTableField: any = fields[originTableFieldIndex];
            // Only update definitions.
            const fieldDefinitionNames = originTableField.itemType
                ? [originTableField.itemType]
                : originTableField.fields.map((field) => field.fieldType);
            fieldDefinitionNames.forEach((name) => {
                const definition = { ...definitions[name] };
                const updatedFields = definition.fields.map((field) =>
                    field.fieldKey === fieldKey ? { ...field, fieldType: newType } : field
                );
                updatedDefinitions[name] = { ...definition, fields: updatedFields };
            });
            await assetService.updateFields(fields, updatedDefinitions);

            return { definitions: updatedDefinitions };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteField = createAsyncThunk<
    {
        fields: Field[];
        labels: Labels;
        definitions: Definitions;
    },
    string,
    { rejectValue: any }
>("customModel/deleteField", async (fieldKey: string, { getState, rejectWithValue }) => {
    try {
        const { customModel, documents } = getState() as ApplicationState;
        const { fields, labels, definitions } = customModel;
        const assetService = new CustomModelAssetService();

        // Fetch all document labels and update the label data with target field.
        let allLabels = await getAllDocumentLabels(labels, documents.documents, assetService);
        const updatedLabels = {};
        Object.entries(allLabels).forEach(([documentName, labels]) => {
            if (labels.find((label) => getFieldKeyFromLabel(label) === fieldKey)) {
                const updatedDocLabels = labels.filter((label) => getFieldKeyFromLabel(label) !== fieldKey);
                updatedLabels[documentName] = updatedDocLabels;
            }
        });
        allLabels = { ...allLabels, ...updatedLabels };

        // Update fields and definitions.
        const updatedFields = fields.filter((field) => field.fieldKey !== fieldKey);
        const targetField = fields.find((field) => field.fieldKey === fieldKey)! as any;
        const updatedDefinitions = { ...definitions };
        if (targetField.itemType) {
            // Delete dynamic row table cell definitions.
            delete updatedDefinitions[targetField.itemType];
        }
        if (targetField.fields) {
            // Delete fixed table cell definitions.
            const fieldTypesToDelete = targetField.fields.map((field) => field.fieldType);
            fieldTypesToDelete.forEach((fieldType) => delete updatedDefinitions[fieldType]);
        }

        await Promise.all([
            assetService.updateFields(updatedFields, updatedDefinitions),
            assetService.updateDocumentLabels(updatedLabels),
        ]);
        return { fields: updatedFields, labels: allLabels, definitions: updatedDefinitions };
    } catch (err) {
        return rejectWithValue(err);
    }
});

export const renameField = createAsyncThunk<
    {
        fields: Field[];
        labels: Labels;
        definitions: Definitions;
    },
    { fieldKey: string; newName: string },
    { rejectValue: any }
>("customModel/renameField", async (args: { fieldKey: string; newName: string }, { getState, rejectWithValue }) => {
    try {
        const { fieldKey, newName } = args;
        const { customModel, documents } = getState() as ApplicationState;
        const { fields, labels, definitions } = customModel;
        const assetService = new CustomModelAssetService();

        // Fetch all document labels and update the label data with target field.
        let allLabels = await getAllDocumentLabels(labels, documents.documents, assetService);

        // Update labels.
        const updatedLabels = {};
        Object.entries(allLabels).forEach(([documentName, labels]) => {
            // Only process the document that contains target label.
            if (labels.find((label) => getFieldKeyFromLabel(label) === fieldKey)) {
                const updatedDocLabels = labels.map((label) => {
                    if (getFieldKeyFromLabel(label) === fieldKey) {
                        const newLabel = label.label.split("/");
                        newLabel[0] = encodeLabelString(newName); // Replace old fieldKey with new one.
                        return { ...label, label: newLabel.join("/") };
                    }
                    return label;
                });
                updatedLabels[documentName] = updatedDocLabels;
            }
        });
        allLabels = { ...allLabels, ...updatedLabels };

        // Update fields.
        const newObjectName = `${newName}_object`;
        const originFieldIndex = fields.findIndex((field) => field.fieldKey === fieldKey);
        const originField: any = fields[originFieldIndex];
        const updatedField = {
            ...originField,
            ...(originField.itemType && { itemType: newObjectName }),
            ...(originField.fields && {
                fields: originField.fields.map((field) => ({ ...field, fieldType: newObjectName })),
            }),
            fieldKey: newName,
        };
        const updatedFields = [...fields];
        updatedFields.splice(originFieldIndex, 1, updatedField);

        // Update definitions.
        const updatedDefinitions = { ...definitions };
        if (originField.itemType) {
            // For dynamic table.
            updatedDefinitions[newObjectName] = {
                ...updatedDefinitions[originField.itemType],
                fieldKey: newObjectName,
            };
            delete updatedDefinitions[originField.itemType];
        }
        if (originField.fields) {
            // For fixed table.
            const originFieldTypes = originField.fields.map((field) => field.fieldType);
            updatedDefinitions[newObjectName] = {
                ...updatedDefinitions[originFieldTypes[0]],
                fieldKey: newObjectName,
            };
            originFieldTypes.forEach((fieldType) => delete updatedDefinitions[fieldType]);
        }

        await Promise.all([
            assetService.updateFields(updatedFields, updatedDefinitions),
            assetService.updateDocumentLabels(updatedLabels),
        ]);
        return { fields: updatedFields, labels: allLabels, definitions: updatedDefinitions };
    } catch (err) {
        return rejectWithValue(err);
    }
});

export const deleteTableField = createAsyncThunk<
    {
        fields: Field[];
        labels: Labels;
        definitions: Definitions;
    },
    { tableFieldKey: string; fieldKey: string; fieldLocation: FieldLocation },
    { rejectValue: any }
>(
    "customModel/deleteTableField",
    async (
        args: { tableFieldKey: string; fieldKey: string; fieldLocation: FieldLocation },
        { getState, rejectWithValue }
    ) => {
        try {
            const { tableFieldKey, fieldKey, fieldLocation } = args;
            const { customModel, documents } = getState() as ApplicationState;
            const { fields, labels, definitions } = customModel;
            const assetService = new CustomModelAssetService();

            // Fetch all document labels and update the label data with target field.
            let allLabels = await getAllDocumentLabels(labels, documents.documents, assetService);

            // Update labels.
            const updatedLabels = {};
            const isTargetLabel = (label) =>
                getFieldKeyFromLabel(label) === tableFieldKey &&
                getTableFieldKeyFromLabel(label, fieldLocation) === fieldKey;
            Object.entries(allLabels).forEach(([documentName, labels]) => {
                // Only process the document that contains target label.
                if (labels.find(isTargetLabel)) {
                    const updatedDocLabels = labels.filter((label) => !isTargetLabel(label));
                    updatedLabels[documentName] = updatedDocLabels;
                }
            });
            allLabels = { ...allLabels, ...updatedLabels };

            const updatedFields = [...fields];
            const updatedDefinitions = { ...definitions };
            const originTableFieldIndex = fields.findIndex((field) => field.fieldKey === tableFieldKey);
            const originTableField: any = fields[originTableFieldIndex];
            if (fieldLocation === FieldLocation.field) {
                // Update fields.
                const tableFields = originTableField.fields.filter((field) => field.fieldKey !== fieldKey);
                updatedFields.splice(originTableFieldIndex, 1, { ...originTableField, fields: tableFields });
            } else {
                // Update definitions.
                const objectName = originTableField.itemType || originTableField.fields[0].fieldType;
                const definition = { ...definitions[objectName] };
                const definitionFields = definition.fields.filter((field) => field.fieldKey !== fieldKey);
                updatedDefinitions[objectName] = { ...definition, fields: definitionFields };
            }

            await Promise.all([
                assetService.updateFields(updatedFields, updatedDefinitions),
                assetService.updateDocumentLabels(updatedLabels),
            ]);
            return { fields: updatedFields, labels: allLabels, definitions: updatedDefinitions };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const insertTableField = createAsyncThunk<
    {
        fields: Field[];
        definitions: Definitions;
    },
    { tableFieldKey: string; fieldKey: string; index: number; fieldLocation: FieldLocation },
    { rejectValue: any }
>(
    "customModel/insertTableField",
    async (
        args: { tableFieldKey: string; fieldKey: string; index: number; fieldLocation: FieldLocation },
        { getState, rejectWithValue }
    ) => {
        try {
            const { tableFieldKey, fieldKey, index, fieldLocation } = args;
            const { customModel } = getState() as ApplicationState;
            const { fields, definitions } = customModel;
            const assetService = new CustomModelAssetService();
            const updatedFields = [...fields];
            const updatedDefinitions = { ...definitions };
            const objectName = `${tableFieldKey}_object`;
            const insertField: any = {
                fieldKey,
                fieldType: fieldLocation === FieldLocation.field ? objectName : FieldType.String,
                fieldFormat: FieldFormat.NotSpecified,
            };
            const tableFieldIndex = fields.findIndex((field) => field.fieldKey === tableFieldKey);

            if (fieldLocation === FieldLocation.field) {
                const insertedFields = (fields[tableFieldIndex] as any).fields.slice();
                insertedFields.splice(index, 0, insertField);
                const updatedTableField = { ...fields[tableFieldIndex], fields: insertedFields };
                updatedFields.splice(tableFieldIndex, 1, updatedTableField);
            } else {
                const insertedFields = definitions[objectName].fields.slice();
                insertedFields.splice(index, 0, insertField);
                updatedDefinitions[objectName] = { ...definitions[objectName], fields: insertedFields };
            }

            await assetService.updateFields(updatedFields, updatedDefinitions);

            return { fields: updatedFields, definitions: updatedDefinitions };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const renameTableField = createAsyncThunk<
    {
        fields: Field[];
        labels: Labels;
        definitions: Definitions;
    },
    { tableFieldKey: string; fieldKey: string; newName: string; fieldLocation: FieldLocation },
    { rejectValue: any }
>(
    "customModel/renameTableField",
    async (
        args: { tableFieldKey: string; fieldKey: string; newName: string; fieldLocation: FieldLocation },
        { getState, rejectWithValue }
    ) => {
        try {
            const { tableFieldKey, fieldKey, newName, fieldLocation } = args;
            const { customModel, documents } = getState() as ApplicationState;
            const { fields, labels, definitions } = customModel;
            const assetService = new CustomModelAssetService();

            // Fetch all document labels and update the label data with target field.
            let allLabels = await getAllDocumentLabels(labels, documents.documents, assetService);

            // Update labels.
            const updatedLabels = {};
            const isTargetLabel = (label) =>
                getFieldKeyFromLabel(label) === tableFieldKey &&
                getTableFieldKeyFromLabel(label, fieldLocation) === fieldKey;
            Object.entries(allLabels).forEach(([documentName, labels]) => {
                // Only process the document that contains target label.
                if (labels.find(isTargetLabel)) {
                    const updatedDocLabels = labels.map((label) => {
                        if (isTargetLabel(label)) {
                            const newLabel = label.label.split("/");
                            const index = fieldLocation === FieldLocation.field ? 1 : 2;
                            newLabel[index] = encodeLabelString(newName); // Replace old fieldKey with new one.
                            return { ...label, label: newLabel.join("/") };
                        }
                        return label;
                    });
                    updatedLabels[documentName] = updatedDocLabels;
                }
            });
            allLabels = { ...allLabels, ...updatedLabels };

            const updatedFields = [...fields];
            const updatedDefinitions = { ...definitions };
            const originTableFieldIndex = fields.findIndex((field) => field.fieldKey === tableFieldKey);
            const originTableField: any = fields[originTableFieldIndex];
            if (fieldLocation === FieldLocation.field) {
                // Update fields.
                const tableFields = originTableField.fields.map((field) =>
                    field.fieldKey === fieldKey ? { ...field, fieldKey: newName } : field
                );
                updatedFields.splice(originTableFieldIndex, 1, { ...originTableField, fields: tableFields });
            } else {
                // Update definitions.
                const objectName = originTableField.itemType || originTableField.fields[0].fieldType;
                const definition = { ...definitions[objectName] };
                const definitionFields = definition.fields.map((field) =>
                    field.fieldKey === fieldKey ? { ...field, fieldKey: newName } : field
                );
                updatedDefinitions[objectName] = { ...definition, fields: definitionFields };
            }

            await Promise.all([
                assetService.updateFields(updatedFields, updatedDefinitions),
                assetService.updateDocumentLabels(updatedLabels),
            ]);
            return { fields: updatedFields, labels: allLabels, definitions: updatedDefinitions };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteLabelByField = createAsyncThunk<Labels, string, { rejectValue: any }>(
    "customModel/deleteLabelByField",
    async (fieldKey: string, { getState, rejectWithValue }) => {
        try {
            const { customModel, documents } = getState() as ApplicationState;
            const { labels } = customModel;
            const assetService = new CustomModelAssetService();

            const documentName = documents.currentDocument!.name;
            const updatedDocumentLabels = {
                [documentName]: labels[documentName].filter((label) => getFieldKeyFromLabel(label) !== fieldKey),
            };
            const updatedLabels = { ...labels, ...updatedDocumentLabels };

            await assetService.updateDocumentLabels(updatedDocumentLabels);

            return updatedLabels;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const assignLabel = createAsyncThunk<Labels, string, { rejectValue: any }>(
    "customModel/assignLabel",
    async (labelName: string, { getState, rejectWithValue }) => {
        try {
            const { customModel, documents } = getState() as ApplicationState;
            const { labels, fields, labelValueCandidates, orders } = customModel;

            if (labelValueCandidates.length === 0) {
                // No label candidate to be assigned, just return.
                return labels;
            }

            // Step 1. Remove duplicated items in LabelValueCandidates.
            const uniqueCandidates: LabelValueCandidate[] = uniqueByKeepFirst(
                labelValueCandidates,
                (item: LabelValueCandidate) => JSON.stringify(item.boundingBoxes)
            );

            // Step 2. Check invalid assignment and throw errors.
            const fieldKey = decodeLabelString(labelName.split("/")[0]);
            const field = fields.find((f) => f.fieldKey === fieldKey);
            validateAssignment(uniqueCandidates, field!);

            // Step 3. Check cross-page label issue and throw errors.
            const { name: documentName, currentPage } = documents.currentDocument!;
            const labelValueCandidatePageNum = labelValueCandidates[0].page;
            const currLabelValuePageNum = labels[documentName]?.find(({ label }) => label === labelName)?.value[0].page;

            if (currLabelValuePageNum && labelValueCandidatePageNum !== currLabelValuePageNum) {
                const crossPageLabelError = makeError(
                    "Cross-page label error",
                    `Sorry, we don't support cross-page labeling with the same field. You have label regions with same field name <b>${labelName}</b> across 2 pages.`
                );
                return rejectWithValue(crossPageLabelError);
            }

            // Step 4. Remove existed label.value if it occurred in uniqueCandidates.
            const uniqCandidateBoxes = uniqueCandidates.map((candidate) => JSON.stringify(candidate.boundingBoxes));
            const documentLabels = labels[documentName]
                ? labels[documentName].slice().map((documentLabel) => {
                      const labelPageNum = documentLabel.value[0].page;
                      const remainingValue = documentLabel.value.filter(
                          (value) =>
                              labelValueCandidatePageNum !== labelPageNum ||
                              !uniqCandidateBoxes.includes(JSON.stringify(value.boundingBoxes))
                      );

                      if (remainingValue.length !== documentLabel.value.length) {
                          return { ...documentLabel, value: remainingValue };
                      }
                      return documentLabel;
                  })
                : [];

            // Step 5. Check if labelName existed in documentLabels.
            const iLabel = documentLabels.findIndex((docLabel) => docLabel.label === labelName);
            const candidatesValue: LabelValue[] = uniqueCandidates.map(makeLabelValue);
            const isSingleDrawRegion =
                uniqueCandidates.length === 1 && uniqueCandidates[0].category === FeatureCategory.DrawnRegion;
            if (iLabel === -1) {
                // Step 5.a. Add label.
                documentLabels.push({
                    label: labelName,
                    value: candidatesValue.sort((a, b) => compareOrder(a, b, orders[documentName], currentPage)),
                    labelType: isSingleDrawRegion ? LabelType.Region : undefined,
                });
            } else {
                // Step 5.b. Merge or replace label.
                if (isSingleDrawRegion) {
                    documentLabels[iLabel] = {
                        ...documentLabels[iLabel],
                        value: candidatesValue,
                        labelType: LabelType.Region,
                    };
                } else if (field?.fieldType === FieldType.Signature || field?.fieldType === FieldType.SelectionMark) {
                    documentLabels[iLabel] = {
                        ...documentLabels[iLabel],
                        value: candidatesValue,
                    };
                } else if (documentLabels[iLabel].labelType === LabelType.Region) {
                    // Replace the existing region with text.
                    documentLabels[iLabel] = {
                        ...documentLabels[iLabel],
                        value: candidatesValue.sort((a, b) => compareOrder(a, b, orders[documentName], currentPage)),
                        labelType: undefined,
                    };
                } else {
                    // Concat text.
                    documentLabels[iLabel] = {
                        ...documentLabels[iLabel],
                        value: documentLabels[iLabel].value
                            .concat(candidatesValue)
                            .sort((a, b) => compareOrder(a, b, orders[documentName], currentPage)),
                    };
                }
            }

            // Step 6. Remove empty label.
            const updatedLabel = { [documentName]: documentLabels.filter((label) => label.value.length > 0) };

            // Step 7: save labels.json
            // Note: for error handling purpose we await here, but for UX consideration we can call and ignore.
            const assetService = new CustomModelAssetService();
            await assetService.updateDocumentLabels(updatedLabel);

            return { ...labels, ...updatedLabel };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateLabel = createAsyncThunk<
    Labels,
    { labelName: string; oldCandidate: LabelValueCandidate; newCandidate: LabelValueCandidate },
    { rejectValue: any }
>(
    "customModel/updateLabel",
    async (
        arg: { labelName: string; oldCandidate: LabelValueCandidate; newCandidate: LabelValueCandidate },
        { getState, rejectWithValue }
    ) => {
        try {
            const { labelName, oldCandidate, newCandidate } = arg;
            const { customModel, documents } = getState() as ApplicationState;
            const { labels } = customModel;
            const documentName = documents.currentDocument!.name;

            // Find Label
            const iLabel = labels[documentName].findIndex((label) => label.label === labelName);
            if (iLabel === -1) {
                return labels;
            }

            const updatedDocumentLabels = {
                [documentName]: labels[documentName].map((label, index) => {
                    if (index === iLabel) {
                        const updatedLabelValue = label.value.map((value) => {
                            if (JSON.stringify(value.boundingBoxes) === JSON.stringify(oldCandidate.boundingBoxes)) {
                                return { ...value, boundingBoxes: newCandidate.boundingBoxes };
                            }
                            return value;
                        });
                        return { ...label, value: updatedLabelValue };
                    }
                    return label;
                }),
            };

            // Save labels.json
            // Note: for error handling purpose we await here, but for UX consideration we can call and ignore.
            const assetService = new CustomModelAssetService();
            await assetService.updateDocumentLabels(updatedDocumentLabels);

            return { ...labels, ...updatedDocumentLabels };
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteLabelByLabel = createAsyncThunk<Labels, string, { rejectValue: any }>(
    "customModel/deleteLabelByLabel",
    async (targetLabel: string, { getState, rejectWithValue }) => {
        try {
            const { customModel, documents } = getState() as ApplicationState;
            const { labels } = customModel;
            const assetService = new CustomModelAssetService();

            const documentName = documents.currentDocument!.name;
            const updatedDocumentLabels = {
                [documentName]: labels[documentName].filter((label) => label.label !== targetLabel),
            };
            const updatedLabels = { ...labels, ...updatedDocumentLabels };

            await assetService.updateDocumentLabels(updatedDocumentLabels);

            return updatedLabels;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const customModel = createSlice({
    name: "customModel",
    initialState,
    reducers: {
        setHideInlineLabelMenu(state, action) {
            state.hideInlineLabelMenu = action.payload;
        },
        setDefinitions(state, action) {
            state.definitions = action.payload;
        },
        setFields(state, action) {
            state.fields = action.payload;
        },
        setColorForFields(state, action) {
            state.colorForFields = action.payload;
        },
        setColorForFieldsByName(state, action) {
            const getDynamicKey = (obj: Record<string, string>) => Object.keys(obj)[0];
            const { fieldName, newFieldName } = action.payload;
            const colorForFieldsCopy = [...state.colorForFields];
            const originalFieldIndex = colorForFieldsCopy.findIndex(
                (colorMap) => getDynamicKey(colorMap) === fieldName
            );
            const originalFieldColor = colorForFieldsCopy[originalFieldIndex][fieldName];
            colorForFieldsCopy.splice(originalFieldIndex, 1, {
                [newFieldName]: originalFieldColor,
            });
            state.colorForFields = colorForFieldsCopy;
        },
        setLabelsByName(state, action) {
            const { name, labels } = action.payload;
            state.labels[name] = labels;
        },
        setLabelValueCandidates(state, action) {
            state.labelValueCandidates = action.payload;
        },
        deleteLabelByName(state, action) {
            const labelNameToDelete = action.payload;
            delete state.labels[labelNameToDelete];
        },
        clearLabelError(state) {
            state.labelError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addField.fulfilled, (state, action) => {
                state.fields.push(action.payload);
            })
            .addCase(updateFieldsOrder.fulfilled, (state, action) => {
                state.fields = action.payload;
            })
            .addCase(switchSubType.fulfilled, (state, action) => {
                const { index, field } = action.payload;
                state.fields[index] = field;
            })
            .addCase(switchTableFieldsSubType.fulfilled, (state, action) => {
                const { definitions } = action.payload;
                state.definitions = definitions;
            })
            .addCase(setDocumentPrediction, (state, action) => {
                // Calculate bounding box orders for later sorting usage.
                const { name, analyzeResponse } = action.payload;
                state.orders[name] = buildRegionOrders(analyzeResponse.analyzeResult);
            })
            .addMatcher(isAnyOf(insertTableField.fulfilled, addTableField.fulfilled), (state, action) => {
                const { fields, definitions } = action.payload;
                state.fields = fields;
                state.definitions = definitions;
            })
            .addMatcher(
                isAnyOf(
                    assignLabel.fulfilled,
                    updateLabel.fulfilled,
                    deleteLabelByField.fulfilled,
                    deleteLabelByLabel.fulfilled
                ),
                (state, action) => {
                    state.labels = action.payload;
                }
            )
            .addMatcher(
                isAnyOf(
                    renameField.fulfilled,
                    renameTableField.fulfilled,
                    deleteField.fulfilled,
                    deleteTableField.fulfilled
                ),
                (state, action) => {
                    const { fields, labels, definitions } = action.payload;
                    state.fields = fields;
                    state.labels = labels;
                    state.definitions = definitions;
                }
            )
            .addMatcher(
                isAnyOf(
                    addField.rejected,
                    updateFieldsOrder.rejected,
                    addTableField.rejected,
                    switchSubType.rejected,
                    switchTableFieldsSubType.rejected,
                    deleteField.rejected,
                    deleteTableField.rejected,
                    renameField.rejected,
                    renameTableField.rejected,
                    deleteLabelByField.rejected,
                    deleteLabelByLabel.rejected,
                    insertTableField.rejected,
                    assignLabel.rejected,
                    updateLabel.rejected
                ),
                (state, action) => {
                    state.labelError = action.payload;
                }
            );
    },
});

export const {
    setHideInlineLabelMenu,
    setDefinitions,
    setFields,
    setColorForFields,
    setColorForFieldsByName,
    setLabelsByName,
    setLabelValueCandidates,
    deleteLabelByName,
    clearLabelError,
} = customModel.actions;
export const reducer = customModel.reducer;
