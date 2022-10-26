import {
    StudioDocumentEntity,
    StudioDocumentKeyValuePair,
    StudioDocumentPage,
    StudioDocumentResult,
    StudioDocumentTable,
    ParsedContentPagedText,
    ParsedContentPagedSelectionMarks,
    ParsedContentPagedTables,
} from "models/analyzeResult";
import { V3_0_3_AnalyzeResultAdapter } from "./v3_0_3_AnalyzeResultAdapter";

export interface IAnalyzeResultAdapter {
    getDocumentPage: (pageNumber: number) => StudioDocumentPage | undefined;
    getDocumentPages: () => StudioDocumentPage[];
    getDocumentTables: () => StudioDocumentTable[];
    getDocumentResults: () => StudioDocumentResult[];
    getDocumentKeyValuePairs: () => StudioDocumentKeyValuePair[];
    getDocumentEntities: () => StudioDocumentEntity[];
    getDocumentPagedText: () => ParsedContentPagedText;
    getDocumentPagedTables: () => ParsedContentPagedTables;
    getDocumentPagedSelectionMarks: () => ParsedContentPagedSelectionMarks;
}

export class AnalyzeResultAdapterFactory {
    static create(analyzeResult: any): IAnalyzeResultAdapter {
        return new V3_0_3_AnalyzeResultAdapter(analyzeResult);
    }
}
