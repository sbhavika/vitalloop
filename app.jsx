import { useState } from "react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {

  const [user, setUser] = useState(null);

  return user ? (
    <Dashboard user={user} />
  ) : (
    <Auth onLogin={setUser} />
  );
}

/* ================= AUTH ================= */

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    hospital: "",
    role: "Doctor"
  });

  return (
    <div style={styles.authContainer}>
      <div style={styles.card}>
        <h1>VitalLoop</h1>
        <h3>{isSignup ? "Create Account" : "Login"}</h3>

        <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} style={styles.input}/>
        <input placeholder="Email" style={styles.input}/>
        <input type="password" placeholder="Password" style={styles.input}/>

        {isSignup && (
          <>
            <input placeholder="Hospital" onChange={e => setForm({...form, hospital: e.target.value})} style={styles.input}/>
            <select onChange={e => setForm({...form, role: e.target.value})} style={styles.input}>
              <option>Doctor</option>
              <option>Nurse</option>
              <option>Admin</option>
            </select>
          </>
        )}

        <button onClick={() => onLogin(form)} style={styles.button}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p>
          {isSignup ? "Already have an account?" : "New user?"}
          <span style={styles.link} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Login" : " Create Account"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({ user }) {

  const hospitals = [
    { name: "AIIMS Delhi", position: [28.5672, 77.2100], status: "Shortage" },
    { name: "Safdarjung", position: [28.5677, 77.2066], status: "Surplus" },
    { name: "Max Hospital", position: [28.5355, 77.3910], status: "Surplus" },
    { name: "GTB Hospital", position: [28.6820, 77.3150], status: "Shortage" },
  ];

  const routes = [
    [hospitals[0].position, hospitals[1].position],
    [hospitals[1].position, hospitals[2].position],
  ];

  const [inventory, setInventory] = useState([
    { resource: "Blood", type: "O+", units: 120 },
    { resource: "Blood", type: "O-", units: 5 },
  ]);

  const totalUnits = inventory.reduce((s, i) => s + i.units, 0);

  /* ===== Excel Functions ===== */

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setInventory(data);
    };

    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(inventory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>VitalLoop</h2>

        <div style={{ marginTop: "auto" }}>
          <div style={styles.userCard}>
            <div style={{ fontWeight: "bold" }}>
              {user?.name || "Dr. Ravi Mehta"}
            </div>
            <div style={{ fontSize: 12 }}>
              {user?.role || "Admin"} · {user?.hospital || "AIIMS Delhi"}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        <h1>Dashboard</h1>

        {/* KPIs */}
        <div style={styles.kpiRow}>
          <KPI title="Total Units" value={totalUnits}/>
          <KPI title="Blood Saved" value="1240"/>
          <KPI title="Time Saved" value="3.2 hrs"/>
          <KPI title="Shortages" value="3"/>
        </div>

        {/* MAP */}
        <h2>Network Overview (Delhi)</h2>
        <MapContainer center={[28.6139,77.2090]} zoom={11} style={{height:300}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {hospitals.map((h,i)=>(
            <Marker key={i} position={h.position}>
              <Popup>{h.name} - {h.status}</Popup>
            </Marker>
          ))}
          {routes.map((r,i)=>(
            <Polyline key={i} positions={r} color="blue"/>
          ))}
        </MapContainer>

        {/* INVENTORY */}
        <h2>Inventory</h2>

        <div style={{ marginBottom: 10 }}>
          <input type="file" onChange={handleImport}/>
          <button onClick={handleExport}>Export</button>
          <button onClick={handlePrint}>Print</button>
        </div>

        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i, idx) => (
              <tr key={idx}>
                <td>{i.resource}</td>
                <td>{i.type}</td>
                <td>{i.units}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ title, value }) {
  return (
    <div style={styles.kpiCard}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  authContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f9"
  },
  card: {
    background: "white",
    padding: 30,
    borderRadius: 10,
    width: 300,
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "8px 0"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#2563eb",
    color: "white",
    border: "none"
  },
  link: {
    color: "#2563eb",
    cursor: "pointer"
  },
  sidebar: {
    width: 220,
    background: "#1e293b",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column"
  },
  userCard: {
    background: "#334155",
    padding: 10,
    borderRadius: 8
  },
  main: {
    flex: 1,
    padding: 20,
    overflow: "auto"
  },
  kpiRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },
  kpiCard: {
    border: "1px solid #ccc",
    padding: 10,
    borderRadius: 8
  }
};
