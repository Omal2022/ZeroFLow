import express from "express";
import { users } from "../mockDb/database";
import { getPrompt } from "../utils/mockAi";
import { Language } from "../types/user";

const router = express.Router();

// Welcome message in selected language
export const getWelcomeMessage = (req: express.Request, res: express.Response): void => {
  const lang = (req.params.lang as Language) || "en";
  res.json({ message: getPrompt("welcome", lang) });
};

// Lookup user by NIN/BVN for auto-fill
export const lookupUser = (req: express.Request, res: express.Response): void => {
  const { idValue, lang } = req.body;
  const language: Language = lang || "en";

  if (!idValue) {
    res.status(400).json({ 
      message: getPrompt("clarification", language) 
    });
    return;
  }

  const user = users.find(u => u.identityValue === idValue);
  
  if (!user) {
    res.status(404).json({ 
      message: getPrompt("notFound", language) 
    });
    return;
  }

  res.json({
    message: getPrompt("prefillSuccess", language),
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userIdentity: user.userIdentity,
    },
  });
};