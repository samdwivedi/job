import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App(){
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("hr_demo_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if(user) localStorage.setItem("hr_demo_user", JSON.stringify(user));
    else localStorage.removeItem("hr_demo_user");
  }, [user]);

  return (
    <div className="app">
      <h1>HR Management Demo</h1>
      {!user ? <Login onLogin={setUser}/> : <Dashboard user={user} onLogout={()=>setUser(null)}/>}
    </div>
  );
}