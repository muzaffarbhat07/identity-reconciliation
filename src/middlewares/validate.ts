import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/appError";

export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
      });

      next();
    } catch(err) {
      if (err instanceof ZodError) {
        return next(new AppError(400, err.errors.map((error) => error.message).join(", ")));
      }
      next(err);
    }
  };
};