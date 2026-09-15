import React from 'react';
import TrackingForm from './TrackingForm';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const AddTrackingForm: React.FC = () => {
  const createWebhook = async (webhookUrl: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/webhook/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhook: webhookUrl })
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? 'Failed to create webhook');
      }

      // Simulating success toast notification
      toast.success('Webhook added successfully!', {
        position: 'top-right'
      });
    } catch (error) {
      // Simulating error toast notification
      const message = error instanceof Error ? error.message : 'Failed to create webhook';
      toast.error(message, {
        position: 'top-right'
      });
    }
  };

  return <TrackingForm formType="add" onSubmitForm={createWebhook} />;
};

export default AddTrackingForm;
