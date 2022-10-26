import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import {
    initialState,
    reducer,
    addLoadingOverlay,
    removeLoadingOverlayByName,
} from "store/portal/portal";
import { mockLoadingOverlays } from "utils/test/mockData";

describe("portal", () => {
    interface TestActionData {
        action: ActionCreatorWithPayload<any, string>;
        payload: any;
        savedState: string;
        expectedValue: any;
    }

    const testSetStateActions: [string, TestActionData][] = [
        [
            "addLoadingOverlay",
            {
                action: addLoadingOverlay,
                savedState: "loadingOverlays",
                payload: mockLoadingOverlays[0],
                expectedValue: [mockLoadingOverlays[0]],
            },
        ],
        [
            "removeLoadingOverlayByName",
            {
                action: removeLoadingOverlayByName,
                savedState: "loadingOverlays",
                payload: mockLoadingOverlays[0].name,
                expectedValue: [],
            },
        ],
    ];

    describe("actions", () => {
        it.each(testSetStateActions)("should create %s action", (name, { action, payload }: TestActionData) => {
            const expectedAction = { type: action.type, payload };
            expect(action(payload)).toEqual(expectedAction);
        });
    });

    describe("reducer", () => {
        it("should handle the initial state", () => {
            expect(reducer(undefined, {} as any)).toEqual(initialState);
        });

        it.each(testSetStateActions)("should handle %s", (_, { action, payload, savedState, expectedValue }) => {
            const state = reducer(initialState, { type: action.type, payload });
            expect(state[savedState]).toEqual(expectedValue);
        });
    });
});
