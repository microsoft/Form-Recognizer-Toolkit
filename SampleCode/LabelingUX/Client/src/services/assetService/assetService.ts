import { Field, Definitions, Labels } from "models/customModels";

export interface IAssetService {
    fetchAllDocumentLabels(documentNames: string[]): Promise<Labels>;
    updateFields(fields: Field[], definitions: Definitions): Promise<void>;
    updateDocumentLabels(labels: Labels): Promise<void>;
}
