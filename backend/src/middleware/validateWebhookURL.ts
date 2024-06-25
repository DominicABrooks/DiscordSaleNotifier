import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

export function validateWebhookURL(req: Request, res: Response, next: NextFunction) {
  const { webhook } = req.body;

  // Validate webhook URL
  if (!validator.isURL(webhook, { require_protocol: true })) {
    return res.status(400).json({
      error: 'Invalid webhook URL',
    });
  }

  // If validation passes, proceed to the next middleware or route handler
  next();
}