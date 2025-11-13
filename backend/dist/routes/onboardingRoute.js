"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onboarding_1 = require("../controllers/onboarding");
const router = express_1.default.Router();
// Welcome message in selected language
router.get("/welcome/:lang", onboarding_1.getWelcomeMessage);
// Lookup user by NIN/BVN for auto-fill
router.post("/lookup", onboarding_1.lookupUser);
exports.default = router;
