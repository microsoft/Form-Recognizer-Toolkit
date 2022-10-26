import * as React from "react";
import { shallow } from "enzyme";
import { MessageModal } from "./messageModal";

describe("<MessageModal />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            isOpen: true,
            title: "<title>",
            body: <div>Hello World</div>,
            width: 700,
            actionButtonDisabled: false,
            actionButtonText: "Done",
            onActionButtonClick: jest.fn(),
            onClose: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<MessageModal {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when there's no action button", () => {
            const props = { ...baseProps, onActionButtonClick: undefined };

            const wrapper = shallow(<MessageModal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it is loading", () => {
            const props = { ...baseProps, isLoading: true };

            const wrapper = shallow(<MessageModal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when there is rejectButtonText", () => {
            const props = { ...baseProps, rejectButtonText: "No" };

            const wrapper = shallow(<MessageModal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should trigger onActionButtonClick, when action button is clicked", () => {
            const wrapper = shallow(<MessageModal {...baseProps} />);

            const ButtonGroup: any = () => wrapper.find("Modal").prop("buttonGroup");
            const button = shallow(<ButtonGroup />).find("CustomizedPrimaryButton");
            button.simulate("click");

            expect(baseProps.onActionButtonClick).toBeCalledTimes(1);
        });

        it("should trigger onClose, when close button is clicked", () => {
            const wrapper = shallow(<MessageModal {...baseProps} />);

            const ButtonGroup: any = () => wrapper.find("Modal").prop("buttonGroup");
            const button = shallow(<ButtonGroup />).find("CustomizedDefaultButton");
            button.simulate("click");

            expect(baseProps.onClose).toBeCalledTimes(1);
        });
    });
});
