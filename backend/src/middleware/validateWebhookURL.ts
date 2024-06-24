import validator from 'validator';

export function validateWebhookURL(req, res, next) {
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