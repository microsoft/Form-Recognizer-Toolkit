import { delay } from "utils";
import QueueMap from "./queueMap";

describe("QueueMap", () => {
    const queueId = "queue-id";
    const a = ["a", 1];
    const b = ["b", 2];
    const c = ["c", 3];
    const d = ["d", 4];

    it("dequeueUntilLast", () => {
        const queueMap = new QueueMap();
        queueMap.enque(queueId, a);
        queueMap.enque(queueId, b);
        queueMap.dequeueUntilLast(queueId);
        const { queue } = queueMap.getQueueById(queueId);
        expect(queue).toEqual([b]);
    });

    it("call enque while looping items in the queue", async () => {
        const queueMap = new QueueMap();
        const mockWrite = jest.fn();
        const sleepThenReturn = (ms) => async (...params) => {
            await mockWrite(...params);
            await delay(ms);
        };
        const expected = [b, d];
        queueMap.enque(queueId, a);
        queueMap.enque(queueId, b);
        queueMap.on(queueId, sleepThenReturn(1000), (params) => params);
        queueMap.enque(queueId, c);
        queueMap.enque(queueId, d);
        await delay(2000);
        expect(mockWrite).toBeCalledTimes(2);
        expect([mockWrite.mock.calls[0], mockWrite.mock.calls[1]]).toEqual(expected);
    });

    it("prevent call on twice.", async () => {
        const queueMap = new QueueMap();
        const mockWrite = jest.fn();
        const sleepThenReturn = (ms) => async (...params) => {
            await mockWrite(...params);
            await delay(ms);
        };
        const expected = [b, d];
        queueMap.enque(queueId, a);
        queueMap.enque(queueId, b);
        queueMap.on(queueId, sleepThenReturn(1000), (params) => params);
        queueMap.enque(queueId, c);
        queueMap.on(queueId, sleepThenReturn(1000), (params) => params);
        queueMap.enque(queueId, d);
        await delay(2000);
        expect(mockWrite.mock.calls.length).toBe(2);
        expect([mockWrite.mock.calls[0], mockWrite.mock.calls[1]]).toEqual(expected);
    });

    it("read last element.", async () => {
        const queueMap = new QueueMap();
        const f = jest.fn();
        const sleepThenReturn = (ms) => async (...params) => {
            await f(...params);
            await delay(ms);
        };
        queueMap.enque(queueId, a);
        queueMap.enque(queueId, b);
        queueMap.on(queueId, sleepThenReturn(1000), (params) => params);
        queueMap.enque(queueId, c);
        queueMap.enque(queueId, d);
        expect(queueMap.getLast(queueId)).toEqual(d);
    });

    it("delete after write finished", async () => {
        const mockCallback = jest.fn();
        const mockWrite = jest.fn();
        const queueMap = new QueueMap();
        const mockAsync = (ms) => async (...params) => {
            await mockWrite(...params);
            await delay(ms);
        };
        queueMap.enque(queueId, a);
        queueMap.enque(queueId, b);
        queueMap.on(queueId, mockAsync(1000));
        queueMap.enque(queueId, c);
        queueMap.enque(queueId, d);
        const args = [a, b];
        queueMap.callAfterLoop(queueId, mockCallback, args);
        await delay(3000);
        expect(mockCallback.mock.calls.length).toBe(1);
        expect(mockCallback.mock.calls[0]).toEqual(args);
    });

    it("can call callback finished", async () => {
        const mockCallback = jest.fn();
        const queueMap = new QueueMap();
        queueMap.callAfterLoop(queueId, mockCallback);
        expect(mockCallback.mock.calls.length).toBe(1);
    });
});
