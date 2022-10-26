import { shallow } from "enzyme";
import * as React from "react";

import { DocumentStatus } from "store/documents/documentsTypes";
import { DocumentPreviewList } from "./documentPreviewList";

describe("<DocumentPreviewList />", () => {
    let baseProps;

    const items = new Array(10).fill({}).map((item, index) => {
        return {
            name: `item ${index}`,
            url: `/item_${index}.jpg`,
            status: index < 5 ? DocumentStatus.Loaded : DocumentStatus.Analyzing,
        };
    });

    const nullItems = new Array(10).fill(undefined);

    beforeEach(() => {
        baseProps = {
            currentDocument: null,
            documents: items,
            onDocumentClick: jest.fn(),
            onDocumentDelete: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should match snapshot.", () => {
            const wrapper = shallow(<DocumentPreviewList {...baseProps} />);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should be empty list, when undefined items provided.", () => {
            const props = { ...baseProps, documents: nullItems };
            const wrapper = shallow(<DocumentPreviewList {...props} />);
            const list = wrapper.find("List") as any;

            expect(list.prop("onRenderCell")(nullItems[0], 0)).toBeNull();
        });

        it("should call onDocumentClick, when clicked on element.", () => {
            const clickedDoc = items[0];
            const wrapper = shallow(<DocumentPreviewList {...baseProps} />);

            const list = wrapper.find("List") as any;
            const documentPreview = shallow(list.prop("onRenderCell")(clickedDoc, 0)).find("DocumentPreview") as any;
            documentPreview.prop("onDocumentClick")(clickedDoc.name);

            expect(baseProps.onDocumentClick).toBeCalledWith(clickedDoc.name, 0);
        });

        it("should call onDocumentDelete, when clicked on element.", () => {
            const docIndexToDelete = 0;
            const docToDelete = items[docIndexToDelete];
            const wrapper = shallow(<DocumentPreviewList {...baseProps} />);

            const list = wrapper.find("List") as any;
            const documentPreview = shallow(list.prop("onRenderCell")(docToDelete, docIndexToDelete)).find(
                "DocumentPreview"
            ) as any;
            documentPreview.prop("onDocumentDelete")(docToDelete.name);

            expect(baseProps.onDocumentDelete).toBeCalledWith(docToDelete.name, docIndexToDelete);
        });

        it("should scroll to index, when currentDocument is changed", () => {
            const mockScrollToIndex = jest.fn();

            const wrapper = shallow(<DocumentPreviewList {...baseProps} />) as any;
            wrapper.instance().listRef = { current: { scrollToIndex: mockScrollToIndex } };
            wrapper.setProps({ currentDocument: items[0] });

            expect(mockScrollToIndex).toBeCalledTimes(1);
            expect(mockScrollToIndex.mock.calls[0][0]).toBe(0);
        });
    });
});
