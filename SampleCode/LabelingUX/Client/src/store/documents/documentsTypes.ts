export enum DocumentStatus {
    Loading = "Loading",
    Loaded = "Loaded",
    Analyzing = "Analyzing",
    Analyzed = "Analyzed",
    AnalyzeFailed = "AnalyzeFailed",
    Labeled = "Labeled",
}

export interface IDocumentStates {
    loadingStatus: DocumentStatus.Loaded | DocumentStatus.Loading;
    analyzingStatus?: DocumentStatus.Analyzed | DocumentStatus.Analyzing | DocumentStatus.AnalyzeFailed;
    labelingStatus?: DocumentStatus.Labeled;
}

export interface IRawDocument {
    name: string;
    type: string;
    url: string;
}

export interface IDocument extends IRawDocument {
    thumbnail: string;
    numPages: number;
    currentPage: number;
    states: IDocumentStates;
    expirationTime?: number;
}
