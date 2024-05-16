// src/routes.ts
import { Router, Request, Response } from "express";
import { promises as dns } from "dns";
import { SMTPClient } from "smtp-client";
import { performance } from "perf_hooks";
import { withCatcher } from "./middlewares/errorCatcher";

const router = Router();

router.get("/status", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

router.all(
    "/email/validate",
    withCatcher(async (req: Request, res: Response) => {
        const startExecution = performance.now();

        const email = [req.query.email, req.body.email]
            .filter(Boolean)
            .flat()[0];
        if (!email) throw new Error("Email is required");

        const [name, provider] = email.split("@");

        const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const matchSyntax = regex.test(email);

        const mxRecords = await dns.resolveMx(provider);

        const smptConnected = await new Promise(async (resolve) => {
            const smtp = new SMTPClient({
                host: mxRecords[0].exchange,
                port: 587,
            });

            try {
                await smtp.connect();
                await smtp.greet({ hostname: "example.com" });
                await smtp.mail({ from: "test@example.com" });
                await smtp.rcpt({ to: email });
                await smtp.quit();
                resolve(true);
            } catch (err) {
                console.error("SMTP connection error:", err);
                try {
                    await smtp.quit();
                } catch (quitErr) {
                    console.error("Error quitting SMTP connection:", quitErr);
                }
                resolve(false);
            }
        });

        const isValid =
            matchSyntax && mxRecords && mxRecords.length > 0 && smptConnected;

        const endExecution = performance.now();
        const executionTime =
            ((endExecution - startExecution) / 1000).toFixed(2) + "s";

        return res.json({
            executionTime,
            isValid,
            email,
            name,
            provider,
            mxRecords,
            matchSyntax,
            smptConnected,
        });
    })
);

export default router;
