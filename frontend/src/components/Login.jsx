import React, { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const seed = async () => {
    await fetch("http://localhost:4000/api/seed", { method: "POST" });
    const u = await (await fetch("http://localhost:4000/api/users")).json();
    setUsers(u);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Select User</h2>
          <p className="text-sm text-gray-500">
            Choose a user to simulate login
          </p>
        </div>

        <button
          onClick={seed}
          className="w-full px-3 py-2 border rounded-md text-sm hover:bg-gray-100"
        >
          Seed Demo Users
        </button>

        <div className="space-y-3">
          {users.length === 0 && (
            <p className="text-sm text-gray-500">No users yet</p>
          )}

          {users.map((u) => (
            <div
              key={u._id}
              className="border rounded-md p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.role}</p>
                <p className="text-xs">Coins: {u.coins}</p>
              </div>

              <button
                onClick={() => onLogin(u)}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
              >
                Login
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}