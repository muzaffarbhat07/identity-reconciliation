"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
            });
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return next(new appError_1.AppError(400, err.errors.map((error) => error.message).join(", ")));
            }
            next(err);
        }
    };
};
exports.validateRequest = validateRequest;
