import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Stack, Text } from "@fluentui/react";
import Split from "react-split";
import MessageModal from "view/components/messageModal/messageModal";
import {
    addDocuments,
    deleteDocument,
    setDocumentAnalyzingStatus,
    setDocumentLabelingStatus,
} from "store/documents/documents";
import {
    setFields,
    setDefinitions,
    setLabelsByName,
    clearLabelError,
    deleteLabelByName,
} from "store/customModel/customModel";
import { setDocumentPrediction } from "store/predictions/predictions";
import { addLoadingOverlay, removeLoadingOverlayByName } from "store/portal/portal";
import { ApplicationState } from "store";
import { DocumentStatus, IDocument, IRawDocument } from "store/documents/documentsTypes";
import { constants } from "consts/constants";
import { getPixelWidthFromPercent } from "utils";
import { SplitPaneSizes } from "models";
import DocumentGallery from "view/containers/documentGallery/documentGallery";
import LabelPane from "view/containers/labelPane/labelPane";
import LabelCanvas from "view/containers/labelCanvas/labelCanvas";
import { StorageProvider, IStorageProviderError } from "providers/storageProvider";
import { getDocumentType, isSupportedFile } from "utils/documentLoader";
import urljoin from "url-join";
import { isLabelFieldWithCorrectFormat } from "utils/customModel/schemaValidation/fieldsValidator";

import "./customModelLabelPage.scss";

interface ICustomModelLabelPageState {
    isLoadingFields: boolean;
    isLoadingLabels: boolean;
    isInvalidFieldsFormatModalOpen: boolean;
    isTablePaneOpen: boolean;
    errorMessage: IStorageProviderError | undefined;
    splitPaneSizes: SplitPaneSizes;
    showEmptyFolderMessage: boolean;
}

const loadingOverlayName = "customModelLabelPage";

export class CustomModelLabelPage extends React.PureComponent<
    ConnectedProps<typeof connector>,
    ICustomModelLabelPageState
