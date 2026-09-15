import React from 'react';
import TrackingForm from './TrackingForm';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const DeleteTrackingForm: React.FC = () => {
  const deleteWebhook = async (webhookUrl: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/webhook/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl })
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? 'Failed to delete webhook');
      }

      // Simulating success toast notification
      toast.success('Webhook deleted successfully!', {
        position: 'top-right'
      });
    } catch (error) {
      // Simulating error toast notification
      const message = error instanceof Error ? error.message : 'Failed to delete webhook';
      toast.error(message, {
        position: 'top-right'
      });
    }
  };

  return <TrackingForm formType="delete" onSubmitForm={deleteWebhook} />;
};

export default DeleteTrackingForm;
