import configureMockStore from "redux-mock-store";
import { AsyncThunk, getDefaultMiddleware, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { CustomModelAssetService } from "services/assetService/customModelAssetService";
import {
    getFieldKeyFromLabel,
    getTableFieldKeyFromLabel,
    encodeLabelString,
    buildRegionOrders,
    makeLabelValue,
    compareOrder,
} from "utils/customModel";
import {
    mockFields,
    mockDocument,
    mockDocumentLabels,
    mockDefinitions,
    mockAddedField,
    mockDocuments,
    mockFixedRowTableField,
    mockFixedRowTableDefinition,
    mockFixedColumnTableDefinition,
    mockStringLabelValueCandidates,
    mockSelectionMarkLabelValueCandidates,
    mockRegionLabelValueCandidates,
    mockDynamicTableLabels,
    mockStringRegionDocumentLabels,
    mockLabelCandidateSameBoundingBoxDiffPage,
    mockColorForFields,
    mockSetColorForFieldsByNamePayload,
    mockSetColorForFieldsByNameResult,
    mockFixedColumnTableField,
    mockDynamicTableField,
    mockDynamicTableDefinition,
} from "utils/test";
import {
    mockLayoutV3_0_3_AnalyzeResult,
    mockLayoutV3_0_3_AnalyzeResponse,
} from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import {
    reducer,
    initialState,
    setHideInlineLabelMenu,
    setFields,
    setLabelsByName,
    setDefinitions,
    setLabelValueCandidates,
    addField,
    addTableField,
    switchSubType,
    deleteField,
    deleteTableField,
    renameField,
    renameTableField,
    insertTableField,
    deleteLabelByField,
    deleteLabelByLabel,
    FieldLocation,
    assignLabel,
    clearLabelError,
    updateLabel,
    setColorForFields,
    setColorForFieldsByName,
    switchTableFieldsSubType,
    deleteLabelByName,
} from "./customModel";
import {
    FieldType,
    FieldFormat,
    TableType,
    HeaderType,
    VisualizationHint,
    LabelValueCandidate,
    Label,
    LabelType,
} from "models/customModels";
import { FeatureCategory } from "view/components/imageMap/contracts";
import { setDocumentPrediction } from "store/predictions/predictions";

jest.mock("services/assetService/customModelAssetService");

describe("customModel", () => {
    const mockStore = configureMockStore(getDefaultMiddleware());
    const mockError = "Mock Error";
    const mockNewFieldName = "MockNewFieldName";
    const mockSwitchTypeField = { ...mockFields[0], fieldType: FieldType.Number };
    const mockLabels = {
        [mockDocuments[0].name]: mockDocumentLabels,
    };
    const mockFetchedLabels = {
        [mockDocuments[1].name]: [],
        [mockDocuments[2].name]: mockDocumentLabels,
        [mockDocuments[3].name]: [],
    };

    const statesWithProject = {
        ...initialState,
        definitions: mockDefinitions,
        fields: mockFields,
        labels: mockLabels,
        orders: { [mockDocument.name]: buildRegionOrders(mockLayoutV3_0_3_AnalyzeResult) },
    };

    interface TestActionData {
        action: ActionCreatorWithPayload<any, string>;
        payload: any;
        savedState: string;
        savedStateKey?: string;
        expectedValue: any;
    }

    interface TestAsyncActionData {
        action: AsyncThunk<any, any, any>;
        arg: any;
        payload: any;
    }

    interface TestAssignLabelActionData {
        labelName: string;
        labels: { [x: string]: Label[] };
        labelValueCandidates: LabelValueCandidate[];
    }

    const testSetStateActions: [string, TestActionData][] = [
        [
            "setHideInlineLabelMenu",
            {
                action: setHideInlineLabelMenu,
                savedState: "hideInlineLabelMenu",
                payload: true,
                expectedValue: true,
            },
        ],
        [
            "setDefinitions",
            {
                action: setDefinitions,
                savedState: "definitions",
                payload: mockDefinitions,
                expectedValue: mockDefinitions,
            },
        ],
        [
            "setFields",
            {
                action: setFields,
                savedState: "fields",
                payload: mockFields,
                expectedValue: mockFields,
            },
        ],
        [
            "setColorForFields",
            {
                action: setColorForFields,
                savedState: "colorForFields",
                payload: mockColorForFields,
                expectedValue: mockColorForFields,
            },
        ],
        [
            "setLabelsByName",
            {
                action: setLabelsByName,
                savedState: "labels",
                savedStateKey: mockDocument.name,
                payload: { name: mockDocument.name, labels: mockDocumentLabels },
                expectedValue: mockDocumentLabels,
            },
        ],
        [
            "setLabelValueCandidates",
            {
                action: setLabelValueCandidates,
                savedState: "labelValueCandidates",
                payload: [],
                expectedValue: [],
            },
        ],
        [
            "clearLabelError",
            {
                action: clearLabelError,
                savedState: "labelError",
                payload: undefined,
                expectedValue: null,
            },
        ],
    ];

    const testAsyncActions: [string, TestAsyncActionData][] = [
        [
            "addField",
            {
                action: addField,
                arg: mockAddedField,
                payload: mockAddedField,
            },
        ],
        [
            "switchSubType",
            {
                action: switchSubType,
                arg: { fieldKey: mockFields[0].fieldKey, fieldType: FieldType.Number },
                payload: { index: 0, field: mockSwitchTypeField },
            },
        ],
        [
            "deleteLabelByField",
            {
                action: deleteLabelByField,
                arg: mockFields[3].fieldKey,
                payload: {
                    ...mockLabels,
                    [mockDocument.name]: mockLabels[mockDocument.name].filter(
                        (label) => getFieldKeyFromLabel(label) !== mockFields[3].fieldKey
                    ),
                },
            },
        ],
        [
            "deleteLabelByLabel",
            {
                action: deleteLabelByLabel,
                arg: mockDynamicTableLabels[0].label,
                payload: {
                    ...mockLabels,
                    [mockDocument.name]: mockLabels[mockDocument.name].filter(
                        (label) => label.label !== mockDynamicTableLabels[0].label
                    ),
                },
            },
        ],
    ];

    const testAssignLabelActions: [string, TestAssignLabelActionData][] = [
        [
            "String Labels",
            {
                labelName: mockFields[0].fieldKey,
                labels: mockLabels,
                labelValueCandidates: mockStringLabelValueCandidates,
            },
        ],
        [
            "String Labels with existing region label",
            {
                labelName: mockFields[0].fieldKey,
                labels: {
                    [mockDocuments[0].name]: mockStringRegionDocumentLabels,
                },
                labelValueCandidates: mockStringLabelValueCandidates,
            },
        ],
        [
            "String Labels without existing labels",
            {
                labelName: mockFields[0].fieldKey,
                labels: {},
                labelValueCandidates: mockStringLabelValueCandidates,
            },
        ],
        [
            "SelectionMark Label",
            {
                labelName: mockFields[0].fieldKey,
                labels: mockLabels,
                labelValueCandidates: mockSelectionMarkLabelValueCandidates,
            },
        ],
        [
            "SelectionMark Label without existing labels",
            {
                labelName: mockFields[0].fieldKey,
                labels: {},
                labelValueCandidates: mockSelectionMarkLabelValueCandidates,
            },
        ],
        [
            "Region Label",
            {
                labelName: mockFields[0].fieldKey,
                labels: mockLabels,
                labelValueCandidates: mockRegionLabelValueCandidates,
            },
        ],
        [
            "Region Label without existing labels",
            {
                labelName: mockFields[0].fieldKey,
                labels: {},
                labelValueCandidates: mockRegionLabelValueCandidates,
            },
        ],
    ];

    describe("actions", () => {
        beforeEach(() => {
            (CustomModelAssetService as any).mockImplementation(() => {
                return {
                    updateFields: jest.fn().mockResolvedValue({}),
                    updateDocumentLabels: jest.fn().mockResolvedValue({}),
                    fetchAllDocumentLabels: jest.fn().mockResolvedValue(mockFetchedLabels),
                };
            });
        });

        it.each(testSetStateActions)("should create %s action", (name, { action, payload }: TestActionData) => {
            const expectedAction = { type: action.type, payload };
            expect(action(payload)).toEqual(expectedAction);
        });

        it.each(testAsyncActions)("should create %s action", (name, { action, arg, payload }: TestAsyncActionData) => {
            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments, currentDocument: mockDocument },
            });
            const expectedActions = [
                { type: action.pending.type, meta: { arg } },
                { type: action.fulfilled.type, payload },
            ];
            return store.dispatch(action(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each([
            ["dynamic table", TableType.dynamic, undefined],
            ["fixed row table", TableType.fixed, HeaderType.row],
            ["fixed column table", TableType.fixed, HeaderType.column],
        ])("should create addTableField action (%s)", (_, tableType, headerType) => {
            const fieldKey = mockNewFieldName;

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

            const expectedFields = mockFields.concat(field);
            const expectedDefinitions = { ...mockDefinitions, [objectName]: definition };

            const arg = { fieldKey, tableType, headerType };
            const store = mockStore({ customModel: statesWithProject, feature: { isOnPrem: false } });
            const expectedActions = [
                {
                    type: addTableField.pending.type,
                    meta: { arg },
                },
                {
                    type: addTableField.fulfilled.type,
                    payload: { fields: expectedFields, definitions: expectedDefinitions },
                },
            ];
            return store.dispatch(addTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each([
            ["delete field", 0],
            ["delete dynamic table", 3],
            ["delete fixed table", 4],
        ])("should create deleteField action (%s)", (_, fieldIndex: any) => {
            const deletedField: any = mockFields[fieldIndex];
            const deletedFieldKey = deletedField.fieldKey; // String field.
            const expectedDocumentLabels = mockDocumentLabels.filter(
                (label) => getFieldKeyFromLabel(label) !== deletedFieldKey
            );
            const expectedLabels = {
                [mockDocuments[0].name]: expectedDocumentLabels,
                [mockDocuments[1].name]: [],
                [mockDocuments[2].name]: expectedDocumentLabels,
                [mockDocuments[3].name]: [],
            };
            const expectedFields = [...mockFields];
            expectedFields.splice(fieldIndex, 1);
            const expectedDefinitions = { ...mockDefinitions };
            if (deletedField.itemType) {
                delete expectedDefinitions[deletedField.itemType];
            }
            if (deletedField.fields) {
                const definitionObjs = deletedField.fields.map((field) => field.fieldType);
                definitionObjs.forEach((obj) => {
                    delete expectedDefinitions[obj];
                });
            }

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                { type: deleteField.pending.type, meta: { arg: deletedFieldKey } },
                {
                    type: deleteField.fulfilled.type,
                    payload: { fields: expectedFields, labels: expectedLabels, definitions: expectedDefinitions },
                },
            ];
            return store.dispatch(deleteField(deletedFieldKey)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each([
            ["rename field", 0],
            ["rename dynamic table", 3],
            ["rename fixed table", 4],
        ])("should create renameField action (%s)", (_, fieldIndex: any) => {
            const renamedField: any = mockFields[fieldIndex];

            // Rename labels.
            const updatedDocLabels = mockDocumentLabels.slice();
            updatedDocLabels.forEach((label, index) => {
                if (getFieldKeyFromLabel(label) === renamedField.fieldKey) {
                    const newLabel = label.label.split("/");
                    newLabel[0] = encodeLabelString(mockNewFieldName); // Replace old fieldKey with new one.
                    updatedDocLabels[index] = { ...label, label: newLabel.join("/") };
                }
            });
            const expectedLabels = {
                [mockDocuments[0].name]: updatedDocLabels,
                [mockDocuments[1].name]: [],
                [mockDocuments[2].name]: updatedDocLabels,
                [mockDocuments[3].name]: [],
            };

            // Rename fields.
            const expectedFields = [...mockFields];
            const newObjectName = `${mockNewFieldName}_object`;
            const updatedField = {
                ...renamedField,
                ...(renamedField.itemType && { itemType: newObjectName }),
                ...(renamedField.fields && {
                    fields: renamedField.fields.map((field) => ({ ...field, fieldType: newObjectName })),
                }),
                fieldKey: mockNewFieldName,
            };

            expectedFields.splice(fieldIndex, 1, updatedField);

            // Rename definitions.
            const expectedDefinitions = { ...mockDefinitions };
            if (renamedField.itemType) {
                expectedDefinitions[newObjectName] = {
                    ...expectedDefinitions[renamedField.itemType],
                    fieldKey: newObjectName,
                };
                delete expectedDefinitions[renamedField.itemType];
            }
            if (renamedField.fields) {
                // Update fields and definition for fixed table.
                const targetFieldType = renamedField.fields[0].fieldType;
                expectedDefinitions[newObjectName] = {
                    ...expectedDefinitions[targetFieldType],
                    fieldKey: newObjectName,
                };
                delete expectedDefinitions[targetFieldType];
            }

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
                feature: { isOnPrem: false },
            });
            const expectedActions = [
                {
                    type: renameField.pending.type,
                    meta: { arg: { fieldKey: mockFields[fieldIndex].fieldKey, newName: mockNewFieldName } },
                },
                {
                    type: renameField.fulfilled.type,
                    payload: { fields: expectedFields, labels: expectedLabels, definitions: expectedDefinitions },
                },
            ];
            return store
                .dispatch(renameField({ fieldKey: mockFields[fieldIndex].fieldKey, newName: mockNewFieldName }))
                .then(() => {
                    expect(store.getActions()).toMatchObject(expectedActions);
                });
        });

        it.each([
            ["assign subtype to dynamic table", mockDynamicTableField, mockDynamicTableDefinition],
            ["assign subtype to fixed row table", mockFixedRowTableField, mockFixedRowTableDefinition],
            ["assign subtype to fixed column table", mockFixedColumnTableField, mockFixedColumnTableDefinition],
        ])("should create switchTableFieldsSubType action (%s)", (_, tableField: any, tableDefinition: any) => {
            const newSubType = FieldType.Number;
            const headerField = tableDefinition.fields[0];
            const { fieldKey } = headerField;
            const expectedDefinitions = { ...mockDefinitions };
            // Only update definitions.
            const fieldDefinitionNames = tableField.itemType
                ? [tableField.itemType]
                : tableField.fields.map((field) => field.fieldType);
            fieldDefinitionNames.forEach((name) => {
                const definition = { ...mockDefinitions[name] };
                const updatedFields = definition.fields.map((field) =>
                    field.fieldKey === fieldKey ? { ...field, fieldType: newSubType } : field
                );
                expectedDefinitions[name] = { ...definition, fields: updatedFields };
            });
            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                {
                    type: switchTableFieldsSubType.pending.type,
                    meta: {
                        arg: {
                            tableFieldKey: tableField.fieldKey,
                            newType: newSubType,
                            headerField,
                        },
                    },
                },
                {
                    type: switchTableFieldsSubType.fulfilled.type,
                    payload: { definitions: expectedDefinitions },
                },
            ];

            return store
                .dispatch(
                    switchTableFieldsSubType({
                        tableFieldKey: tableField.fieldKey,
                        headerField: tableDefinition.fields[0],
                        newType: newSubType,
                    })
                )
                .then(() => {
                    expect(store.getActions()).toMatchObject(expectedActions);
                });
        });

        it.each([
            ["delete field", FieldLocation.field],
            ["delete definition", FieldLocation.definition],
        ])("should create deleteTableField action (%s)", (_, fieldLocation: any) => {
            const tableFieldKey = mockFixedRowTableField.fieldKey;
            const deletedField: any =
                fieldLocation === FieldLocation.field
                    ? mockFixedRowTableField.fields[0]
                    : mockFixedRowTableDefinition.fields[0];

            // Rename labels.
            const isTargetLabel = (label) =>
                getFieldKeyFromLabel(label) === tableFieldKey &&
                getTableFieldKeyFromLabel(label, fieldLocation) === deletedField.fieldKey;
            const updatedDocLabels = mockDocumentLabels.filter((label) => !isTargetLabel(label));
            const expectedLabels = {
                [mockDocuments[0].name]: updatedDocLabels,
                [mockDocuments[1].name]: [],
                [mockDocuments[2].name]: updatedDocLabels,
                [mockDocuments[3].name]: [],
            };

            const expectedFields = [...mockFields];
            const expectedDefinitions = { ...mockDefinitions };
            const originTableFieldIndex = mockFields.findIndex((field) => field.fieldKey === tableFieldKey);
            const originTableField: any = mockFields[originTableFieldIndex];
            if (fieldLocation === FieldLocation.field) {
                // Update fields.
                const tableFields = originTableField.fields.filter((field) => field.fieldKey !== deletedField.fieldKey);
                expectedFields.splice(originTableFieldIndex, 1, { ...originTableField, fields: tableFields });
                const fieldToBeRemoved = originTableField.fields.find(
                    (field) => field.fieldKey === deletedField.fieldKey
                );
                const definitionObjToBeRemoved = fieldToBeRemoved.fieldType;
                delete expectedDefinitions[definitionObjToBeRemoved];
            } else {
                // Update definitions.
                const fieldDefinitionNames = originTableField.itemType
                    ? [originTableField.itemType]
                    : originTableField.fields.map((field) => field.fieldType);

                fieldDefinitionNames.forEach((name) => {
                    const definition = { ...mockDefinitions[name] };
                    const updatedFields = definition.fields.filter((field) => field.fieldKey !== deletedField.fieldKey);
                    expectedDefinitions[name] = { ...definition, fields: updatedFields };
                });
            }

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const arg = { tableFieldKey, fieldKey: deletedField.fieldKey, fieldLocation };
            const expectedActions = [
                {
                    type: deleteTableField.pending.type,
                    meta: { arg },
                },
                {
                    type: deleteTableField.fulfilled.type,
                    payload: { fields: expectedFields, labels: expectedLabels, definitions: expectedDefinitions },
                },
            ];
            return store.dispatch(deleteTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each([
            ["insert field", FieldLocation.field],
            ["insert definition", FieldLocation.definition],
        ])("should create insertTableField action (%s)", (_, fieldLocation: any) => {
            const tableFieldKey = mockFixedRowTableField.fieldKey;
            const insertIndex = 1;

            const expectedFields = [...mockFields];
            const expectedDefinitions = { ...mockDefinitions };
            const objectName = `${tableFieldKey}_object`;
            const insertField: any = {
                fieldKey: mockNewFieldName,
                fieldType: fieldLocation === FieldLocation.field ? objectName : FieldType.String,
                fieldFormat: FieldFormat.NotSpecified,
            };
            const tableFieldIndex = mockFields.findIndex((field) => field.fieldKey === tableFieldKey);

            if (fieldLocation === FieldLocation.field) {
                const insertedFields = (mockFields[tableFieldIndex] as any).fields.slice();
                insertedFields.splice(insertIndex, 0, insertField);
                const updatedTableField = { ...mockFields[tableFieldIndex], fields: insertedFields };
                expectedFields.splice(tableFieldIndex, 1, updatedTableField);
            } else {
                const insertedFields = mockDefinitions[objectName].fields.slice();
                insertedFields.splice(insertIndex, 0, insertField);
                expectedDefinitions[objectName] = { ...mockDefinitions[objectName], fields: insertedFields };
            }

            const store = mockStore({ customModel: statesWithProject });
            const arg = { tableFieldKey, fieldKey: mockNewFieldName, index: insertIndex, fieldLocation };
            const expectedActions = [
                {
                    type: insertTableField.pending.type,
                    meta: { arg },
                },
                {
                    type: insertTableField.fulfilled.type,
                    payload: { fields: expectedFields, definitions: expectedDefinitions },
                },
            ];
            return store.dispatch(insertTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each([
            ["rename field", FieldLocation.field],
            ["rename definition", FieldLocation.definition],
        ])("should create renameTableField action (%s)", (_, fieldLocation: any) => {
            const tableFieldKey = mockFixedRowTableField.fieldKey;
            const renamedField: any =
                fieldLocation === FieldLocation.field
                    ? mockFixedRowTableField.fields[0]
                    : mockFixedRowTableDefinition.fields[0];

            // Rename labels.
            const isTargetLabel = (label) =>
                getFieldKeyFromLabel(label) === tableFieldKey &&
                getTableFieldKeyFromLabel(label, fieldLocation) === renamedField.fieldKey;
            const updatedDocLabels = mockDocumentLabels.map((label) => {
                if (isTargetLabel(label)) {
                    const newLabel = label.label.split("/");
                    const index = fieldLocation === FieldLocation.field ? 1 : 2;
                    newLabel[index] = encodeLabelString(mockNewFieldName); // Replace old fieldKey with new one.
                    return { ...label, label: newLabel.join("/") };
                }
                return label;
            });
            const expectedLabels = {
                [mockDocuments[0].name]: updatedDocLabels,
                [mockDocuments[1].name]: [],
                [mockDocuments[2].name]: updatedDocLabels,
                [mockDocuments[3].name]: [],
            };

            const expectedFields = [...mockFields];
            const expectedDefinitions = { ...mockDefinitions };
            const originTableFieldIndex = mockFields.findIndex((field) => field.fieldKey === tableFieldKey);
            const originTableField: any = mockFields[originTableFieldIndex];
            if (fieldLocation === FieldLocation.field) {
                // Update fields.
                const tableFields = originTableField.fields.map((field) =>
                    field.fieldKey === renamedField.fieldKey ? { ...field, fieldKey: mockNewFieldName } : field
                );
                expectedFields.splice(originTableFieldIndex, 1, { ...originTableField, fields: tableFields });
            } else {
                // Update definitions.
                const objectName = originTableField.itemType || originTableField.fields[0].fieldType;
                const definition = { ...mockDefinitions[objectName] };
                const definitionFields = definition.fields.map((field) =>
                    field.fieldKey === renamedField.fieldKey ? { ...field, fieldKey: mockNewFieldName } : field
                );
                expectedDefinitions[objectName] = { ...definition, fields: definitionFields };
            }

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const arg = {
                tableFieldKey,
                fieldKey: renamedField.fieldKey,
                newName: mockNewFieldName,
                fieldLocation,
            };
            const expectedActions = [
                {
                    type: renameTableField.pending.type,
                    meta: { arg },
                },
                {
                    type: renameTableField.fulfilled.type,
                    payload: { fields: expectedFields, labels: expectedLabels, definitions: expectedDefinitions },
                },
            ];
            return store.dispatch(renameTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it.each(testAssignLabelActions)(
            "should create assignLabel action for %s",
            (name, { labelName, labels, labelValueCandidates }: TestAssignLabelActionData) => {
                const store = mockStore({
                    customModel: { ...statesWithProject, labels, labelValueCandidates },
                    documents: { documents: mockDocuments, currentDocument: mockDocument },
                });

                const { name: documentName, currentPage } = mockDocument;
                const updatedDocLabels = labels[documentName]
                    ? labels[documentName].slice().map((label) => {
                          if (label.label === labelName) {
                              if (labelValueCandidates[0].category === FeatureCategory.DrawnRegion) {
                                  return { ...label, value: labelValueCandidates.map(makeLabelValue) };
                              } else if (label.labelType === LabelType.Region) {
                                  const newValue = labelValueCandidates
                                      .map(makeLabelValue)
                                      .sort((a, b) =>
                                          compareOrder(a, b, statesWithProject.orders[documentName], currentPage)
                                      );
                                  return { ...label, value: newValue, labelType: undefined };
                              } else {
                                  const newValue = label.value
                                      .concat(labelValueCandidates.map(makeLabelValue))
                                      .sort((a, b) =>
                                          compareOrder(a, b, statesWithProject.orders[documentName], currentPage)
                                      );
                                  return { ...label, value: newValue };
                              }
                          }
                          return label;
                      })
                    : [
                          {
                              label: labelName,
                              value: labelValueCandidates
                                  .map(makeLabelValue)
                                  .sort((a, b) =>
                                      compareOrder(a, b, statesWithProject.orders[documentName], currentPage)
                                  ),
                          },
                      ];

                const payload = { ...mockLabels, [mockDocument.name]: updatedDocLabels };

                const expectedActions = [
                    { type: assignLabel.pending.type, meta: { arg: labelName } },
                    { type: assignLabel.fulfilled.type, payload },
                ];

                return store.dispatch(assignLabel(labelName)).then(() => {
                    expect(store.getActions()).toMatchObject(expectedActions);
                });
            }
        );

        it("should create assignLabel action for Label with same bounding box on different page", () => {
            const labelName = mockAddedField.fieldKey;
            const store = mockStore({
                customModel: {
                    ...statesWithProject,
                    fields: [...mockFields, mockAddedField],
                    labels: mockLabels,
                    labelValueCandidates: mockLabelCandidateSameBoundingBoxDiffPage,
                },
                documents: { documents: mockDocuments, currentDocument: mockDocument },
            });
            const { name: documentName } = mockDocument;

            const updatedDocLabels = [
                ...mockLabels[documentName],
                {
                    label: labelName,
                    labelType: undefined,
                    value: mockLabelCandidateSameBoundingBoxDiffPage.map(makeLabelValue),
                },
            ];
            const payload = { ...mockLabels, [mockDocument.name]: updatedDocLabels };
            const expectedActions = [
                { type: assignLabel.pending.type, meta: { arg: labelName } },
                { type: assignLabel.fulfilled.type, payload },
            ];

            return store.dispatch(assignLabel(labelName)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create updateLabel action", () => {
            const store = mockStore({
                customModel: { ...statesWithProject },
                documents: { documents: mockDocuments, currentDocument: mockDocument },
            });

            const oldCandidate = mockDocumentLabels[0].value[0] as LabelValueCandidate;
            const newCandidate = mockDocumentLabels[1].value[0] as LabelValueCandidate;
            const arg = { labelName: mockDocumentLabels[0].label, oldCandidate, newCandidate };

            const updatedValue = mockDocumentLabels[0].value.map((v, index) => {
                if (index === 0) {
                    return { ...v, boundingBoxes: newCandidate.boundingBoxes };
                }
                return v;
            });
            const updatedDocLabels = mockDocumentLabels.slice();
            updatedDocLabels[0] = { ...updatedDocLabels[0], value: updatedValue };

            const payload = { ...mockLabels, [mockDocument.name]: updatedDocLabels };

            const expectedActions = [
                { type: updateLabel.pending.type, meta: { arg } },
                { type: updateLabel.fulfilled.type, payload },
            ];

            return store.dispatch(updateLabel(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });
    });

    describe("reducer", () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it.each(testSetStateActions)(
            "should handle %s",
            (_, { action, payload, savedState, savedStateKey, expectedValue }) => {
                const state = reducer(initialState, { type: action.type, payload });
                if (savedStateKey) {
                    expect(state[savedState][savedStateKey]).toEqual(expectedValue);
                } else {
                    expect(state[savedState]).toEqual(expectedValue);
                }
            }
        );

        it("should handle setColorForFieldsByName", () => {
            const statesWithColorForFields = {
                ...initialState,
                colorForFields: mockColorForFields,
            };

            let state = reducer(statesWithColorForFields, {
                type: setColorForFieldsByName.type,
                payload: mockSetColorForFieldsByNamePayload,
            });

            expect(state.colorForFields).toEqual(mockSetColorForFieldsByNameResult);
        });

        it("should handle setDocumentPrediction", () => {
            const expectedOrders = { [mockDocument.name]: buildRegionOrders(mockLayoutV3_0_3_AnalyzeResult) };

            let state = reducer(statesWithProject, {
                type: setDocumentPrediction.type,
                payload: { name: mockDocument.name, analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse },
            });
            expect(state.orders).toEqual(expectedOrders);
        });

        it("should handle deleteLabelByName", () => {
            let state = reducer(statesWithProject, {
                type: deleteLabelByName.type,
                payload: mockDocuments[0].name,
            });
            expect(state.labels).toEqual({});
        });

        it("should handle addField.fulfilled and .rejected", () => {
            const updatedFields = mockFields.concat(mockAddedField);

            // Test .fulfilled.
            let state = reducer(statesWithProject, {
                type: addField.fulfilled.type,
                payload: mockAddedField,
            });
            expect(state.fields).toEqual(updatedFields);

            // Test .rejected.
            state = reducer(statesWithProject, { type: addField.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it("should handle switchSubType.fulfilled and .rejected", () => {
            const updatedFields = mockFields.slice();
            updatedFields[0] = mockSwitchTypeField;

            // Test .fulfilled.
            let state = reducer(statesWithProject, {
                type: switchSubType.fulfilled.type,
                payload: { index: 0, field: mockSwitchTypeField },
            });
            expect(state.fields).toEqual(updatedFields);

            // Test .rejected.
            state = reducer(statesWithProject, { type: switchSubType.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it("should handle switchTableFieldsSubType.fulfilled and .rejected", () => {
            // Test .fulfilled.
            let state = reducer(
                { ...statesWithProject, definitions: {} },
                {
                    type: switchTableFieldsSubType.fulfilled.type,
                    payload: { definitions: mockDefinitions },
                }
            );
            expect(state.definitions).toEqual(mockDefinitions);

            // Test .rejected.
            state = reducer(statesWithProject, {
                type: switchTableFieldsSubType.rejected.type,
                payload: mockError,
            });
            expect(state.labelError).toBe(mockError);
        });

        it.each([
            ["deleteField", deleteField],
            ["deleteTableField", deleteTableField],
            ["renameField", renameField],
            ["renameTableField", renameTableField],
        ])("should handle %s.fulfilled and .rejected", (_, action) => {
            // Test .fulfilled.
            let state = reducer(
                { ...statesWithProject, fields: [], labels: {}, definitions: {} },
                {
                    type: action.fulfilled.type,
                    payload: { fields: mockFields, labels: mockLabels, definitions: mockDefinitions },
                }
            );
            expect(state.fields).toEqual(mockFields);
            expect(state.labels).toEqual(mockLabels);
            expect(state.definitions).toEqual(mockDefinitions);

            // Test .rejected.
            state = reducer(statesWithProject, { type: action.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it.each([
            ["insertTableField", insertTableField],
            ["addTableField", addTableField],
        ])("should handle %s.fulfilled and .rejected", (_, action: any) => {
            let state = reducer(
                { ...statesWithProject, fields: [], definitions: {} },
                {
                    type: action.fulfilled.type,
                    payload: { fields: mockFields, definitions: mockDefinitions },
                }
            );
            expect(state.fields).toEqual(mockFields);
            expect(state.definitions).toEqual(mockDefinitions);

            // Test .rejected.
            state = reducer(statesWithProject, { type: action.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it.each([
            ["deleteLabelByField", deleteLabelByField],
            ["deleteLabelByLabel", deleteLabelByLabel],
        ])("should handle %s.fulfilled and .rejected", (_, action) => {
            // Test .fulfilled.
            let state = reducer(
                { ...statesWithProject, labels: {} },
                { type: action.fulfilled.type, payload: mockLabels }
            );
            expect(state.labels).toEqual(mockLabels);

            // Test .rejected.
            state = reducer(statesWithProject, { type: action.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it("should handle assignLabel.fulfilled and .rejected", () => {
            const updatedDocumentLabels = mockLabels[mockDocument.name].concat({
                label: "mock-label",
                value: mockStringLabelValueCandidates.map(makeLabelValue),
            });
            const updatedLabels = { ...mockLabels, [mockDocument.name]: updatedDocumentLabels };

            // Test .fulfilled.
            let state = reducer(statesWithProject, {
                type: assignLabel.fulfilled.type,
                payload: updatedLabels,
            });
            expect(state.labels).toEqual(updatedLabels);

            // Test .rejected.
            state = reducer(statesWithProject, { type: assignLabel.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });

        it("should handle updateLabel.fulfilled and .rejected", () => {
            const updatedDocumentLabels = mockLabels[mockDocument.name].concat({
                label: "mock-label",
                value: mockStringLabelValueCandidates.map(makeLabelValue),
            });
            const updatedLabels = { ...mockLabels, [mockDocument.name]: updatedDocumentLabels };

            // Test .fulfilled.
            let state = reducer(statesWithProject, {
                type: updateLabel.fulfilled.type,
                payload: updatedLabels,
            });
            expect(state.labels).toEqual(updatedLabels);

            // Test .rejected.
            state = reducer(statesWithProject, { type: updateLabel.rejected.type, payload: mockError });
            expect(state.labelError).toBe(mockError);
        });
    });

    describe("Error Handling", () => {
        const mockError = "Mock error";
        beforeEach(() => {
            (CustomModelAssetService as any).mockImplementation(() => {
                return {
                    updateFields: jest.fn().mockRejectedValue(mockError),
                    updateDocumentLabels: jest.fn().mockRejectedValue(mockError),
                    fetchAllDocumentLabels: jest.fn().mockRejectedValue(mockError),
                };
            });
        });

        it.each(testAsyncActions)(
            "should create %s action with error",
            (name, { action, arg, payload }: TestAsyncActionData) => {
                const store = mockStore({
                    customModel: statesWithProject,
                    documents: { documents: mockDocuments, currentDocument: mockDocument },
                });
                const expectedActions = [
                    { type: action.pending.type, meta: { arg } },
                    { type: action.rejected.type, payload: mockError },
                ];
                return store.dispatch(action(arg)).then(() => {
                    expect(store.getActions()).toMatchObject(expectedActions);
                });
            }
        );

        it("should create deleteField action with error", () => {
            const mockDeletedField = mockFields[0].fieldKey; // String field.

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                { type: deleteField.pending.type, meta: { arg: mockDeletedField } },
                { type: deleteField.rejected.type, payload: mockError },
            ];
            return store.dispatch(deleteField(mockDeletedField)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create deleteTableField action with error", () => {
            const arg = {
                tableFieldKey: mockFixedRowTableField.fieldKey,
                fieldKey: mockFixedRowTableField.fields[0].fieldKey,
                fieldLocation: FieldLocation.field,
            };

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                {
                    type: deleteTableField.pending.type,
                    meta: { arg },
                },
                { type: deleteTableField.rejected.type, payload: mockError },
            ];
            return store.dispatch(deleteTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create renameField action with error", () => {
            const mockRenamedField = mockFields[0].fieldKey; // String field.

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                {
                    type: renameField.pending.type,
                    meta: { arg: { fieldKey: mockRenamedField, newName: mockNewFieldName } },
                },
                { type: renameField.rejected.type, payload: mockError },
            ];
            return store.dispatch(renameField({ fieldKey: mockRenamedField, newName: mockNewFieldName })).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create renameTableField action with error", () => {
            const arg = {
                tableFieldKey: mockFixedRowTableField.fieldKey,
                fieldKey: mockFixedRowTableField.fields[0].fieldKey,
                newName: mockNewFieldName,
                fieldLocation: FieldLocation.field,
            };

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                {
                    type: renameTableField.pending.type,
                    meta: { arg },
                },
                { type: renameTableField.rejected.type, payload: mockError },
            ];
            return store.dispatch(renameTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create insertTableField action with error", () => {
            const arg = {
                tableFieldKey: mockFixedRowTableField.fieldKey,
                fieldKey: mockNewFieldName,
                index: 1,
                fieldLocation: FieldLocation.field,
            };

            const store = mockStore({ customModel: statesWithProject });
            const expectedActions = [
                {
                    type: insertTableField.pending.type,
                    meta: { arg },
                },
                { type: insertTableField.rejected.type, payload: mockError },
            ];
            return store.dispatch(insertTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create addTableField action with error", () => {
            const arg = {
                fieldKey: mockNewFieldName,
                tableType: TableType.fixed,
                headerType: HeaderType.row,
            };

            const store = mockStore({ customModel: statesWithProject });
            const expectedActions = [
                {
                    type: addTableField.pending.type,
                    meta: { arg },
                },
                { type: addTableField.rejected.type, payload: mockError },
            ];
            return store.dispatch(addTableField(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create switchTableFieldsSubType action with error", () => {
            const arg = {
                tableFieldKey: mockFixedRowTableField.fieldKey,
                headerField: mockFixedRowTableField.fields[0],
                newType: FieldType.Integer,
            };

            const store = mockStore({
                customModel: statesWithProject,
                documents: { documents: mockDocuments },
            });
            const expectedActions = [
                {
                    type: switchTableFieldsSubType.pending.type,
                    meta: { arg },
                },
                { type: switchTableFieldsSubType.rejected.type, payload: mockError },
            ];
            return store.dispatch(switchTableFieldsSubType(arg)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });
    });
});
