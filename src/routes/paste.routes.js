import { Router } from "express";
import { createPaste, getPaste } from "../controllers/paste.controller.js";

const router = Router();

router.post("/paste", createPaste);
router.get("/paste/:id", getPaste);

export default router;
