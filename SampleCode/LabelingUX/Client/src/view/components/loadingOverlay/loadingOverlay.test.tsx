import * as React from "react";
import { shallow } from "enzyme";
import { LoadingOverlay } from "./loadingOverlay";

describe("<LoadingOverlay />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            message: "mock-loading-text",
            location: {
                pathname: "mock/location/pathname",
            },
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<LoadingOverlay {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
