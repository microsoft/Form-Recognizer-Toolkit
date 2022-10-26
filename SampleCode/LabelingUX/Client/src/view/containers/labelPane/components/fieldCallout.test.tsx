import { shallow } from "enzyme";
import * as React from "react";
import { FieldCallout } from "./fieldCallout";

describe("<FieldCallout />", () => {
    let baseProps;
    beforeEach(() => {
        baseProps = {
            width: 200,
            onCreateField: jest.fn(),
            onDismiss: jest.fn(),
            onGetErrorMessage: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<FieldCallout {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should call onCreateField and onDismiss, when onKeyDown of TextField is triggered with enter", () => {
            const mockEvent = { key: "Enter", target: { value: "value" } };

            const wrapper = shallow(<FieldCallout {...baseProps} />);
            const textField = wrapper.find("StyledTextFieldBase") as any;
            textField.prop("onKeyDown")(mockEvent);

            expect(baseProps.onCreateField).toBeCalledTimes(1);
            expect(baseProps.onCreateField).toBeCalledWith(mockEvent.target.value);
            expect(baseProps.onDismiss).toBeCalledTimes(1);
        });

        it("should not call onCreateField and onDismiss, when onKeyDown of TextField is triggered with enter with error", () => {
            const props = { ...baseProps, onGetErrorMessage: jest.fn().mockReturnValue("error") };
            const mockEvent = { key: "Enter", target: { value: "value" } };

            const wrapper = shallow(<FieldCallout {...props} />);
            const textField = wrapper.find("StyledTextFieldBase") as any;
            textField.prop("onKeyDown")(mockEvent);

            expect(baseProps.onCreateField).not.toBeCalled();
            expect(baseProps.onDismiss).not.toBeCalled();
        });

        it("should call onGetErrorMessage, when onGetErrorMessage of TextField is triggered", () => {
            const mockValue = "value";

            const wrapper = shallow(<FieldCallout {...baseProps} />);
            const textField = wrapper.find("StyledTextFieldBase") as any;
            textField.prop("onGetErrorMessage")(mockValue);

            expect(baseProps.onGetErrorMessage).toBeCalledTimes(1);
            expect(baseProps.onGetErrorMessage).toBeCalledWith(mockValue);
        });
    });
});
