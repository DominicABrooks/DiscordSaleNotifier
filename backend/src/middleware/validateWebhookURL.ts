import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate the webhook URL.
 * 
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function.
 */
export function validateWebhookURL(req: Request, res: Response, next: NextFunction) {
  const { webhook } = req.body;

  // Validate webhook URL
  if (!validator.isURL(webhook, { require_protocol: true,  })) {
    return res.status(400).json({
      error: 'Input Webhook is not URL'
    });
  }

  // Validate Discord webhook URL
  if (!validator.matches(webhook, /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/)) {
    return res.status(400).json({
      error: 'Input Webhook is not a Discord Webhook URL'
    });
  }

  // If validation passes, proceed to the next middleware or route handler
  next();
}