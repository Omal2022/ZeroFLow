import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import onboardingRoutes from "./routes/onboarding";

dotenv.config();
console.log("PORT from .env:", process.env.PORT);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/onboarding", onboardingRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
