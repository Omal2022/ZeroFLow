"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const onboardingRoute_1 = __importDefault(require("./routes/onboardingRoute"));
const kycRoutes_1 = __importDefault(require("./routes/kycRoutes"));
console.log("PORT from .env:", process.env.PORT);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true
}));
app.use(body_parser_1.default.json());
app.use("/onboarding", onboardingRoute_1.default);
app.use("/kyc", kycRoutes_1.default);
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
