import { LoadingOverlayWeights } from "consts/constants";
import { SplitPaneSizes } from "models";
import { DocumentStatus, IDocument, IRawDocument } from "store/documents/documentsTypes";
import { DocumentMimeType } from "utils/documentLoader";

export const mockLoadingOverlays = [
    {
        name: "loading-overlay-default",
        message: "Loading...",
        weight: LoadingOverlayWeights.Default,
    },
    {
        name: "loading-overlay-heavy",
        message: "Loading...",
        weight: LoadingOverlayWeights.Heavy,
    },
];

export const mockDocument: IDocument = {
    name: "test.pdf",
    type: DocumentMimeType.PDF,
    url: "<url>",
    thumbnail: "",
    numPages: 10,
    currentPage: 1,
    states: { loadingStatus: DocumentStatus.Loaded },
};

export const mockDocuments: IDocument[] = [mockDocument].concat(
    new Array(3).fill(null).map((item, index) => ({
        name: `mockDoc-${index}.pdf`,
        type: "pdf",
        url: `<url${index}>`,
        thumbnail: "",
        numPages: index,
        currentPage: 1,
        states: { loadingStatus: DocumentStatus.Loaded },
    }))
);

export const mockLabeledDocuments: IDocument[] = new Array(5).fill(null).map((_, index) => ({
    name: `mockLabelDoc-${index}.pdf`,
    type: "pdf",
    url: `<url${index}>`,
    thumbnail: "",
    numPages: index,
    currentPage: 1,
    states: {
        loadingStatus: DocumentStatus.Loaded,
        analyzingStatus: DocumentStatus.Analyzed,
        labelingStatus: DocumentStatus.Labeled,
    },
}));

export const mockRawDocument: IRawDocument = {
    name: "test.jpg",
    type: "jpg",
    url: "<jpg-url>",
};

export const mockSplitPaneSizes: SplitPaneSizes = {
    analyzeSplitPaneSize: [70, 30],
    labelSplitPaneSize: [80, 20],
    labelTableSplitPaneSize: [65, 35],
};
