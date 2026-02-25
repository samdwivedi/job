import React, { useEffect, useState } from "react";

function TaskCard({ task, user, onUpload, onComplete, onVerify }) {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-2">
      <h4 className="text-lg font-semibold">{task.title}</h4>

      <div className="text-sm text-gray-600">
        <p>Assigned by: {task.assignedBy?.name}</p>
        <p>Assigned to: {task.assignedTo?.name}</p>
        <p>Verifier: {task.verifier?.name}</p>
        <p>Coins: {task.coins}</p>
        <p>Status: <span className="font-medium text-black">{task.status}</span></p>
      </div>

      {task.file && (
        <a
          href={`http://localhost:4000${task.file.path}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-sm underline"
        >
          {task.file.originalName}
        </a>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {user.role === "employee" && user._id === task.assignedTo._id && (
          <>
            <input
              id={`file-${task._id}`}
              type="file"
              className="text-sm"
            />
            <button
              onClick={() => {
                const el = document.getElementById(`file-${task._id}`);
                if (!el.files[0]) return alert("Pick a file");
                onUpload(task._id, el.files[0]);
              }}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              Upload
            </button>

            <button
              onClick={() => onComplete(task._id)}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              Mark Complete
            </button>
          </>
        )}

        {user.role === "verifier" && user._id === task.verifier._id && (
          <button
            onClick={() => onVerify(task._id)}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
          >
            Verify & Transfer
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const fetchTasks = async () => {
    const res = await fetch(
      `http://localhost:4000/api/tasks/user/${user._id}`
    );
    const data = await res.json();
    setTasks(data);
  };

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:4000/api/users");
    setAllUsers(await res.json());
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const onUpload = async (taskId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(
      `http://localhost:4000/api/tasks/${taskId}/upload`,
      { method: "POST", body: fd }
    );
    if (res.ok) {
      fetchTasks();
    }
  };

  const onComplete = async (taskId) => {
    const res = await fetch(
      `http://localhost:4000/api/tasks/${taskId}/complete`,
      { method: "POST" }
    );
    if (res.ok) fetchTasks();
  };

  const onVerify = async (taskId) => {
    const res = await fetch(
      `http://localhost:4000/api/tasks/${taskId}/verify`,
      { method: "POST" }
    );
    if (res.ok) {
      fetchTasks();
      fetchUsers();
    }
  };

  const createTask = async () => {
    const title = prompt("Task title");
    const assignedToId = prompt("assignedTo user id");
    const verifierId = prompt("verifier user id");
    const coins = Number(prompt("coins", "100") || 0);

    if (!title || !assignedToId || !verifierId) return;

    await fetch("http://localhost:4000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        assignedBy: user._id,
        assignedTo: assignedToId,
        verifier: verifierId,
        coins,
      }),
    });

    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white border rounded-lg p-4">
          <div className="text-sm">
            Logged in as{" "}
            <span className="font-semibold">{user.name}</span> ({user.role}) —
            Coins: {user.coins}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchTasks();
                fetchUsers();
              }}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              Refresh
            </button>

            {(user.role === "hr" || user.role === "admin") && (
              <button
                onClick={createTask}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
              >
                Create Task
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Your Tasks</h3>
            {tasks.length === 0 && (
              <p className="text-sm text-gray-500">No tasks</p>
            )}
            {tasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                user={user}
                onUpload={onUpload}
                onComplete={onComplete}
                onVerify={onVerify}
              />
            ))}
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4">All Users</h4>
            <div className="space-y-3 text-sm">
              {allUsers.map((u) => (
                <div key={u._id} className="border-b pb-2">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-gray-500">{u.role}</p>
                  <p>Coins: {u.coins}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}