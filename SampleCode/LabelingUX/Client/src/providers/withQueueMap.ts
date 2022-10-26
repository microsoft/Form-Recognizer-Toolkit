import { Args } from "utils/queueMap/queue";
import QueueMap from "utils/queueMap/queueMap";
import { IStorageProvider } from "./storageProvider";

export function withQueueMap<T extends { new (...args: Args): IStorageProvider }>(constructor: T) {
    return class extends constructor {
        // Use queue for ensuring files are written in expected order.
        private queueMap = new QueueMap();
        writeText = async (filePath: string, contents: string): Promise<void> => {
            const parentWriteText = super.writeText.bind(this);
            this.queueMap.enque(filePath, [filePath, contents]);
            this.queueMap.on(filePath, parentWriteText);
            return;
        };

        writeBinary = async (filePath: string, contents: ArrayBuffer): Promise<void> => {
            const parentWriteBinary = super.writeBinary.bind(this);
            this.queueMap.enque(filePath, [filePath, contents]);
            this.queueMap.on(filePath, parentWriteBinary);
            return;
        };

        readText = async (filePath: string, ignoreNotFound?: boolean): Promise<string | undefined> => {
            const parentReadText = super.readText.bind(this);
            const args = this.queueMap.getLast(filePath);
            if (args.length >= 2) {
                const contents = args[1];
                return Promise.resolve(contents);
            }
            return parentReadText(filePath, ignoreNotFound);
        };

        readBinary = async (filePath: string, ignoreNotFound?: boolean): Promise<Buffer | undefined> => {
            const parentReadBinary = super.readBinary.bind(this);
            const args = this.queueMap.getLast(filePath);
            if (args.length >= 2) {
                const contents = args[1];
                return Promise.resolve(contents);
            }
            return parentReadBinary(filePath, ignoreNotFound);
        };

        deleteFile = async (filePath: string, ignoreNotFound?: boolean) => {
            const parentDeleteFile = super.deleteFile.bind(this);
            await this.queueMap.callAfterLoop(filePath, parentDeleteFile, [filePath, ignoreNotFound]);
            return;
        };
    };
}
