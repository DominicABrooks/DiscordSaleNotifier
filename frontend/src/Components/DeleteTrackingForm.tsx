import React from "react";
import TrackingForm from "./TrackingForm";
import { toast } from "react-toastify";
import { submitWebhookRequest } from "../utils/webhookApi";

const DeleteTrackingForm: React.FC = () => {
  async function deleteWebhook(webhookUrl: string) {
    try {
      const message = await submitWebhookRequest({
        endpoint: "delete",
        method: "DELETE",
        webhookUrl,
        successMessage: "Webhook deleted successfully!",
        failureMessage: "Failed to delete webhook"
      });
      toast.success(message, {
        position: "top-right"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete webhook";
      toast.error(message, {
        position: "top-right"
      });
    }
  }

  return <TrackingForm formType="delete" onSubmitForm={deleteWebhook} />;
};

export default DeleteTrackingForm;
