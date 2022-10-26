import * as React from "react";
import { shallow } from "enzyme";
import { PageControl } from "./pageControl";

describe("<PageControl />", () => {
    let baseProps;

    beforeEach(() => {
        jest.useFakeTimers();
        baseProps = {
            disabled: false,
            currentPage: 3,
            numPages: 10,
            onPageChange: jest.fn(),
            onPreviousClick: jest.fn(),
            onNextClick: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when page control is disabled", () => {
            const props = { ...baseProps, disabled: true };

            const wrapper = shallow(<PageControl {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when current page is the first page", () => {
            const props = { ...baseProps, currentPage: 1 };

            const wrapper = shallow(<PageControl {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when current page is the last page", () => {
            const props = { ...baseProps, currentPage: 10 };

            const wrapper = shallow(<PageControl {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when number of pages is 1", () => {
            const props = { ...baseProps, currentPage: 1, numPages: 1 };

            const wrapper = shallow(<PageControl {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when there's no current page and number of pages", () => {
            const props = { ...baseProps, currentPage: undefined, numPages: undefined };

            const wrapper = shallow(<PageControl {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        const textFieldSelector = "StyledTextFieldBase";

        it("should set display page, when current page is changed", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);
            wrapper.setProps({ currentPage: 4 });

            expect(wrapper.state("displayPage")).toBe(4);
        });

        it("should handle previous page, when the previous button is clicked", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);
            const previousButton = wrapper.find("DefaultIconButton").first();
            previousButton.simulate("click");

            expect(baseProps.onPreviousClick).toBeCalledTimes(1);
        });

        it("should handle previous page, when the next button is clicked", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);
            const previousButton = wrapper.find("DefaultIconButton").last();
            previousButton.simulate("click");

            expect(baseProps.onNextClick).toBeCalledTimes(1);
        });

        it("should handle display page change, when the page input is changed", () => {
            const page = 5;

            const wrapper = shallow(<PageControl {...baseProps} />);
            const textField = wrapper.find(textFieldSelector) as any;

            // Normal.
            textField.simulate("change", {}, page.toString());
            expect(wrapper.state("displayPage")).toBe(page);

            // Do not change the display page when out of bound.
            textField.simulate("change", {}, "12");
            expect(wrapper.state("displayPage")).toBe(page);

            textField.simulate("change", {}, "0");
            expect(wrapper.state("displayPage")).toBe(page);

            textField.simulate("change", {}, undefined);
            expect(wrapper.state("displayPage")).toBe(page);
        });

        it("should trigger onPageChange with delay, when the page input is changed continuously", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);
            const textField = wrapper.find(textFieldSelector) as any;
            const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
            const setTimeoutSpy = jest.spyOn(global, "setTimeout");

            textField.simulate("change", {}, "5");
            textField.simulate("change", {}, "6");
            textField.simulate("change", {}, "7");
            jest.runAllTimers();

            expect(clearTimeoutSpy).toBeCalledTimes(2);
            expect(setTimeoutSpy).toBeCalledTimes(3);
            expect(baseProps.onPageChange).toBeCalledTimes(1);
            expect(baseProps.onPageChange).toBeCalledWith(7);
        });

        it("should handle blur text field, when a key is pressed", () => {
            const wrapper = shallow(<PageControl {...baseProps} />);
            wrapper.instance()["inputRef"] = { current: { blur: jest.fn() } };
            const textField = wrapper.find(textFieldSelector) as any;

            // Press Enter.
            textField.simulate("keypress", { key: "Enter" });
            expect(wrapper.instance()["inputRef"].current.blur).toBeCalled();

            // Press other key should not trigger blur.
            wrapper.instance()["inputRef"] = { current: { blur: jest.fn() } };
            textField.simulate("keypress", { key: "Alt" });
            expect(wrapper.instance()["inputRef"].current.blur).not.toBeCalled();
        });
    });
});
