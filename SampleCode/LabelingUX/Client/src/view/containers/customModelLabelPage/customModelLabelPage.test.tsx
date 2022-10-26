import * as React from "react";
import { shallow } from "enzyme";
import { constants } from "consts/constants";
import { StorageProvider } from "providers/storageProvider";
import {
    flushPromises,
    mockDefinitions,
    mockDocument,
    mockDocumentLabels,
    mockFields,
    mockDocuments,
    mockInvalidFields,
    mockSplitPaneSizes,
} from "utils/test";
import { mockLayoutV3_0_3_AnalyzeResponse } from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { CustomModelLabelPage } from "./customModelLabelPage";
import { getDocumentType } from "utils/documentLoader";
import { DocumentStatus } from "store/documents/documentsTypes";

jest.mock("providers/storageProvider");

describe("<CustomModelLabelPage />", () => {
    let baseProps;
    let mockReadText;
    let mockListFilesInFolder;
    let mockWriteText;
    let mockWriteBinary;
    let mockIsFileExists;
    let mockDeleteFile;

    const mockErrorMessage = {
        code: "MockError",
        message: "mock error message",
    };

    const mockStorageRequestErrorMessage = {
        code: "REQUEST_SEND_ERROR",
    };

    const loadingOverlayName = "customModelLabelPage";

    beforeEach(() => {
        const predictions = {
            [mockDocument.name]: {
                name: mockDocument.name,
                analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
            },
        };

        baseProps = {
            documents: mockDocuments,
            location: { pathname: `/studio/custommodel/projects/mock-custom-model-project-project-id/label` },
            splitPaneSizes: mockSplitPaneSizes,
            setDefinitions: jest.fn(),
            setFields: jest.fn(),
            setLabelsByName: jest.fn(),
            labels: {},
            predictions,
            addDocuments: jest.fn(),
            deleteDocument: jest.fn(),
            setDocumentAnalyzingStatus: jest.fn(),
            setDocumentLabelingStatus: jest.fn(),
            setDocumentPrediction: jest.fn(),
            clearLabelError: jest.fn(),
            labelError: null,
            addLoadingOverlay: jest.fn(),
            removeLoadingOverlayByName: jest.fn(),
            deleteLabelByName: jest.fn(),
        };

        mockReadText = jest.fn().mockImplementation((url) => {
            if (url === constants.fieldsFile) {
                return Promise.resolve(JSON.stringify({ fields: mockFields, definitions: mockDefinitions }));
            } else if (url === `${mockDocument.name}${constants.labelFileExtension}`) {
                return Promise.resolve(JSON.stringify({ labels: mockDocumentLabels }));
            } else if (url === `${mockDocument.name}${constants.ocrFileExtension}`) {
                return Promise.resolve(JSON.stringify(mockLayoutV3_0_3_AnalyzeResponse));
            }
        });

        mockListFilesInFolder = jest.fn().mockResolvedValue([]);

        mockWriteText = jest.fn().mockResolvedValue(undefined);

        mockWriteBinary = jest.fn().mockResolvedValue(undefined);

        mockIsFileExists = jest.fn().mockResolvedValue(false);

        mockDeleteFile = jest.fn().mockResolvedValue(undefined);

        (StorageProvider as any).mockImplementation(() => {
            return {
                readText: mockReadText,
                listFilesInFolder: mockListFilesInFolder,
                writeText: mockWriteText,
                writeBinary: mockWriteBinary,
                isFileExists: mockIsFileExists,
                deleteFile: mockDeleteFile,
            };
        });

        jest.spyOn(document.documentElement, "clientWidth", "get").mockImplementation(() => 1800);
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly without documents", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setState({
                showEmptyFolderMessage: true,
            });

            expect(wrapper).toMatchSnapshot();
        });

        it("should render message modal, when labelError is set", () => {
            const props = {
                ...baseProps,
                labelError: {
                    name: "Label assignment warning",
                    message: "SelectionMark field only supports one draw region or checkbox per field.",
                },
            };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should render message modal, when labelError is set with messageVariable", () => {
            const props = {
                ...baseProps,
                labelError: {
                    name: "Cross-page label error",
                    message:
                        "Sorry, we don't support cross-page labeling with the same field. You have label regions with same field name ",
                    messageArguments: { fieldName: "mock-field-name" },
                },
            };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when error is StorageRequestError", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setState({ errorMessage: mockStorageRequestErrorMessage });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should create StorageProvider, when mount", () => {
            shallow(<CustomModelLabelPage {...baseProps} />);

            expect(StorageProvider).toBeCalledTimes(1);
        });

        it("should set isTablePaneOpen when setIsTablePaneOpen prop of labelPane is called", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />) as any;
            const labelPane = wrapper.find("Connect(LabelPane)") as any;

            labelPane.prop("setIsTablePaneOpen")(true);
            expect(wrapper.state("isTablePaneOpen")).toBe(true);
        });

        it("should get and not set fields, when mount with no fields file", async () => {
            mockReadText = jest.fn().mockResolvedValue(undefined);
            shallow(<CustomModelLabelPage {...baseProps} />);

            await flushPromises();
            expect(baseProps.setFields).not.toBeCalled();
            expect(baseProps.setDefinitions).not.toBeCalled();
        });

        it("should get but not set fields and set isInvalidFieldsFormatModalOpen to true, when mount with fields file of incorrect format", async () => {
            mockReadText = jest.fn().mockResolvedValue(JSON.stringify(mockInvalidFields));
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            await flushPromises();
            expect(wrapper.state("isInvalidFieldsFormatModalOpen")).toBe(true);
            expect(baseProps.setFields).not.toBeCalled();
            expect(baseProps.setDefinitions).not.toBeCalled();
        });

        it("should list and add documents, when mount", async () => {
            const fileName = "sample.pdf";
            mockListFilesInFolder = jest
                .fn()
                .mockResolvedValue([
                    fileName,
                    `${fileName}${constants.labelFileExtension}`,
                    `${fileName}${constants.ocrFileExtension}`,
                ]);
            shallow(<CustomModelLabelPage {...baseProps} />);
            await flushPromises();

            const path = encodeURIComponent("sample.pdf");
            const docUrl = `${process.env.REACT_APP_SERVER_SITE_URL}/files/${path}`;
            const expectedDocs = [
                {
                    name: fileName,
                    type: getDocumentType(fileName),
                    url: docUrl,
                },
            ];

            expect(mockListFilesInFolder).toBeCalledTimes(1);
            expect(baseProps.addDocuments).toBeCalledTimes(1);
            expect(baseProps.addDocuments).toBeCalledWith(expectedDocs);
            await flushPromises();
            expect(baseProps.setDocumentAnalyzingStatus).toBeCalledTimes(1);
            expect(baseProps.setDocumentAnalyzingStatus).toBeCalledWith({
                name: fileName,
                status: DocumentStatus.Analyzed,
            });
            expect(baseProps.setDocumentLabelingStatus).toBeCalledTimes(1);
            expect(baseProps.setDocumentLabelingStatus).toBeCalledWith({
                name: fileName,
                status: DocumentStatus.Labeled,
            });
        });

        it("should list not add document when mount with no document", async () => {
            shallow(<CustomModelLabelPage {...baseProps} />);
            await flushPromises();

            expect(mockListFilesInFolder).toBeCalledTimes(1);
            expect(baseProps.addDocuments).not.toBeCalled();
            expect(baseProps.removeLoadingOverlayByName).toBeCalledTimes(1);
            expect(baseProps.removeLoadingOverlayByName).toBeCalledWith(loadingOverlayName);
        });

        it("should get and set labels, when currentDocument is changed", async () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setProps({ currentDocument: mockDocument });

            expect(wrapper.state("isLoadingLabels")).toBe(true);
            await flushPromises();
            expect(wrapper.state("isLoadingLabels")).toBe(false);
            expect(baseProps.setLabelsByName).toBeCalledTimes(1);
            expect(baseProps.setLabelsByName).toBeCalledWith({ name: mockDocument.name, labels: mockDocumentLabels });
        });

        it("should fetch ocr.json, when the file existed in customer storage", async () => {
            mockIsFileExists = jest.fn().mockResolvedValue(true);
            const props = { ...baseProps, predictions: {} };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ currentDocument: mockDocument });
            await flushPromises();

            const expectedPath = `${mockDocument.name}${constants.ocrFileExtension}`;
            expect(mockIsFileExists).toBeCalledTimes(1);
            expect(mockIsFileExists).toBeCalledWith(expectedPath, true);
            expect(mockReadText).toBeCalledTimes(3); // 1 for fields.json, 1 for labels.json, and 1 for ocr.json
            expect(mockReadText).toBeCalledWith(expectedPath, true);

            expect(baseProps.setDocumentPrediction).toBeCalledWith({
                name: mockDocument.name,
                analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
            });

            expect(baseProps.setDocumentAnalyzingStatus).toBeCalledWith({
                name: mockDocument.name,
                status: DocumentStatus.Analyzed,
            });
        });

        it("should get and set labels to empty array, when currentDocument is changed with no labels file", async () => {
            mockReadText = jest.fn().mockResolvedValue(undefined);
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setProps({ currentDocument: mockDocument });

            expect(wrapper.state("isLoadingLabels")).toBe(true);
            await flushPromises();
            expect(wrapper.state("isLoadingLabels")).toBe(false);
            expect(baseProps.setLabelsByName).toBeCalledTimes(1);
            expect(baseProps.setLabelsByName).toBeCalledWith({ name: mockDocument.name, labels: [] });
        });

        it("should not get and not set labels, when currentDocument is changed and labels exist", () => {
            const props = { ...baseProps, labels: { [mockDocument.name]: mockDocumentLabels } };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ currentDocument: mockDocument });

            expect(baseProps.setLabelsByName).not.toBeCalled();
        });

        it("should clearLabelError, when message modal close button is clicked", () => {
            const props = {
                ...baseProps,
                labelError: {
                    name: "Label assignment warning",
                    message: "SelectionMark field only supports one draw region or checkbox per field.",
                },
            };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);

            (wrapper.find("MessageModal").first().prop("onClose") as any)();

            expect(props.clearLabelError).toBeCalledTimes(1);
        });

        it("should set isPreparing to false, when the document is loaded with labels", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setProps({ currentDocument: mockDocument });
            wrapper.setState({ isLoadingLabels: false });

            expect(baseProps.removeLoadingOverlayByName).toBeCalledTimes(1);
            expect(baseProps.removeLoadingOverlayByName).toBeCalledWith(loadingOverlayName);
        });

        it("should set labeling status to labeled, when labels are added", async () => {
            const props = {
                ...baseProps,
                currentDocument: mockDocument,
                labels: { [mockDocument.name]: [] },
            };

            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ labels: { [mockDocument.name]: mockDocumentLabels } });

            expect(props.setDocumentLabelingStatus).toBeCalledTimes(1);
            expect(props.setDocumentLabelingStatus).toBeCalledWith({
                name: mockDocument.name,
                status: DocumentStatus.Labeled,
            });
        });

        it("should set labeling status to undefined, when labels are set to empty array", async () => {
            const props = {
                ...baseProps,
                currentDocument: mockDocument,
                labels: { [mockDocument.name]: mockDocumentLabels },
            };

            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ labels: { [mockDocument.name]: [] } });

            expect(props.setDocumentLabelingStatus).toBeCalledTimes(1);
            expect(props.setDocumentLabelingStatus).toBeCalledWith({ name: mockDocument.name, status: undefined });
        });

        it("should handle fields.json deletion when invalidFieldsFormatModal is open and action button is clicked", async () => {
            const deleteFileUrl = constants.fieldsFile;
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            wrapper.setState({ isInvalidFieldsFormatModalOpen: true });
            const modal = wrapper.find("MessageModal").last() as any;
            await modal.prop("onActionButtonClick")();

            expect(mockDeleteFile).toBeCalledTimes(1);
            expect(mockDeleteFile).toBeCalledWith(deleteFileUrl, true);
            expect(wrapper.state("isInvalidFieldsFormatModalOpen")).toBe(false);
        });

        it("should handle error correctly when getAndSetOcr is triggered and isFileExists is rejected", async () => {
            mockIsFileExists = jest.fn().mockRejectedValue(mockErrorMessage);
            const props = { ...baseProps, predictions: {} };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ currentDocument: mockDocument });

            await flushPromises();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should handle error correctly when getAndSetLabels is triggered and readText is rejected", async () => {
            mockReadText = jest.fn().mockRejectedValue(mockErrorMessage);
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            await flushPromises();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should handle error correctly when getAndSetLabels is triggered and readText is rejected", async () => {
            mockReadText = jest.fn().mockRejectedValue(mockErrorMessage);
            const props = { ...baseProps, labels: {} };
            const wrapper = shallow(<CustomModelLabelPage {...props} />);
            wrapper.setProps({ currentDocument: mockDocument });

            await flushPromises();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should handle error correctly when getAndSetLabels is triggered readText is rejected", async () => {
            mockReadText = jest.fn().mockRejectedValue(mockErrorMessage);
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            await flushPromises();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should handle error correctly when getAndSetDocuments is triggered listFilesInFolder is rejected", async () => {
            mockListFilesInFolder = jest.fn().mockRejectedValue(mockErrorMessage);
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            await flushPromises();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should handle error correctly when delete fields.json on  is rejected", async () => {
            mockDeleteFile = jest.fn().mockRejectedValue(mockErrorMessage);
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);

            wrapper.setState({ isInvalidFieldsFormatModalOpen: true });
            const modal = wrapper.find("MessageModal").last() as any;
            await modal.prop("onActionButtonClick")();

            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should close modal and go to projects page when onClose of StorageRequestError is triggered", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setState({ errorMessage: mockStorageRequestErrorMessage });
            const modal = wrapper.find("MessageModal").last() as any;

            modal.prop("onClose")();

            expect(wrapper.state("errorMessage")).toBe(undefined);
        });

        it("should setSplitPaneSizes with the latest sizes when split gutter is dragged with labelTablePane closed", () => {
            const onDragEndSplitSizes = [60, 40];
            const updatedSplitPaneSizes = {
                ...constants.defaultSplitPaneSizes,
                labelSplitPaneSize: onDragEndSplitSizes,
            };
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setState({ isTablePaneOpen: false });
            const splitContainer = wrapper.find("SplitWrapper").first() as any;

            splitContainer.prop("onDragEnd")(onDragEndSplitSizes);

            expect(wrapper.state("splitPaneSizes")).toStrictEqual(updatedSplitPaneSizes);
        });

        it("should setSplitPaneSizes with the latest sizes when split gutter is dragged with labelTablePane open", () => {
            const onDragEndSplitSizes = [55, 45];
            const updatedSplitPaneSizes = {
                ...constants.defaultSplitPaneSizes,
                labelTableSplitPaneSize: onDragEndSplitSizes,
            };
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            wrapper.setState({ isTablePaneOpen: true });
            const splitContainer = wrapper.find("SplitWrapper").first() as any;

            splitContainer.prop("onDragEnd")(onDragEndSplitSizes);

            expect(wrapper.state("splitPaneSizes")).toStrictEqual(updatedSplitPaneSizes);
        });

        it("should delete document, ocr.json, labels.json in Storage storage when documents deleted", async () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            const instance = wrapper.instance() as any;
            jest.spyOn(instance, "deleteDocumentInStorage");

            const name = mockDocument.name;

            const expectedFilePath = name;
            const expectedOcrFilePath = `${name}${constants.ocrFileExtension}`;
            const expectedLabelFilePath = `${name}${constants.labelFileExtension}`;

            (wrapper.find("Connect(DocumentGallery)") as any).prop("onDocumentDeleted")(mockDocument);

            await flushPromises();

            expect(baseProps.deleteLabelByName).toBeCalledTimes(1);
            expect(baseProps.deleteLabelByName).toBeCalledWith(name);
            expect(mockDeleteFile).toBeCalledTimes(3);
            expect(mockDeleteFile).toBeCalledWith(expectedFilePath);
            expect(mockDeleteFile).toBeCalledWith(expectedOcrFilePath, true);
            expect(mockDeleteFile).toBeCalledWith(expectedLabelFilePath, true);
        });

        it("should dispatch removeLoadingOverlay when unmount", () => {
            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            const instance = wrapper.instance() as any;
            instance.componentWillUnmount();

            expect(baseProps.removeLoadingOverlayByName).toBeCalledTimes(1);
            expect(baseProps.removeLoadingOverlayByName).toBeCalledWith(loadingOverlayName);
        });
    });

    describe("Error Handling", () => {
        it("should show delete documents error modal if error occurs during deleteDocumentInStorage", async () => {
            const mockErrorMessage = "Delete failed";
            mockDeleteFile = jest.fn().mockRejectedValue(mockErrorMessage);

            (StorageProvider as any).mockImplementation(() => {
                return {
                    readText: mockReadText,
                    listFilesInFolder: mockListFilesInFolder,
                    writeText: mockWriteText,
                    writeBinary: mockWriteBinary,
                    isFileExists: mockIsFileExists,
                    deleteFile: mockDeleteFile,
                };
            });

            const wrapper = shallow(<CustomModelLabelPage {...baseProps} />);
            const instance = wrapper.instance() as any;
            jest.spyOn(instance, "deleteDocumentInStorage");

            (wrapper.find("Connect(DocumentGallery)") as any).prop("onDocumentDeleted")(mockDocument);

            await flushPromises();

            expect(mockDeleteFile).toBeCalledTimes(1);
            expect(wrapper.state("errorMessage")).toBe(mockErrorMessage);
        });

        it("should show loading overlay when mounted", async () => {
            shallow(<CustomModelLabelPage {...baseProps} />);

            expect(baseProps.addLoadingOverlay).toBeCalledTimes(1);
        });
    });
});
