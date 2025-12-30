import { Router } from "express";
import {
  createPaste,
  getPaste,
  viewPaste,
  healthCheck,
} from "../controllers/paste.controller.js";

const router = Router();

router.post("/pastes", createPaste);
router.get("/pastes/:id", getPaste);
router.get("/healthz", healthCheck);

export default router;
