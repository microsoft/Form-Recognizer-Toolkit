import express from "express";
import { getServerConnection } from "../controllers";
const router = express.Router();

router.route("/").get(getServerConnection);

export default router;
