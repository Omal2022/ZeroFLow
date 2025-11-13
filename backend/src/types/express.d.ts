import express from "express";

declare global {
  namespace Express {
    interface Request {
      // extend if you add user object or session data
    }
  }
}
