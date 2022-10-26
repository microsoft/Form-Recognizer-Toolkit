import express from "express";
const router = express.Router();

import { getFile, uploadFile, deleteFile, listFiles } from "../controllers/localFileStorageController";

router.route("/:filename").get(getFile);
router.route("/:filename").put(uploadFile);
router.route("/:filename").delete(deleteFile);
router.route("/").get(listFiles);

export default router;
