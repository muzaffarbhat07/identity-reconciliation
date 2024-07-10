"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identity_controller_1 = require("../controllers/identity.controller");
const validate_1 = require("../middlewares/validate");
const identity_schema_1 = require("../schemas/identity.schema");
const router = (0, express_1.Router)();
router.post("/", (0, validate_1.validateRequest)(identity_schema_1.identityRequestSchema), identity_controller_1.identityController);
exports.default = router;
