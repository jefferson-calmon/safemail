// src/middleware/withCatcher.ts
import { Request, Response, NextFunction } from "express";

type Handler = (req: Request, res: Response) => Promise<any> | any;

export const withCatcher = (handler: Handler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res).catch((error: any) => {
            const message = error.message;

            console.error("Error in API route: ", error);
            res.status(400).json({ status: "error", error: message });
        });
    };
};
