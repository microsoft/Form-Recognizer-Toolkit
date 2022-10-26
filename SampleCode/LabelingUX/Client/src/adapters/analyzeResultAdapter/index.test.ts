import { mockLayoutV3_0_3_AnalyzeResult } from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { AnalyzeResultAdapterFactory } from ".";

import { V3_0_3_AnalyzeResultAdapter } from "./v3_0_3_AnalyzeResultAdapter";

describe("AnalyzeResultAdapterFactory", () => {
    it("should handle create v3.0.3 adapter for 2022-03-31-preview", () => {
        expect(AnalyzeResultAdapterFactory.create(mockLayoutV3_0_3_AnalyzeResult)).toBeInstanceOf(
            V3_0_3_AnalyzeResultAdapter
        );
    });
});
