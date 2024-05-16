// src/routes.ts
import { Router, Request, Response } from "express";

import * as EmailController from "./controllers/EmailController";
import { withCatcher } from "./middlewares/errorCatcher";

const router = Router();

router.get("/status", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

router.all("/email/validate", withCatcher(EmailController.validate));

export default router;
