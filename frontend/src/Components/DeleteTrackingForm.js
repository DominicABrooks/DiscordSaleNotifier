import React from 'react';
import TrackingForm from './TrackingForm';
import { toast } from 'react-toastify';

function DeleteTrackingForm() {
  const deleteWebhook = async (webhookUrl) => {
    try {
      const response = await fetch('http://localhost:1337/api/webhook/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete webhook');
      }

      // Simulating success toast notification
      toast.success('Webhook deleted successfully!', {
        position: 'top-right'
      });
    } catch (error) {
      // Simulating error toast notification
      toast.error(error.message || 'Failed to delete webhook', {
        position: 'top-right'
      });
    }
  };

  return <TrackingForm formType="delete" onSubmitForm={deleteWebhook} />;
}

export default DeleteTrackingForm;