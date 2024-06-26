import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function AddTrackingForm() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true); // State to manage URL validity

  const createWebhook = async () => {
    console.log('Create Tracking: ' + webhookUrl);
    try {
      const response = await fetch('http://localhost:1337/api/webhook/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl }) // Sending URL in the request body
      });

      if (!response.ok) {
        throw new Error('Failed to create webhook');
      }

      const data = await response.json();
      console.log('Webhook created successfully:', data);
      // Optionally, update UI or perform other actions upon successful creation
    } catch (error) {
      console.error('Error creating webhook:', error);
      // Handle error scenarios, e.g., show error message to user
    }
  };

  const handleAddClick = async () => {
    // Validate URL format
    if (!isValidUrl) {
      return; // Prevent creation if URL is invalid
    }

    await createWebhook();
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setWebhookUrl(url);

    // Validate URL format (simple check for https://discord.com/api/webhooks/... format)
    const isValid = /^https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/\S+$/.test(url);
    setIsValidUrl(isValid);
  };

  return (
    <Form className="p-3" id="add-form" noValidate>
      <Form.Group className="mb-3 row" controlId="add-webhook">
        <Form.Label className="col-sm-2 col-form-label">
          Webhook URL{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks">
            <b>(?)</b>
          </a>
        </Form.Label>
        <div className="col-sm-10">
          <Form.Control
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={handleUrlChange}
            isInvalid={!isValidUrl}
          />
          <Form.Text className="text-muted">Platforms currently supported: <img src="discord.svg" width="18" height="18" alt="Discord" className="icon img-responsive" /></Form.Text>
          <Form.Control.Feedback type="invalid">
            Please provide a valid Discord Webhook URL.
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      <Button id="add-button" type="button" className="btn btn-primary" onClick={handleAddClick}>
        <span id="add-spinner" className="d-none spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Start Tracking!
      </Button>
    </Form>
  );
}

export default AddTrackingForm;