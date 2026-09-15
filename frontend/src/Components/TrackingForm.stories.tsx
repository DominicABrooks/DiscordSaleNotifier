import React from "react";
import TrackingForm from "./TrackingForm";

function noopSubmit() {
  return Promise.resolve();
}

const meta = {
  title: "Components/TrackingForm",
  component: TrackingForm
};

export default meta;

export function AddMode() {
  return React.createElement(TrackingForm, {
    formType: "add",
    onSubmitForm: noopSubmit
  });
}

export function DeleteMode() {
  return React.createElement(TrackingForm, {
    formType: "delete",
    onSubmitForm: noopSubmit
  });
}
