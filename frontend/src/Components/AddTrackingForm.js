import React from 'react';
import TrackingForm from './TrackingForm';
import { toast } from 'react-toastify';

function AddTrackingForm() {
  const createWebhook = async (webhookUrl) => {
    try {
      const response = await fetch('http://localhost:1337/api/webhook/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create webhook');
      }

      // Simulating success toast notification
      toast.success('Webhook added successfully!', {
        position: 'top-right'
      });
    } catch (error) {
      // Simulating error toast notification
      toast.error(error.message || 'Failed to create webhook', {
        position: 'top-right'
      });
    }
  };

  return <TrackingForm formType="add" onSubmitForm={createWebhook} />;
}

export default AddTrackingForm;