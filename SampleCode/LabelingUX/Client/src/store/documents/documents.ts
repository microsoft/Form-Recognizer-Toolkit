import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { resetPredictions } from "store/predictions/predictions";
import { DocumentLoaderFactory, IDocumentLoader } from "utils/documentLoader";
import { DocumentStatus, IDocument, IRawDocument } from "./documentsTypes";

export type DocumentsState = { documents: IDocument[]; currentDocument: IDocument | null };

export const initialState: DocumentsState = { documents: [], currentDocument: null };

export const addDocuments = createAsyncThunk("documents/addDocuments", async (docsToAdd: IRawDocument[]) => {
    return Promise.all(docsToAdd.map(async (doc) => (await getLoader(doc)).loadDocumentMeta()));
});

export const setCurrentDocument = createAsyncThunk("documents/setCurrentDocument", async (document: IDocument) => {
    const loader = await getLoader(document);
    const documentPage = await loader.loadDocumentPage(document.currentPage);
    return { document, documentPage };
});

export const setCurrentPage = createAsyncThunk("documents/setCurrentPage", async (pageNumber: number, thunkApi) => {
    const { documents: state } = thunkApi.getState() as any;
    const loader = await getLoader(state.currentDocument);
    const documentPage = await loader.loadDocumentPage(pageNumber);
    return { pageNumber, documentPage };
});

const documentLoaders = new Map<string, IDocumentLoader>();

const getLoader = async (document: IRawDocument): Promise<IDocumentLoader> => {
    let loader = documentLoaders.get(document.url);
    if (!loader) {
        loader = await DocumentLoaderFactory.makeLoader(document);
        documentLoaders.set(document.url, loader);
    }

    return loader;
};

const documentsSlice = createSlice({
    name: "documents",
    initialState,
    reducers: {
        deleteDocument(state, action) {
            const docNameToDelete = action.payload.name;
            state.documents = state.documents.filter((document) => document.name !== docNameToDelete);
            documentLoaders.delete(action.payload.url);
        },
        setDocumentAnalyzingStatus(state, action) {
            const { name, status } = action.payload;
            const document = state.documents.find((document) => document.name === name);
            if (document) {
                document.states.analyzingStatus = status;
            }
            if (state.currentDocument?.name === name) {
                state.currentDocument!.states.analyzingStatus = status;
            }
        },
        setDocumentLabelingStatus(state, action) {
            const { name, status } = action.payload;
            const document = state.documents.find((document) => document.name === name);
            if (document) {
                document.states.labelingStatus = status;
            }
            if (state.currentDocument?.name === name) {
                state.currentDocument!.states.labelingStatus = status;
            }
        },
        clearCurrentDocument(state) {
            state.currentDocument = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(resetPredictions, (state) => {
                state.documents.forEach((document) => {
                    document.states = { ...document.states, analyzingStatus: undefined };
                });
                if (state.currentDocument) {
                    state.currentDocument.states = { ...state.currentDocument.states, analyzingStatus: undefined };
                }
            })
            .addCase(addDocuments.pending, (state, action) => {
                const docs = action.meta.arg;
                docs.forEach((doc) => {
                    state.documents.push({
                        ...doc,
                        thumbnail: "",
                        numPages: 0,
                        currentPage: 0,
                        states: { loadingStatus: DocumentStatus.Loading },
                    });
                });
            })
            .addCase(setCurrentDocument.pending, (state, action) => {
                const document = action.meta.arg;
                const selectedDoc = state.documents.find((doc) => doc.name === document.name);
                if (selectedDoc) {
                    selectedDoc.states.loadingStatus = DocumentStatus.Loading;
                }
            })
            .addCase(setCurrentDocument.fulfilled, (state, action) => {
                const document: IDocument = {
                    ...action.payload.document,
                    states: {
                        ...action.payload.document.states,
                        loadingStatus: DocumentStatus.Loaded,
                    },
                };
                const selectedDoc = state.documents.find((doc) => doc.name === document.name);
                if (selectedDoc) {
                    selectedDoc.states.loadingStatus = DocumentStatus.Loaded;
                }
                state.currentDocument = document;
            })
            .addCase(setCurrentPage.fulfilled, (state, action) => {
                const { pageNumber } = action.payload;
                const document = state.documents.find((doc) => doc.name === state.currentDocument?.name);
                if (document) {
                    document.currentPage = pageNumber;
                }
                if (state.currentDocument) {
                    state.currentDocument.currentPage = pageNumber;
                }
            })
            .addCase(addDocuments.fulfilled, (state, action) => {
                const addedDocs = action.payload;
                const { documents } = state;
                addedDocs.forEach((doc) => {
                    const iDoc = documents.findIndex((d) => d.name === doc.name);
                    if (iDoc >= 0) {
                        documents[iDoc] = {
                            ...doc,
                            states: { ...documents[iDoc].states, loadingStatus: DocumentStatus.Loaded },
                        };
                    }
                });
            });
    },
});

export const { deleteDocument, setDocumentAnalyzingStatus, setDocumentLabelingStatus, clearCurrentDocument } =
    documentsSlice.actions;

export const reducer = documentsSlice.reducer;
