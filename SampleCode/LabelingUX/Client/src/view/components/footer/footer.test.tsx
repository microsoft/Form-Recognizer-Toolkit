import { shallow } from "enzyme";
import * as React from "react";
import { Footer } from "./footer";

describe("<Footer />", () => {
    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<Footer />);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
