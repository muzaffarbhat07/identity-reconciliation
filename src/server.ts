import express, { Express, NextFunction, Request, Response } from "express";
import "dotenv/config";
import { AppError } from "./utils/appError";
import identityRoutes from "./routes/identity.routes";

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Body parser middleware
app.use(express.json());

// Routes
app.use("/identity", identityRoutes);

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Identity Reconcillation API service!",
  });
});

// Unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Can't ${req.method} ${req.originalUrl} on this server!`));
});

// Global error handler
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, status = "error", message = "Something went wrong." } = err;

  res.status(statusCode ).json({
    status: status,
    message: message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});