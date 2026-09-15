import React from "react";
import TrackingForm from "./TrackingForm";
import { toast } from "react-toastify";
import { submitWebhookRequest } from "../utils/webhookApi";

const AddTrackingForm: React.FC = () => {
  async function createWebhook(webhookUrl: string) {
    try {
      const message = await submitWebhookRequest({
        endpoint: "create",
        method: "POST",
        webhookUrl,
        successMessage: "Webhook added successfully!",
        failureMessage: "Failed to create webhook"
      });
      toast.success(message, {
        position: "top-right"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create webhook";
      toast.error(message, {
        position: "top-right"
      });
    }
  }

  return <TrackingForm formType="add" onSubmitForm={createWebhook} />;
};

export default AddTrackingForm;
