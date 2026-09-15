import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React from "react";
import Container from "react-bootstrap/Container";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import CardTabs from "./Components/CardTabs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <Container className="mt-3">
      <Header />
      <CardTabs />
      <Footer />
      <ToastContainer position="top-right" autoClose={5000} />
    </Container>
  );
};

export default App;
