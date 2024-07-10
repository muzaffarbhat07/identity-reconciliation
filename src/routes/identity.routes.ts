import { Router } from "express";
import { identityController } from "../controllers/identity.controller";
import { validateRequest } from "../middlewares/validate";
import { identityRequestSchema } from "../schemas/identity.schema";

const router = Router();

router.post("/", validateRequest(identityRequestSchema), identityController);

export default router;