import { shallow } from "enzyme";
import * as React from "react";
import { ImageMapToolbar } from "./imageMapToolbar";

describe("<ImageMapToolbar />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            disabled: false,
            zoomRatio: 1.2,
            rotateAngle: 0,
            onZoomInClick: jest.fn(),
            onZoomOutClick: jest.fn(),
            onZoomToFitClick: jest.fn(),
            onRotateClick: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<ImageMapToolbar {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it is disabled", () => {
            const props = {
                ...baseProps,
                disabled: true,
            };

            const wrapper = shallow(<ImageMapToolbar {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        const buttonSelector = "DefaultIconButton";

        it("should call zoom-in handler, when ZoomIn button is clicked", () => {
            const wrapper = shallow(<ImageMapToolbar {...baseProps} />);
            const button = wrapper.find(buttonSelector).first();
            button.simulate("click");

            expect(baseProps.onZoomInClick).toBeCalledTimes(1);
        });

        it("should call zoom-out handler, when ZoomOut button is clicked", () => {
            const wrapper = shallow(<ImageMapToolbar {...baseProps} />);
            const button = wrapper.find(buttonSelector).at(1);
            button.simulate("click");

            expect(baseProps.onZoomOutClick).toBeCalledTimes(1);
        });

        it("should call zoom-to-fit handler, when ZoomToFit button is clicked", () => {
            const wrapper = shallow(<ImageMapToolbar {...baseProps} />);
            const button = wrapper.find(buttonSelector).at(2);
            button.simulate("click");

            expect(baseProps.onZoomToFitClick).toBeCalledTimes(1);
        });

        it("should call rotate handler, when Rotate button is clicked", () => {
            const wrapper = shallow(<ImageMapToolbar {...baseProps} />);
            const button = wrapper.find(buttonSelector).last();
            button.simulate("click");

            expect(baseProps.onRotateClick).toBeCalledTimes(1);
        });
    });
});
