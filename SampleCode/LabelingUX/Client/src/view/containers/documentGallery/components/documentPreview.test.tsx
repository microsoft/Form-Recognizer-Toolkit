import { shallow } from "enzyme";
import * as React from "react";
import { DocumentStatus } from "store/documents/documentsTypes";
import { DocumentPreview } from "./documentPreview";

describe("<DocumentPreview />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            selected: false,
            documentName: "title",
            documentStates: { loadingStatus: DocumentStatus.Loaded },
            documentImageSrc: "sample.jpg",
            onDocumentClick: jest.fn(),
            onDocumentDelete: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should match snapshot.", () => {
            const wrapper = shallow(<DocumentPreview {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when the document is selected", () => {
            const props = {
                ...baseProps,
                selected: true,
            };

            const wrapper = shallow(<DocumentPreview {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when the document is analyzing", () => {
            const props = {
                ...baseProps,
                documentStates: { ...baseProps.documentStates, analyzingStatus: DocumentStatus.Analyzing },
            };

            const wrapper = shallow(<DocumentPreview {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when the document is analyzed", () => {
            const props = {
                ...baseProps,
                documentStates: { ...baseProps.documentStates, analyzingStatus: DocumentStatus.Analyzed },
            };

            const wrapper = shallow(<DocumentPreview {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when the document is labeled", () => {
            const props = {
                ...baseProps,
                documentStates: {
                    ...baseProps.documentStates,
                    analyzingStatus: DocumentStatus.Analyzed,
                    labelingStatus: DocumentStatus.Labeled,
                },
            };

            const wrapper = shallow(<DocumentPreview {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot with delete Icon, when mouse enter document card", () => {
            const wrapper = shallow(<DocumentPreview {...baseProps} />) as any;
            const documentCard = wrapper.find("StyledDocumentCardBase").first();
            documentCard.simulate("mouseenter");

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should call onDocumentClick when clicked on element", () => {
            const wrapper = shallow(<DocumentPreview {...baseProps} />);
            wrapper.simulate("click");

            expect(baseProps.onDocumentClick).toBeCalledWith(baseProps.documentName);
        });

        it("should set isDocumentCardHovered to be true, when mouse enter document card", () => {
            const wrapper = shallow(<DocumentPreview {...baseProps} />) as any;
            const documentCard = wrapper.find("StyledDocumentCardBase").first();
            documentCard.simulate("mouseenter");

            expect(wrapper.state("isDocumentCardHovered")).toBe(true);
        });

        it("should set isDocumentCardHovered to be false, when mouse leave document card", () => {
            const wrapper = shallow(<DocumentPreview {...baseProps} />) as any;
            wrapper.setState({ isDocumentCardHovered: true });
            const documentCard = wrapper.find("StyledDocumentCardBase").first();
            documentCard.simulate("mouseleave");

            expect(wrapper.state("isDocumentCardHovered")).toBe(false);
        });

        it("should delete document and not setCurrentDocument to it, when delete icon is clicked", () => {
            const clickEvent = new Event("click");
            const wrapper = shallow(<DocumentPreview {...baseProps} />) as any;
            wrapper.setState({ isDocumentCardHovered: true });
            const deleteIcon = wrapper.find(".documentcard-delete-icon").first();
            deleteIcon.simulate("click", clickEvent);

            expect(baseProps.onDocumentDelete).toBeCalledTimes(1);
            expect(baseProps.onDocumentDelete).toBeCalledWith(baseProps.documentName);
            expect(baseProps.onDocumentClick).not.toBeCalled();
        });
    });
});
