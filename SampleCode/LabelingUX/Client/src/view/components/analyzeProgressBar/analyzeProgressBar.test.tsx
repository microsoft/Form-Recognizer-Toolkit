import * as React from "react";
import { shallow } from "enzyme";

import { AnalyzeProgressBar } from "./analyzeProgressBar";

describe("<AnalyzeProgressBar />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            title: "<title>",
            subtitle: "<subtitle>",
            percentComplete: undefined,
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<AnalyzeProgressBar {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