> {
    private storageProvider: StorageProvider;
    private mounted: boolean = true;

    constructor(props) {
        super(props);
        this.storageProvider = new StorageProvider();
        this.state = {
            isLoadingFields: true,
            isLoadingLabels: true,
            isInvalidFieldsFormatModalOpen: false,
            isTablePaneOpen: false,
            errorMessage: undefined,
            splitPaneSizes: constants.defaultSplitPaneSizes,
            showEmptyFolderMessage: false,
        };
    }

    public componentDidMount() {
        this.initLabelPage();
    }

    public componentDidUpdate(prevProps) {
        const { currentDocument, labels, predictions, setDocumentLabelingStatus, removeLoadingOverlayByName } =
            this.props;

        const { isLoadingLabels } = this.state;

        if (
            currentDocument &&
            prevProps.currentDocument?.name !== currentDocument.name &&
            !predictions[currentDocument.name]
        ) {
            if (currentDocument.states.analyzingStatus !== DocumentStatus.Analyzing) {
                this.getAndSetOcr();
            }
        }

        if (
            currentDocument &&
            prevProps.currentDocument?.name !== currentDocument.name &&
            !labels[currentDocument.name]
        ) {
            this.getAndSetLabels();
        }

        if (
            currentDocument &&
            prevProps.labels[currentDocument.name]?.length === 0 &&
            labels[currentDocument.name]?.length !== 0
        ) {
            // Set labeling status to labeled when labels are added.
            setDocumentLabelingStatus({ name: currentDocument.name, status: DocumentStatus.Labeled });
        }

        if (
            currentDocument &&
            prevProps.labels[currentDocument.name]?.length !== 0 &&
            labels[currentDocument.name]?.length === 0
        ) {
            // Set labeling status to undefined when labels is empty.
            setDocumentLabelingStatus({ name: currentDocument.name, status: undefined });
        }

        if (currentDocument && !isLoadingLabels) {
            // Remove current loading overlay  when the first document is loaded with labels.
            removeLoadingOverlayByName(loadingOverlayName);
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.props.removeLoadingOverlayByName(loadingOverlayName);
    }

    private initLabelPage = async () => {
        const { addLoadingOverlay } = this.props;
        addLoadingOverlay({
            name: loadingOverlayName,
            message: "Loading documents...",
        });
        await this.getAndSetDocuments();
        await this.getAndSetFields();
        this.props.removeLoadingOverlayByName(loadingOverlayName);
    };

    private composeFileUrl = (filePath: string) => {
        return urljoin(`${process.env.REACT_APP_SERVER_SITE_URL}/files/${filePath}`);
    };

    private makeRawDocument = (filePath: string): IRawDocument => {
        const path = encodeURIComponent(filePath);
        return {
            name: filePath.split("/").pop()!,
            type: getDocumentType(filePath),
            url: this.composeFileUrl(path),
        };
    };

    private getAndSetDocuments = async () => {
        try {
            const { addDocuments, setDocumentAnalyzingStatus, setDocumentLabelingStatus } = this.props;
            const filePaths = await this.storageProvider.listFilesInFolder();
            const documents: IRawDocument[] = filePaths.filter(isSupportedFile).map(this.makeRawDocument);
            const showEmptyFolderMessage = documents.length === 0;
            if (!showEmptyFolderMessage) {
                const chunkSize = 3;
                for (let i = 0, j = documents.length; i < j; i += chunkSize) {
                    const documentChunk = documents.slice(i, i + chunkSize);
                    if (this.mounted) {
                        await addDocuments(documentChunk);
                        documentChunk.forEach((document) => {
                            const { name } = document;
                            const ocrFileName = `${name}${constants.ocrFileExtension}`;
                            const labelFileName = `${name}${constants.labelFileExtension}`;

                            if (filePaths.includes(ocrFileName)) {
                                setDocumentAnalyzingStatus({ name, status: DocumentStatus.Analyzed });
                            }
                            if (filePaths.includes(labelFileName)) {
                                setDocumentLabelingStatus({ name, status: DocumentStatus.Labeled });
                            }
                        });
                    }
                }
            }
            this.setState({
                showEmptyFolderMessage,
            });
        } catch (err) {
            this.setState({ errorMessage: err as IStorageProviderError });
        }
    };

    private getAndSetFields = async () => {
        this.setState({ isLoadingFields: true });
        try {
            const { setFields, setDefinitions } = this.props;
            const rawFields = await this.storageProvider.readText(constants.fieldsFile, true);

            if (rawFields) {
                const parsedFields = JSON.parse(rawFields);
                if (!isLabelFieldWithCorrectFormat(parsedFields)) {
                    this.setState({ isInvalidFieldsFormatModalOpen: true });
                } else {
                    const { fields, definitions } = parsedFields;
                    setDefinitions(definitions);
                    setFields(fields);
                }
            }
        } catch (err: any) {
            this.setState({ errorMessage: err as IStorageProviderError });
        } finally {
            this.setState({ isLoadingFields: false });
        }
    };

    private getAndSetLabels = async () => {
        this.setState({ isLoadingLabels: true });
        try {
            const { currentDocument, setLabelsByName } = this.props;
            const labels = await this.storageProvider.readText(
                `${currentDocument?.name}${constants.labelFileExtension}`,
                true
            );
            if (labels) {
                setLabelsByName({ name: currentDocument!.name, labels: JSON.parse(labels).labels });
            } else {
                setLabelsByName({ name: currentDocument!.name, labels: [] });
            }
        } catch (err) {
            this.setState({ errorMessage: err as IStorageProviderError });
        } finally {
            this.setState({ isLoadingLabels: false });
        }
    };

    private getAndSetOcr = async () => {
        const { currentDocument, setDocumentPrediction, setDocumentAnalyzingStatus } = this.props;
        if (!currentDocument) {
            return;
        }

        const { name } = currentDocument;
        const ocrFilePath = `${name}${constants.ocrFileExtension}`;

        try {
            if (await this.storageProvider.isFileExists(ocrFilePath, true)) {
                // If OCR file exists, we fetch it from storage.
                const layoutResponse = JSON.parse((await this.storageProvider.readText(ocrFilePath, true)) || "");
                setDocumentPrediction({ name, analyzeResponse: layoutResponse });
            }

            setDocumentAnalyzingStatus({ name, status: DocumentStatus.Analyzed });
        } catch (err: any) {
            this.setState({ errorMessage: err as IStorageProviderError });
        }
    };

    private handleSplitPaneSizesChange = (sizes: number[]) => {
        const { splitPaneSizes } = this.state;
        const { isTablePaneOpen } = this.state;
        if (isTablePaneOpen) {
            this.setState({
                splitPaneSizes: { ...splitPaneSizes, labelTableSplitPaneSize: sizes },
            });
        } else {
            this.setState({
                splitPaneSizes: { ...splitPaneSizes, labelSplitPaneSize: sizes },
            });
        }
    };

    private deleteDocumentInStorage = async (doc: IDocument) => {
        const { name } = doc;
        const { deleteLabelByName } = this.props;
        const ocrFileName = `${name}${constants.ocrFileExtension}`;
        const labelFileName = `${name}${constants.labelFileExtension}`;

        deleteLabelByName(doc.name);
        try {
            await this.storageProvider.deleteFile(name);
            await this.storageProvider.deleteFile(ocrFileName, true);
            await this.storageProvider.deleteFile(labelFileName, true);
        } catch (err) {
            this.setState({ errorMessage: err as IStorageProviderError });
        }
    };

    private handleDeleteLabelFieldsJsonFile = async () => {
        try {
            await this.storageProvider.deleteFile(constants.fieldsFile, true);
        } catch (err) {
            this.setState({ errorMessage: err as IStorageProviderError });
        } finally {
            this.setState({ isInvalidFieldsFormatModalOpen: false });
        }
    };

    private handleCloseIncorrectLabelFieldsFormatModal = () => {
        this.setState({ isInvalidFieldsFormatModalOpen: false });
    };

    private handelSetIsTablePanelOpen = (state: boolean) => {
        this.setState({ isTablePaneOpen: state });
    };

    private handleCloseStorageErrorModal = () => {
        this.setState({ errorMessage: undefined });
    };

    render() {
        const { clearLabelError, labelError } = this.props;
        const {
            isInvalidFieldsFormatModalOpen,
            isTablePaneOpen,
            splitPaneSizes,
            errorMessage,
            showEmptyFolderMessage,
        } = this.state;
        const splitSize = isTablePaneOpen ? splitPaneSizes.labelTableSplitPaneSize : splitPaneSizes.labelSplitPaneSize;
        return (
            <Stack className="custom-doc-label-page" grow={1}>
                <Stack className="label-page-header" horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text tabIndex={0} aria-label="Label Page" className="page-title" as="h2">
                        Label Page
                    </Text>
                </Stack>
                <Stack className="label-page-main" horizontal grow={1}>
                    <Stack className="label-page-gallery">
                        <DocumentGallery
                            hideAddButton={false}
                            onDocumentDeleted={this.deleteDocumentInStorage}
                            shouldConfirmDeleteDocument={true}
                        />
                    </Stack>
                    <Split
                        className="react-split-container"
                        sizes={splitSize}
                        maxSize={[Infinity, getPixelWidthFromPercent(50)]}
                        minSize={[getPixelWidthFromPercent(30), getPixelWidthFromPercent(15)]}
                        gutterSize={8}
                        onDragEnd={this.handleSplitPaneSizesChange}
                    >
                        <Stack className="label-page-canvas" grow={1}>
                            <LabelCanvas />
                        </Stack>
                        <Stack className="label-page-pane">
                            <LabelPane
                                isTablePaneOpen={isTablePaneOpen}
                                setIsTablePaneOpen={this.handelSetIsTablePanelOpen}
                            />
                        </Stack>
                    </Split>
                </Stack>
                {labelError !== null && (
                    <MessageModal
                        isOpen={true}
                        title={labelError.name}
                        body={<Text variant="medium">{labelError.message}</Text>}
                        onClose={() => clearLabelError()}
                        rejectButtonText="Close"
                    />
                )}
                <link as="image" href={constants.dynamicTableImgSrc} />
                <link as="image" href={constants.fixedTableImgSrc} />
                <MessageModal
                    isOpen={isInvalidFieldsFormatModalOpen}
                    title="Incorrect fields format"
                    body={
                        <Text variant="medium">
                            The fields.json file of this project does not align with the expected schema. Please correct
                            the file and re-enter the project, or delete fields.json file and create fields again.
                        </Text>
                    }
                    onClose={this.handleCloseIncorrectLabelFieldsFormatModal}
                    actionButtonText="Delete fields.json file"
                    onActionButtonClick={this.handleDeleteLabelFieldsJsonFile}
                />
                {errorMessage !== undefined && (
                    <MessageModal
                        isOpen={true}
                        title={errorMessage.code}
                        body={<Text variant="medium">{errorMessage.message}</Text>}
                        rejectButtonText="Close"
                        onClose={this.handleCloseStorageErrorModal}
                    />
                )}
                {showEmptyFolderMessage && (
                    <MessageModal
                        isOpen={true}
                        title="No document found in data folder"
                        body={
                            <Text variant="medium">
                                Please provide documents and their corresponding OCR file in <b>Server/data</b> to start
                                labeling.
                            </Text>
                        }
                        onClose={() =>
                            this.setState({
                                showEmptyFolderMessage: false,
                            })
                        }
                        rejectButtonText="Close"
                    />
                )}
            </Stack>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    documents: state.documents.documents,
    currentDocument: state.documents.currentDocument,
    labels: state.customModel.labels,
    labelError: state.customModel.labelError,
    location: state.router.location,
    predictions: state.predictions.predictions,
});
const mapDispatch = {
    addDocuments,
    deleteDocument,
    setDocumentAnalyzingStatus,
    setDocumentLabelingStatus,
    setDefinitions,
    setFields,
    setLabelsByName,
    clearLabelError,
    setDocumentPrediction,
    addLoadingOverlay,
    removeLoadingOverlayByName,
    deleteLabelByName,
};

const connector = connect(mapState, mapDispatch);

export default connector(CustomModelLabelPage);
