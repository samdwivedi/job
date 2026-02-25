import React, { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserForm, setNewUserForm] = useState({ name: "", role: "employee", coins: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name) {
      alert("Please enter a name");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      if (res.ok) {
        setNewUserForm({ name: "", role: "employee", coins: 0 });
        fetchUsers();
      }
    } catch (err) {
      alert("Error creating user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">HR Management System</h2>
          <p className="text-sm text-gray-500">
            Login or create a new user to get started
          </p>
        </div>

        {/* Create New User Form */}
        <form onSubmit={createUser} className="space-y-3 border-b pb-4">
          <h3 className="text-sm font-semibold">Create User</h3>
          <input
            type="text"
            placeholder="User Name"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={newUserForm.role}
            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
            <option value="verifier">Verifier</option>
          </select>
          <input
            type="number"
            placeholder="Initial Coins"
            value={newUserForm.coins}
            onChange={(e) => setNewUserForm({ ...newUserForm, coins: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <button
            type="submit"
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Create User
          </button>
        </form>

        {/* Users List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Existing Users</h3>
          {loading && <p className="text-sm text-gray-500">Loading users...</p>}
          {!loading && users.length === 0 && (
            <p className="text-sm text-gray-500">No users yet. Create one above.</p>
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