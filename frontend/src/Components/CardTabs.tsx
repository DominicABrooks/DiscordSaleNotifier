import React from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import AddTrackingForm from "./AddTrackingForm";
import DeleteTrackingForm from "./DeleteTrackingForm";

const CardTabs: React.FC = () => {
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
};

export default CardTabs;
