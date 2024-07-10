"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const appError_1 = require("./utils/appError");
const identity_routes_1 = __importDefault(require("./routes/identity.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Body parser middleware
app.use(express_1.default.json());
// Routes
app.use("/identity", identity_routes_1.default);
// Welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Identity Reconcillation API service!",
    });
});
// Unhandled routes
app.all("*", (req, res, next) => {
    next(new appError_1.AppError(404, `Can't ${req.method} ${req.originalUrl} on this server!`));
});
// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, status = "error", message = "Something went wrong." } = err;
    res.status(statusCode).json({
        status: status,
        message: message,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
