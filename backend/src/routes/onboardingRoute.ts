import express from "express";
import { getWelcomeMessage, lookupUser } from "../controllers/onboarding";

const router = express.Router();

// Welcome message in selected language
router.get("/welcome/:lang?", getWelcomeMessage);

// Lookup user by NIN/BVN for auto-fill
router.post("/lookup", lookupUser);

export default router;