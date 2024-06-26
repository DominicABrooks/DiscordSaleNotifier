import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function DeleteTrackingForm() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true); // State to manage URL validity

  const deleteWebhook = async () => {
    console.log('Delete Tracking:' + webhookUrl)
    try {
      const response = await fetch('http://localhost:1337/api/webhook/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl }) // Sending URL in the request body
      });

      if (!response.ok) {
        throw new Error('Failed to delete webhook');
      }

      const data = await response.json();
      console.log('Webhook deleted successfully:', data);
      // Optionally, update UI or perform other actions upon successful deletion
    } catch (error) {
      console.error('Error deleting webhook:', error);
      // Handle error scenarios, e.g., show error message to user
    }
  };

  const handleDeleteClick = async () => {
    // Validate URL format
    if (!isValidUrl) {
      return; // Prevent deletion if URL is invalid
    }

    await deleteWebhook();
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setWebhookUrl(url);

    // Validate URL format (simple check for https://discord.com/api/webhooks/... format)
    const isValid = /^https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/\S+$/.test(url);
    setIsValidUrl(isValid);
  };

  return (
    <Form className="p-3" id="delete-form" noValidate>
      <Form.Group className="mb-3 row" controlId="delete-webhook">
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

      <Button id="delete-button" type="button" className="btn btn-danger" onClick={handleDeleteClick}>
        <span id="delete-spinner" className="d-none spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Remove Tracking!
      </Button>
    </Form>
  );
}

export default DeleteTrackingForm;