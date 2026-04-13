import { useState } from "react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ================= APP ================= */

export default function App() {
  const [user, setUser] = useState(null);

  return user ? <Dashboard user={user} /> : <Auth onLogin={setUser} />;
}

/* ================= AUTH ================= */

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", hospital: "", role: "Doctor" });

  return (
    <div style={styles.authWrap}>
      <div style={styles.authCard}>
        <h1>VitalLoop</h1>
        <h3>{isSignup ? "Create Account" : "Login"}</h3>

        <input placeholder="Name" style={styles.input}
          onChange={e => setForm({...form, name: e.target.value})} />

        <input placeholder="Email" style={styles.input}/>
        <input type="password" placeholder="Password" style={styles.input}/>

        {isSignup && (
          <>
            <input placeholder="Hospital" style={styles.input}
              onChange={e => setForm({...form, hospital: e.target.value})} />
            <select style={styles.input}
              onChange={e => setForm({...form, role: e.target.value})}>
              <option>Doctor</option>
              <option>Nurse</option>
              <option>Admin</option>
            </select>
          </>
        )}

        <button onClick={() => onLogin(form)} style={styles.button}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p onClick={() => setIsSignup(!isSignup)} style={styles.link}>
          {isSignup ? "Login" : "Create Account"}
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

  /* ===== Excel ===== */

  const handleImport = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setInventory(XLSX.utils.sheet_to_json(ws));
    };
    reader.readAsBinaryString(e.target.files[0]);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(inventory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  return (
    <div style={styles.app}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>VitalLoop</h2>

        <div style={styles.user}>
          <b>{user?.name}</b>
          <div>{user?.role} · {user?.hospital}</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* KPIs */}
        <div style={styles.kpis}>
          <Card title="Total Units" value={totalUnits}/>
          <Card title="Blood Saved" value="1240"/>
          <Card title="Time Saved" value="3.2 hrs"/>
          <Card title="Shortages" value="3"/>
        </div>

        {/* GRID */}
        <div style={styles.grid}>

          {/* MAP */}
          <div style={styles.card}>
            <h3>Network Overview</h3>
            <MapContainer center={[28.6139,77.2090]} zoom={11} style={{height:250}}>
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
          </div>

          {/* ALERTS */}
          <div style={styles.card}>
            <h3>Critical Alerts</h3>
            <p>O- shortage at AIIMS</p>
            <p>A+ shortage at GTB</p>
          </div>

          {/* INVENTORY */}
          <div style={styles.card}>
            <h3>Inventory</h3>
            <input type="file" onChange={handleImport}/>
            <button onClick={handleExport}>Export</button>

            <table>
              <tbody>
                {inventory.map((i,idx)=>(
                  <tr key={idx}>
                    <td>{i.type}</td>
                    <td>{i.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TRANSFERS */}
          <div style={styles.card}>
            <h3>Active Transfers</h3>
            <p>AIIMS → Safdarjung (O-)</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Card({ title, value }) {
  return (
    <div style={styles.kpi}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  app: { display: "flex", height: "100vh", fontFamily: "Arial" },
  sidebar: { width: 220, background: "#1e293b", color: "white", padding: 20, display:"flex", flexDirection:"column", justifyContent:"space-between"},
  user: { background:"#334155", padding:10, borderRadius:8 },
  main: { flex:1, padding:20, background:"#f4f6f9" },
  kpis: { display:"flex", gap:10, marginBottom:20 },
  kpi: { background:"white", padding:15, borderRadius:10, flex:1 },
  grid: { display:"grid", gridTemplateColumns:"2fr 1fr", gap:15 },
  card: { background:"white", padding:15, borderRadius:10 },
  authWrap: { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" },
  authCard: { background:"white", padding:30, borderRadius:10, width:300 },
  input: { width:"100%", margin:5, padding:10 },
  button: { width:"100%", padding:10, background:"#2563eb", color:"white", border:"none" },
  link: { color:"#2563eb", cursor:"pointer", marginTop:10 }
};
