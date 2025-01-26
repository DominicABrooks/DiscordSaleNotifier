import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify'; // Import only the toast function

const TrackingForm = ({ formType, onSubmitForm }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true); // State to manage URL validity

  // Function to check if the given URL is valid according to the specified pattern
  const checkIfValidDiscordWebhookUrl = (url) => {
    // Validate URL format (simple check for https://discord.com/api/webhooks/... format)
    const isValid = /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/.test(url);
    setIsValidUrl(isValid);

    return isValid;
  };

  const handleSubmit = async () => {
    const isValidUrl = checkIfValidDiscordWebhookUrl(webhookUrl);

    // Validate URL format
    if (!isValidUrl) {
      console.log('Invalid URL');
      toast.error('Invalid Webhook', {
        position: 'top-right'
      });
      return; // Prevent submission if URL is invalid
    }
    
    try {
        const response = await fetch(webhookUrl); // Sending GET request to the webhook URL
  
        if (!response.ok) {
          toast.error('Failed to fetch webhook URL', {
            position: 'top-right'
          });
          return; // Prevent submission if GET request fails
        }

        await onSubmitForm(webhookUrl);
    } catch (error) {
        console.error('Error fetching webhook URL:', error.message);

        toast.error('Failed to fetch webhook URL', {
            position: 'top-right'
        });
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setWebhookUrl(url);

    checkIfValidDiscordWebhookUrl(url);
  };

  return (
    <Form className="p-3" id={`${formType}-form`} noValidate onSubmit={(e) => e.preventDefault()}>
      <Form.Group className="mb-3 row" controlId={`${formType}-webhook`}>
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
          <Form.Text className="text-muted">
            Platforms currently supported: <img src="discord.svg" width="18" height="18" alt="Discord" className="icon img-responsive" />
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            Please provide a valid Discord Webhook URL.
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      <Button id={`${formType}-button`} type="button" className={`btn ${formType === 'add' ? 'btn-primary' : 'btn-danger'}`} onClick={handleSubmit}>
        <span id={`${formType}-spinner`} className="d-none spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{' '}
        {formType === 'add' ? 'Start Tracking!' : 'Remove Tracking!'}
      </Button>
    </Form>
  );
};

export default TrackingForm;