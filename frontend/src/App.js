import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
import React from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Footer from './Components/Footer'; 
import Header from './Components/Header';
import AddTrackingForm from './Components/AddTrackingForm'; 
import DeleteTrackingForm from './Components/DeleteTrackingForm'; 

function App() {
  return (
    <Container className="mt-3">
      <Header />
      <CardTabs />
      <Footer />
    </Container>
  );
}

// Card Tabs Component
function CardTabs() {
  return (
    <div className="mt-3 card text-bg-light shadow">
      <div className="card-header">
        <Tabs defaultActiveKey="add" id="card-tabs">
          <Tab eventKey="add" title="Add Tracking" tabClassName="text-primary">
            <AddTrackingForm />
          </Tab>
          <Tab eventKey="delete" title="Delete Tracking" tabClassName="text-danger">
            <DeleteTrackingForm />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;