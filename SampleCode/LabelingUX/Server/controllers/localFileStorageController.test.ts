import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { getLocalFilePath } from "./localFileStorageController";

assert.equal(getLocalFilePath("example.json"), resolve("Server/data/example.json"));
assert.throws(() => getLocalFilePath(join("..", "secret.txt")), /Invalid filename/);
assert.throws(() => getLocalFilePath(resolve("secret.txt")), /Invalid filename/);
