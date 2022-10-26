import * as React from "react";
import { DocumentStatus } from "store/documents/documentsTypes";
import { mockDocument, mockDocuments } from "utils/test";
import { DocumentGallery } from "./documentGallery";
import { shallow } from "enzyme";

jest.mock("utils/documentLoader");
jest.mock("utils", () => ({
    isSupportNewDocTypeEnabled: false,
}));

describe("<DocumentGallery />", () => {
    const myDocument = {
        name: "mock-image-1",
        type: "image/jpg",
        url: "mock-image-1.jpg",
        states: {
            loadingStatus: DocumentStatus.Loaded,
        },
    };

    const sampleDocument = {
        name: "mock-image-2",
        type: "image/jpg",
        url: "mock-image-2.jpg",
        states: {
            loadingStatus: DocumentStatus.Loaded,
        },
    };

    const mockUploadErrorMessage = "mock-upload-error-message";

    let baseProps;

    beforeEach(() => {
        baseProps = {
            documents: [myDocument, sampleDocument],
            currentDocument: null,
            setCurrentDocument: jest.fn(),
            deleteDocument: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should match snapshot.", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when documents are not provided.", () => {
            const props = { ...baseProps, documents: [] };
            const wrapper = shallow(<DocumentGallery {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when hideAddButton is set.", () => {
            const props = { ...baseProps, hideAddButton: true };
            const wrapper = shallow(<DocumentGallery {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when upload error is set.", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            wrapper.setState({
                uploadErrorMessage: mockUploadErrorMessage,
            });
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when delete error is set.", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            wrapper.setState({
                isDeleteModelOpen: true,
                documentToDeleted: { name: mockDocument.name, index: 0 },
            });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should call setCurrentDocument, when document is clicked.", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            const documentClickedHandler = wrapper.find("DocumentPreviewList").prop("onDocumentClick") as any;

            documentClickedHandler(myDocument.name, 0);

            expect(baseProps.setCurrentDocument).toBeCalledTimes(1);
            expect(baseProps.setCurrentDocument).toBeCalledWith(myDocument);
        });

        it("should set the first sample document to the current document, when the document is updated.", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            wrapper.setProps({ documents: baseProps.documents });

            expect(baseProps.setCurrentDocument).toBeCalledTimes(1);
            expect(baseProps.setCurrentDocument).toBeCalledWith(myDocument);
        });

        it("should call deleteDocument and not triggered onDocumentClick to setCurrentDocument, when onDocumentDelete prop is triggered", () => {
            const wrapper = shallow(<DocumentGallery {...baseProps} />);
            const documentDeleteHandler = wrapper.find("DocumentPreviewList").prop("onDocumentDelete") as any;

            documentDeleteHandler(myDocument.name, 0);

            expect(baseProps.deleteDocument).toBeCalledTimes(1);
            expect(baseProps.deleteDocument).toBeCalledWith(myDocument);
            expect(baseProps.setCurrentDocument).not.toBeCalled();
        });

        it("should setCurrentDocument to next document, when onDocumentDelete prop is triggered and current document is to delete", () => {
            const mockDocToDelete = mockDocuments[0];
            const mockNextDocument = mockDocuments[1];
            const props = { ...baseProps, documents: mockDocuments, currentDocument: mockDocToDelete };
            const wrapper = shallow(<DocumentGallery {...props} />);
            const documentDeleteHandler = wrapper.find("DocumentPreviewList").prop("onDocumentDelete") as any;

            documentDeleteHandler(mockDocToDelete.name, 0);

            expect(baseProps.deleteDocument).toBeCalledTimes(1);
            expect(baseProps.deleteDocument).toBeCalledWith(mockDocToDelete);
            expect(baseProps.setCurrentDocument).toBeCalledTimes(1);
            expect(baseProps.setCurrentDocument).toBeCalledWith(mockNextDocument);
        });

        it("should setCurrentDocument to previous document, when current document is the document to delete and the last document in documentGallery", () => {
            const mockMyDocuments = new Array(3).fill(null).map((_, index) => ({
                name: `mock-image-${index}`,
                type: "image/jpg",
                url: `mock-image-${index}.jpg`,
                states: {
                    loadingStatus: DocumentStatus.Loaded,
                },
            }));
            const lastDocumentIndex = mockMyDocuments.length - 1;
            const mockDocToDelete = mockMyDocuments[lastDocumentIndex];
            const mockPreviousDocument = mockMyDocuments[lastDocumentIndex - 1];
            const props = { ...baseProps, documents: mockMyDocuments, currentDocument: mockDocToDelete };
            const wrapper = shallow(<DocumentGallery {...props} />);
            const documentDeleteHandler = wrapper.find("DocumentPreviewList").prop("onDocumentDelete") as any;

            documentDeleteHandler(mockDocToDelete.name, mockMyDocuments.length - 1);

            expect(baseProps.deleteDocument).toBeCalledTimes(1);
            expect(baseProps.deleteDocument).toBeCalledWith(mockDocToDelete);
            expect(baseProps.setCurrentDocument).toBeCalledTimes(1);
            expect(baseProps.setCurrentDocument).toBeCalledWith(mockPreviousDocument);
        });

        it("should call deleteDocument and not triggered onDocumentClick to setCurrentDocument, when onDocumentDelete prop is triggered", () => {
            const props = {
                ...baseProps,
                documents: [mockDocument],
                onDocumentDeleted: jest.fn(),
            };

            const wrapper = shallow(<DocumentGallery {...props} />);
            wrapper.setState({
                documentToDeleted: { name: mockDocument.name, index: 0 },
                isDeleteModelOpen: true,
            });
            const documentDeleteInStorageHandler = wrapper.find("MessageModal").prop("onActionButtonClick") as any;

            documentDeleteInStorageHandler();

            expect(props.onDocumentDeleted).toBeCalledTimes(1);
            expect(props.onDocumentDeleted).toBeCalledWith(mockDocument);
            expect(wrapper.state("documentToDeleted")).toBe(undefined);
            expect(wrapper.state("isDeleteModelOpen")).toBe(false);
        });
    });
});
