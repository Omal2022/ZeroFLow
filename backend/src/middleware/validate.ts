import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * validate(schema) middleware for zod schemas
 */
export default function validate(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body (common) - allows using query in other handlers when needed
      schema.parse(req.body);
      return next();
    } catch (err: any) {
      const issues = err?.issues ?? [{ message: err.message }];
      return res.status(400).json({ success: false, message: "Validation error", details: issues });
    }
  };
}
