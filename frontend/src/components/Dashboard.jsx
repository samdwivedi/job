import React, { useEffect, useState } from "react";

function TaskCard({ task, user, onUpload, onComplete, onVerify }) {
  const [uploadError, setUploadError] = useState("");
  const [completeError, setCompleteError] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const handleMarkComplete = async () => {
    setCompleteError("");
    
    // Check if task has uploaded file
    if (!task.file || task.status !== "uploaded") {
      setCompleteError("⚠️ You must upload a file before marking as complete");
      return;
    }

    await onComplete(task._id);
  };

  const handleVerify = async () => {
    setVerifyError("");
    
    if (task.status !== "completed") {
      setVerifyError("Task must be marked as completed first");
      return;
    }

    const result = await onVerify(task._id);
    if (result && result.error) {
      setVerifyError(result.error);
    }
  };

  const handleUpload = async () => {
    setUploadError("");
    const el = document.getElementById(`file-${task._id}`);
    
    if (!el.files[0]) {
      setUploadError("Please select a file");
      return;
    }

    const result = await onUpload(task._id, el.files[0]);
    if (result && result.error) {
      setUploadError(result.error);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h4 className="text-lg font-semibold">{task.title}</h4>

      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <p><span className="font-medium">Assigned by:</span> {task.assignedBy?.name}</p>
        <p><span className="font-medium">Assigned to:</span> {task.assignedTo?.name}</p>
        <p><span className="font-medium">Verifier:</span> {task.verifier?.name}</p>
        <p><span className="font-medium">Coins:</span> {task.coins}</p>
        <p>
          <span className="font-medium">Status:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            task.status === "assigned" ? "bg-yellow-100 text-yellow-800" :
            task.status === "uploaded" ? "bg-blue-100 text-blue-800" :
            task.status === "completed" ? "bg-orange-100 text-orange-800" :
            "bg-green-100 text-green-800"
          }`}>
            {task.status}
          </span>
        </p>
      </div>

      {task.file && (
        <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
          <p className="font-medium text-green-800">✓ File Uploaded:</p>
          <a
            href={`http://localhost:4000${task.file.path}`}
            target="_blank"
            rel="noreferrer"
            className="text-green-600 underline text-xs"
          >
            {task.file.originalName}
          </a>
        </div>
      )}

      <div className="space-y-2">
        {/* Employee Actions */}
        {user.role === "employee" && user._id === task.assignedTo._id && (
          <>
            <div className="space-y-2 border-t pt-3">
              <div className="flex gap-2 items-start">
                <input
                  id={`file-${task._id}`}
                  type="file"
                  className="text-sm flex-1"
                />
                <button
                  onClick={handleUpload}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{uploadError}</p>
              )}
            </div>

            {task.file && task.status === "uploaded" && (
              <div className="space-y-2 border-t pt-3">
                <button
                  onClick={handleMarkComplete}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 font-medium"
                >
                  Mark as Completed
                </button>
                {completeError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{completeError}</p>
                )}
              </div>
            )}

            {task.status === "assigned" && (
              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                Upload your document first
              </p>
            )}
          </>
        )}

        {/* Verifier Actions */}
        {user.role === "verifier" && user._id === task.verifier._id && (
          <>
            <div className="space-y-2 border-t pt-3">
              <button
                onClick={handleVerify}
                disabled={task.status !== "completed"}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
                  task.status === "completed"
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-200 text-gray-600 cursor-not-allowed"
                }`}
              >
                Verify & Transfer Coins
              </button>
              {verifyError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{verifyError}</p>
              )}
            </div>

            {task.status === "verified" && (
              <p className="text-xs text-green-600 bg-green-50 p-2 rounded font-medium">
                Task verified and coins transferred
              </p>
            )}

            {task.status !== "completed" && task.status !== "verified" && (
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Waiting for employee to mark task as completed
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskCreationModal({ isOpen, onClose, onCreate, users, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    verifier: "",
    coins: "100",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.assignedTo || !formData.verifier) {
      setError("Please fill all fields");
      return;
    }

    if (formData.assignedTo === formData.verifier) {
      setError("Employee and Verifier cannot be the same person");
      return;
    }

    await onCreate({
      title: formData.title,
      assignedBy: currentUser._id,
      assignedTo: formData.assignedTo,
      verifier: formData.verifier,
      coins: Number(formData.coins),
    });

    setFormData({ title: "", assignedTo: "", verifier: "", coins: "100" });
    onClose();
  };

  if (!isOpen) return null;

  const employeeUsers = users.filter((u) => u.role === "employee");
  const verifierUsers = users.filter((u) => u.role === "verifier");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
        <h3 className="text-lg font-semibold">Create New Task</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />

          <div>
            <label className="text-xs font-medium">Assign to Employee</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm mt-1"
            >
              <option value="">Select Employee</option>
              {employeeUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Assign Verifier</label>
            <select
              value={formData.verifier}
              onChange={(e) => setFormData({ ...formData, verifier: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm mt-1"
            >
              <option value="">Select Verifier</option>
              {verifierUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Coins"
            value={formData.coins}
            onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />

          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-3">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/tasks/user/${user._id}`
      );
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users");
      setAllUsers(await res.json());
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [user._id]);

  const onUpload = async (taskId, file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(
        `http://localhost:4000/api/tasks/${taskId}/upload`,
        { method: "POST", body: fd }
      );

      if (res.ok) {
        fetchTasks();
        return { success: true };
      } else {
        const data = await res.json();
        return { error: data.error };
      }
    } catch (err) {
      return { error: err.message };
    }
  };

  const onComplete = async (taskId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/tasks/${taskId}/complete`,
        { method: "POST" }
      );

      if (res.ok) {
        fetchTasks();
        return { success: true };
      } else {
        const data = await res.json();
        return { error: data.error };
      }
    } catch (err) {
      return { error: err.message };
    }
  };

  const onVerify = async (taskId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/tasks/${taskId}/verify`,
        { method: "POST" }
      );

      if (res.ok) {
        fetchTasks();
        fetchUsers();
        return { success: true };
      } else {
        const data = await res.json();
        return { error: data.error };
      }
    } catch (err) {
      return { error: err.message };
    }
  };

  const onCreateTask = async (taskData) => {
    try {
      const res = await fetch("http://localhost:4000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        fetchTasks();
        setShowCreateModal(false);
      }
    } catch (err) {
      alert("Error creating task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white border rounded-lg p-4">
          <div className="text-sm">
            <p className="text-gray-600">Logged in as</p>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role.toUpperCase()} • Coins: {user.coins}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                fetchTasks();
                fetchUsers();
              }}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Refresh
            </button>

            {(user.role === "hr" || user.role === "admin") && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Assign Task
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        <TaskCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateTask}
          users={allUsers}
          currentUser={user}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {user.role === "employee"
                  ? "My Assigned Tasks"
                  : user.role === "verifier"
                  ? "Tasks to Verify"
                  : "Tasks Created"}
              </h3>

              {loading && (
                <p className="text-sm text-gray-500">Loading tasks...</p>
              )}

              {!loading && tasks.length === 0 && (
                <div className="bg-white border rounded-lg p-6 text-center">
                  <p className="text-gray-500">No tasks</p>
                </div>
              )}

              <div className="space-y-4">
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
            </div>
          </div>

          {/* Users Sidebar */}
          <div className="bg-white border rounded-lg p-4 h-fit">
            <h4 className="text-lg font-semibold mb-4">All Users</h4>
            <div className="space-y-3 text-sm">
              {loading && <p className="text-gray-500">Loading...</p>}
              {allUsers.length === 0 && (
                <p className="text-gray-500 text-xs">No users yet</p>
              )}
              {allUsers.map((u) => (
                <div
                  key={u._id}
                  className={`border-b pb-3 last:border-b-0 ${
                    u._id === user._id ? "bg-blue-50 p-2 rounded border" : ""
                  }`}
                >
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.role}</p>
                  <p className="text-xs font-semibold">{u.coins} coins</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}