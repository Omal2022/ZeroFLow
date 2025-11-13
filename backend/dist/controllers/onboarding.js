"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupUser = exports.getWelcomeMessage = void 0;
const database_1 = require("../mockDb/database");
const mockAi_1 = require("../utils/mockAi");
// const router = express.Router();
// Welcome message in selected language
const getWelcomeMessage = (req, res) => {
    const lang = req.params.lang || "en";
    res.json({ message: (0, mockAi_1.getPrompt)("welcome", lang) });
};
exports.getWelcomeMessage = getWelcomeMessage;
// Lookup user by NIN/BVN for auto-fill
const lookupUser = (req, res) => {
    const { idValue, lang } = req.body;
    const language = lang || "en";
    if (!idValue) {
        res.status(400).json({
            message: (0, mockAi_1.getPrompt)("clarification", language)
        });
        return;
    }
    const user = database_1.users.find(u => u.identityValue === idValue);
    if (!user) {
        res.status(404).json({
            message: (0, mockAi_1.getPrompt)("notFound", language)
        });
        return;
    }
    res.json({
        message: (0, mockAi_1.getPrompt)("prefillSuccess", language),
        data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            userIdentity: user.userIdentity,
        },
    });
};
exports.lookupUser = lookupUser;
