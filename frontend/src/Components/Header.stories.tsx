import React from "react";
import Header from "./Header";

const meta = {
  title: "Components/Header",
  component: Header
};

export default meta;

export function Default() {
  return React.createElement(Header);
}
