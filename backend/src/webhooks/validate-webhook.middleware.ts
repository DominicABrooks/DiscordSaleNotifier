import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import validator from "validator";

@Injectable()
export class ValidateWebhookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { webhook } = req.body;

    if (!validator.isURL(webhook, { require_protocol: true })) {
      return res.status(400).json({
        error: "Input Webhook is not URL",
      });
    }

    if (!validator.matches(webhook, /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/)) {
      return res.status(400).json({
        error: "Input Webhook is not a Discord Webhook URL",
      });
    }

    next();
  }
}
