import { constants } from "consts/constants";
import { mockFields, mockDefinitions, mockDocumentLabels } from "utils/test";
import { StorageProvider } from "providers/storageProvider";
import { CustomModelAssetService } from "./customModelAssetService";

jest.mock("providers/storageProvider");

describe("CustomModelAssetService", () => {
    let assetService: CustomModelAssetService;
    let mockWriteText;
    let mockReadText;
    let mockDeleteFile;

    beforeEach(() => {
        mockWriteText = jest.fn().mockResolvedValue({});
        mockReadText = jest.fn().mockImplementation((docName) => {
            if (docName.startsWith(`label`)) {
                return Promise.resolve(JSON.stringify({ labels: mockDocumentLabels }));
            } else {
                return Promise.resolve(undefined);
            }
        });
        mockDeleteFile = jest.fn().mockResolvedValue({});
        (StorageProvider as any).mockImplementation(() => {
            return { writeText: mockWriteText, readText: mockReadText, deleteFile: mockDeleteFile };
        });

        assetService = new CustomModelAssetService();
    });

    it("should handle fetchAllDocumentLabels", async () => {
        const documents = ["doc1", "labelDoc1", "doc2", "labelDoc2"];
        const expectedValue = {
            doc1: [],
            doc2: [],
            labelDoc1: mockDocumentLabels,
            labelDoc2: mockDocumentLabels,
        };

        const result = await assetService.fetchAllDocumentLabels(documents);

        expect(mockReadText).toBeCalledTimes(4);
        expect(mockReadText).toBeCalledWith(`doc1${constants.labelFileExtension}`, true);
        expect(mockReadText).toBeCalledWith(`doc2${constants.labelFileExtension}`, true);
        expect(mockReadText).toBeCalledWith(`labelDoc1${constants.labelFileExtension}`, true);
        expect(mockReadText).toBeCalledWith(`labelDoc2${constants.labelFileExtension}`, true);
        expect(result).toEqual(expectedValue);
    });

    it("should handle updateFields", async () => {
        const expectedValue = JSON.stringify(
            { $schema: constants.fieldsSchema, fields: mockFields, definitions: mockDefinitions },
            null,
            "\t"
        );

        await assetService.updateFields(mockFields, mockDefinitions);

        expect(mockWriteText).toBeCalledTimes(1);
        expect(mockWriteText).toBeCalledWith(`${constants.fieldsFile}`, expectedValue);
    });

    it("should handle updateDocumentLabels", async () => {
        const labels = {
            doc1: mockDocumentLabels,
            doc2: [],
            doc3: mockDocumentLabels,
        };
        const expectedValues = Object.keys(labels).map((document) =>
            JSON.stringify({ $schema: constants.labelsSchema, document, labels: mockDocumentLabels }, null, "\t")
        );

        await assetService.updateDocumentLabels(labels);

        expect(mockWriteText).toBeCalledTimes(2);
        expect(mockDeleteFile).toBeCalledTimes(1);
        expect(mockWriteText).toBeCalledWith(`doc1${constants.labelFileExtension}`, expectedValues[0]);
        expect(mockDeleteFile).toBeCalledWith(`doc2${constants.labelFileExtension}`, true);
        expect(mockWriteText).toBeCalledWith(`doc3${constants.labelFileExtension}`, expectedValues[2]);
    });
});
