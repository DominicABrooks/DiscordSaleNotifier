import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

export function validateWebhookURL(req: Request, res: Response, next: NextFunction) {
  const { webhook } = req.body;

        matches: 
  // Validate webhook URL
  if (!validator.isURL(webhook, { require_protocol: true,  })) {
    return res.status(400).json({
      error: 'Input Webhook is not URL'
    });
  }

  // Validate Discord webhook URL
  if (!validator.matches(webhook, /^https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/\S+$/)) {
    return res.status(400).json({
      error: 'Input Webhook is not a Discord Webhook URL'
    });
  }

  // If validation passes, proceed to the next middleware or route handler
  next();
}