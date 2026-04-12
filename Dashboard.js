import React from "react";
import Inventory from "./Inventory";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>VitalLoop Dashboard</h1>
      <Inventory />
    </div>
  );
}

export default Dashboard;
