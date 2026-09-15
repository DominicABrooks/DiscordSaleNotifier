import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { isValidDiscordWebhookUrl, verifyWebhookReachable } from "../utils/discordWebhook";

export type TrackingFormType = "add" | "delete";

interface TrackingFormProps {
  formType: TrackingFormType;
  onSubmitForm: (webhookUrl: string) => Promise<void>;
}

const TrackingForm: React.FC<TrackingFormProps> = ({ formType, onSubmitForm }) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showInvalid = touched && !isValidDiscordWebhookUrl(webhookUrl);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTouched(true);
    setWebhookUrl(event.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    setTouched(true);
    if (!isValidDiscordWebhookUrl(webhookUrl)) {
      toast.error("Invalid Webhook", {
        position: "top-right"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const reachable = await verifyWebhookReachable(webhookUrl);
      if (!reachable) {
        toast.error("Failed to fetch webhook URL", {
          position: "top-right"
        });
        return;
      }
      await onSubmitForm(webhookUrl);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form className="p-3" id={formType + "-form"} noValidate onSubmit={(e) => e.preventDefault()}>
      <Form.Group className="mb-3 row" controlId={formType + "-webhook"}>
        <Form.Label className="col-sm-2 col-form-label">
          Webhook URL{" "}
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
            disabled={isSubmitting}
            isInvalid={showInvalid}
          />
          <Form.Text className="text-muted">
            Platforms currently supported: <img src="discord.svg" width="18" height="18" alt="Discord" className="icon img-responsive" />
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            Please provide a valid Discord Webhook URL.
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      <Button id={formType + "-button"} type="button" variant={formType === "add" ? "primary" : "danger"} disabled={isSubmitting} onClick={handleSubmit}>
        <span id={formType + "-spinner"} className={(isSubmitting ? "" : "d-none ") + "spinner-border spinner-border-sm"} role="status" aria-hidden="true"></span>{" "}
        {formType === "add" ? "Start Tracking!" : "Remove Tracking!"}
      </Button>
    </Form>
  );
};

export default TrackingForm;
