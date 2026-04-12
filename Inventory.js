import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

function Inventory() {
  const [data, setData] = useState([
    { type: "O+", units: 20 },
    { type: "O-", units: 5 },
  ]);

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const lowStock = data.filter(item => item.units < 10);
    setAlerts(lowStock);
  }, [data]);

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formatted = jsonData.map(row => ({
        type: row["Blood Type"],
        units: Number(row["Units"]),
      }));

      setData(formatted);
    };

    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory.xlsx");
  };

  const handlePrint = () => window.print();

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev =>
        prev.map(item => ({
          ...item,
          units: Math.max(0, item.units - Math.floor(Math.random() * 3)),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Inventory</h2>

      {alerts.length > 0 && (
        <div style={{ background: "#ffe5e5", padding: "10px" }}>
          <strong>Shortage Alerts:</strong>
          {alerts.map((a, i) => (
            <div key={i}>{a.type} low ({a.units})</div>
          ))}
        </div>
      )}

      <br/>
      <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
      <button onClick={handleExport}>Export</button>
      <button onClick={handlePrint}>Print</button>

      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Blood Type</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.type}</td>
              <td>{d.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
