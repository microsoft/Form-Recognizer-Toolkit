import { ICanvas } from "store/canvas/canvas";
import { DocumentStatus, IDocument, IRawDocument } from "store/documents/documentsTypes";
import { IDocumentLoader } from ".";

export class ImageLoader implements IDocumentLoader {
    private document: IRawDocument;
    constructor(document: IRawDocument) {
        this.document = document;
    }

    public async setup(): Promise<void> {
        return;
    }

    public async loadDocumentMeta(): Promise<IDocument> {
        return {
            ...this.document,
            thumbnail: this.document.url,
            numPages: 1,
            currentPage: 1,
            states: { loadingStatus: DocumentStatus.Loaded },
        };
    }

    public async loadDocumentPage(pageNumber: number): Promise<ICanvas> {
        const { width, height } = await this.readImageSize(this.document.url);
        return {
            imageUrl: this.document.url,
            width,
            height,
            angle: 0,
        };
    }

    private readImageSize(url: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const image = document.createElement("img");
            image.onload = () => {
                resolve({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                });
            };
            image.onerror = reject;
            image.src = url;
        });
    }
}
