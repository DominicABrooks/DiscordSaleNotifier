import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "../src/index.css";
import type { Preview } from "@storybook/react-webpack5";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      expanded: true
    }
  }
};

export default preview;
