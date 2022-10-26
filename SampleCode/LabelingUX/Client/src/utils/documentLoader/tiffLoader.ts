import UTIF from "utif";
import { DocumentStatus, IDocument, IRawDocument } from "store/documents/documentsTypes";
import { loadCanvasToBlob, loadUrlToArrayBuffer } from "utils";
import { IDocumentLoader } from ".";
import { ICanvas } from "store/canvas/canvas";

export class TiffLoader implements IDocumentLoader {
    private doc: IRawDocument;
    private tiffs: any[] = [];
    constructor(doc: IRawDocument) {
        this.doc = doc;
    }

    public async setup(): Promise<void> {
        this.tiffs = this.parseTiffData(await loadUrlToArrayBuffer(this.doc.url));
    }

    public async loadDocumentMeta(): Promise<IDocument> {
        const firstPage = await this.loadTiffPage(this.tiffs, 1);
        return {
            ...this.doc,
            thumbnail: firstPage.url,
            numPages: this.tiffs.length,
            currentPage: 1,
            states: { loadingStatus: DocumentStatus.Loaded },
        };
    }

    public async loadDocumentPage(pageNumber: number): Promise<ICanvas> {
        const tiffImage = this.tiffs[pageNumber - 1];
        const canvas = this.renderTiffToCanvas(tiffImage);
        const blob = await loadCanvasToBlob(canvas);
        return { imageUrl: window.URL.createObjectURL(blob), width: canvas.width, height: canvas.height, angle: 0 };
    }

    private parseTiffData(tiffData: ArrayBuffer): any[] {
        const tiffImages = UTIF.decode(tiffData);
        for (const tiffImage of tiffImages) {
            UTIF.decodeImage(tiffData, tiffImage);
        }

        return tiffImages;
    }

    private renderTiffToCanvas(tiffImage): HTMLCanvasElement {
        const rgbData = new Uint8ClampedArray(UTIF.toRGBA8(tiffImage).buffer);
        const imageData = new ImageData(rgbData, tiffImage.width, tiffImage.height);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = tiffImage.height;
        canvas.width = tiffImage.width;
        context?.putImageData(imageData, 0, 0);

        return canvas;
    }

    private async loadTiffPage(tiffs: any[], page: number) {
        const tiffImage = tiffs[page - 1];
        const canvas = this.renderTiffToCanvas(tiffImage);
        const blob = await loadCanvasToBlob(canvas);
        return { url: window.URL.createObjectURL(blob), width: canvas.width, height: canvas.height };
    }
}
