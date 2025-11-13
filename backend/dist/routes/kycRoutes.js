"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kycController_1 = require("../controllers/kycController");
const router = express_1.default.Router();
// Identity verification endpoints
router.post("/verify/nin", kycController_1.verifyNIN);
router.post("/verify/bvn", kycController_1.verifyBVN);
router.post("/verify/identity", kycController_1.verifyIdentity);
// Location verification
router.post("/verify/location", kycController_1.verifyLocation);
// Account creation
router.post("/create-account", kycController_1.createAccount);
// Trust score calculation
router.post("/trust-score", kycController_1.getTrustScore);
exports.default = router;
