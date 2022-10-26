import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Text } from "@fluentui/react";
import { DocumentPreviewList } from "./components/documentPreviewList";
import { setCurrentDocument, deleteDocument, clearCurrentDocument } from "store/documents/documents";
import { IDocument, DocumentStatus } from "store/documents/documentsTypes";
import { ApplicationState } from "store";
import MessageModal from "view/components/messageModal/messageModal";

import "./documentGallery.scss";

interface IDocumentGalleryProps {
    hideAddButton?: boolean;
    onDocumentDeleted?: (document: IDocument) => void;
    shouldConfirmDeleteDocument?: boolean;
}

type DocumentGalleryProps = ConnectedProps<typeof connector> & IDocumentGalleryProps;

interface IDocumentGalleryState {
    displayedDocuments: IDocument[];
    isDeleteModelOpen: boolean;
    documentToDeleted?: {
        name: string;
        index: number;
    };
}

export class DocumentGallery extends React.PureComponent<DocumentGalleryProps, IDocumentGalleryState> {
    constructor(props) {
        super(props);
        this.state = {
            displayedDocuments: props.documents,
            isDeleteModelOpen: false,
            documentToDeleted: undefined,
        };
    }

    public componentDidUpdate(prevProps) {
        const { documents, currentDocument, setCurrentDocument } = this.props;
        if (prevProps.documents !== documents) {
            this.setState({ displayedDocuments: documents });
        }
        if (
            documents &&
            documents[0] &&
            documents[0].states.loadingStatus === DocumentStatus.Loaded &&
            !currentDocument
        ) {
            setCurrentDocument(documents[0]);
        }
    }

    private handleDocumentClick = (name: string) => {
        const { documents, setCurrentDocument } = this.props;
        const selectedDoc = documents.find((doc) => doc.name === name);
        if (selectedDoc) {
            setCurrentDocument(selectedDoc);
        }
    };

    private setCurrentDocumentToNextOrPreviousDocument = (docIndexToDelete: number) => {
        const { documents, setCurrentDocument, clearCurrentDocument } = this.props;
        let nextDocument: IDocument;
        if (documents.length === 1) {
            clearCurrentDocument();
            return;
        }
        if (docIndexToDelete + 1 === documents.length) {
            nextDocument = documents[docIndexToDelete - 1];
        } else {
            nextDocument = documents[docIndexToDelete + 1];
        }
        setCurrentDocument(nextDocument);
    };

    private handleDocumentDelete = (docNameToDelete: string, index: number) => {
        const { documents, deleteDocument, currentDocument, onDocumentDeleted } = this.props;
        if (currentDocument?.name === docNameToDelete) {
            this.setCurrentDocumentToNextOrPreviousDocument(index);
        }
        const docToDelete = documents.find((doc) => doc.name === docNameToDelete);

        if (docToDelete) {
            deleteDocument(docToDelete);
            if (onDocumentDeleted) {
                onDocumentDeleted(docToDelete);
            }
        }
    };

    private handleConfirmDocumentDeletion = () => {
        const { name, index } = this.state.documentToDeleted!;
        this.handleDocumentDelete(name, index);
        this.setState({
            documentToDeleted: undefined,
            isDeleteModelOpen: false,
        });
    };

    private handleDocumentDeleteClicked = (name: string, index: number) => {
        this.setState({
            documentToDeleted: {
                name,
                index,
            },
            isDeleteModelOpen: true,
        });
    };

    public render() {
        const { currentDocument, shouldConfirmDeleteDocument } = this.props;
        const { displayedDocuments, isDeleteModelOpen, documentToDeleted } = this.state;
        return (
            <div className="document-gallery-container">
                <div className="document-gallery-list">
                    <DocumentPreviewList
                        currentDocument={currentDocument}
                        documents={displayedDocuments}
                        onDocumentClick={this.handleDocumentClick}
                        onDocumentDelete={
                            shouldConfirmDeleteDocument ? this.handleDocumentDeleteClicked : this.handleDocumentDelete
                        }
                    />
                </div>
                {isDeleteModelOpen && (
                    <MessageModal
                        isOpen={isDeleteModelOpen}
                        title="Delete Document"
                        body={
                            <Text variant="medium">
                                Labels and OCR results associated with this file will be deleted as well. Are you sure
                                to delete {documentToDeleted!.name},
                            </Text>
                        }
                        actionButtonText="Delete"
                        onActionButtonClick={this.handleConfirmDocumentDeletion}
                        onClose={() => this.setState({ isDeleteModelOpen: false })}
                    />
                )}
            </div>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    documents: state.documents.documents,
    currentDocument: state.documents.currentDocument,
});
const mapDispatch = {
    setCurrentDocument,
    deleteDocument,
    clearCurrentDocument,
};

const connector = connect(mapState, mapDispatch);

export default connector(DocumentGallery);
