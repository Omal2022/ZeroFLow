import express, { Request, Response } from "express";

const router = express.Router();

router.post("/register", (req: Request, res: Response) => {
  const userData = req.body;

  // TODO: Add validation and save user to a database
  console.log("Received user data:", userData);

  // Respond with success and the user data
  res.status(201).json({ success: true, user: userData });
});

export default router;
