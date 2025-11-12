import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";


import onboardingRoutes from "./routes/onboarding";


console.log("PORT from .env:", process.env.PORT);

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true
}));
app.use(bodyParser.json());

app.use("/onboarding", onboardingRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
