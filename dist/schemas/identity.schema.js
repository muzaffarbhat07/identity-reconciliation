"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityRequestSchema = void 0;
const zod_1 = require("zod");
exports.identityRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        phoneNumber: zod_1.z.string().min(1, "Invalid phone number"),
    })
        .partial()
        .refine((data) => data.email || data.phoneNumber, {
        message: "Please provide either email or phoneNumber or both",
    }),
});
