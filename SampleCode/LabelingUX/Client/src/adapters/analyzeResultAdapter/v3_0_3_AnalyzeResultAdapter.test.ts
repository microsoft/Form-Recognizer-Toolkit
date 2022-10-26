import { V3_0_3_AnalyzeResult } from "models/analyzeResult/v3_0_3";
import {
    mockLayoutV3_0_3_AnalyzeResult,
    mockLayoutV3_0_3_AnalyzeResultWithPod,
} from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { IAnalyzeResultAdapter } from ".";
import { V3_0_3_AnalyzeResultAdapter } from "./v3_0_3_AnalyzeResultAdapter";

describe("V3_0_3_AnalyzeResultAdapter", () => {
    let adapter: IAnalyzeResultAdapter;

    beforeEach(() => {
        adapter = new V3_0_3_AnalyzeResultAdapter(mockLayoutV3_0_3_AnalyzeResult as V3_0_3_AnalyzeResult);
    });

    it("should handle getDocumentPage", () => {
        expect(adapter.getDocumentPage(1)).toMatchSnapshot();
    });

    it("should handle getDocumentPage and return undefined, when there's no target page", () => {
        expect(adapter.getDocumentPage(-1)).toBeUndefined();
    });

    it("should handle getDocumentPages", () => {
        expect(adapter.getDocumentPages()).toMatchSnapshot();
    });

    it("should handle getDocumentTables", () => {
        expect(adapter.getDocumentTables()).toMatchSnapshot();
    });

    it("should handle getDocumentPagedText with content from analyzeResult", () => {
        expect(adapter.getDocumentPagedText()).toMatchSnapshot();
    });

    it("should handle getDocumentPagedText with paragraph from analyzeResult", () => {
        adapter = new V3_0_3_AnalyzeResultAdapter(mockLayoutV3_0_3_AnalyzeResultWithPod);
        expect(adapter.getDocumentPagedText()).toMatchSnapshot();
    });

    it("should handle getDocumentPagedSelectionMarks with content from analyzeResult", () => {
        expect(adapter.getDocumentPagedSelectionMarks()).toMatchSnapshot();
    });

    it("should handle getDocumentPagedTables with content from analyzeResult", () => {
        expect(adapter.getDocumentPagedTables()).toMatchSnapshot();
    });
});
