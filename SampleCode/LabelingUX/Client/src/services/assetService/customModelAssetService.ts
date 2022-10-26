import { constants } from "consts/constants";
import { Definitions, Field, Labels } from "models/customModels";
import { StorageProvider } from "providers/storageProvider";
import { IStorageProvider } from "providers/storageProvider";
import { IAssetService } from "./assetService";

export class CustomModelAssetService implements IAssetService {
    private storageProvider: IStorageProvider;
    private fieldsSchema: string = constants.fieldsSchema;
    private labelsSchema: string = constants.labelsSchema;

    constructor() {
        this.storageProvider = new StorageProvider();
    }

    /**
     * Fetch all documents labels.json.
     * @param documents - The documents to be fetched.
     */
    public async fetchAllDocumentLabels(documentNames: string[]): Promise<Labels> {
        const fetchPromises = documentNames.map((documentName) =>
            this.storageProvider.readText(`${documentName}${constants.labelFileExtension}`, true)
        );
        const documentLabelsList = await Promise.all(fetchPromises);
        const result = {};
        documentLabelsList.forEach((documentLabels, index) => {
            result[documentNames[index]] = documentLabels ? JSON.parse(documentLabels).labels : [];
        });
        return result;
    }

    /**
     * Update fields.json.
     * @param fields - The updated fields.
     * @param definitions - The updated definitions.
     */
    public async updateFields(fields: Field[], definitions: Definitions): Promise<void> {
        const fieldsJson = JSON.stringify({ $schema: this.fieldsSchema, fields, definitions }, null, "\t");
        await this.storageProvider.writeText(constants.fieldsFile, fieldsJson);
    }

    /**
     * Update labels.json for target documents.
     * @param labels - A mapping of document name and its labels.
     */
    public async updateDocumentLabels(labels: Labels): Promise<void> {
        const writePromises = Object.entries(labels).map(([documentName, labels]) => {
            const blobName = `${documentName}${constants.labelFileExtension}`;

            if (labels.length === 0) {
                // Delete label.json if there's no labels for this document.
                return this.storageProvider.deleteFile(blobName, true);
            } else {
                const labelsJson = JSON.stringify(
                    { $schema: this.labelsSchema, document: documentName, labels },
                    null,
                    "\t"
                );
                return this.storageProvider.writeText(`${documentName}${constants.labelFileExtension}`, labelsJson);
            }
        });
        await Promise.all(writePromises);
    }
}
