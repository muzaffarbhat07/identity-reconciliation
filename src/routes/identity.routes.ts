import { Express, Router } from "express";
import { identityController } from "../controllers/identity.controller";

const router = Router();

router.post("/", identityController);

export default router;