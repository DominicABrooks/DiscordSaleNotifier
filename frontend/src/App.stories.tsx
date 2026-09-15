import React from "react";
import App from "./App";

const meta = {
  title: "App",
  component: App
};

export default meta;

export function Default() {
  return React.createElement(App);
}
