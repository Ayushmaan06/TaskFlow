"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [user] = useState<User | null>(getStoredUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function getToken(): string | null {
    return localStorage.getItem("token");
  }

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const fetchTasks = useCallback(async (token: string) => {
    const res = await fetch("/api/v1/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.clear();
      router.push("/login");
      return;
    }
    const data = await res.json();
    if (data.success) setTasks(data.data);
  }, [router]);

  useEffect(() => {
    const token = getToken();

    if (!token || !user) {
      router.push("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks(token).finally(() => setLoading(false));
  }, [router, fetchTasks, user]);

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        showAlert("error", data.message || "Failed to create task.");
        return;
      }

      setTasks((prev) => [data.data, ...prev]);
      setTitle("");
      setDescription("");
      showAlert("success", "Task created successfully!");
    } catch {
      showAlert("error", "Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setDeletingId(taskId);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.message || "Failed to delete task.");
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showAlert("success", "Task deleted.");
    } catch {
      showAlert("error", "Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    localStorage.clear();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon">⚡</div>
            TaskFlow
          </div>
          <div className="navbar-actions">
            {user && (
              <div className="user-badge">
                <span>{user.name}</span>
                <span className={`role-chip ${user.role === "ADMIN" ? "admin" : ""}`}>
                  {user.role}
                </span>
              </div>
            )}
            <button
              id="logout-btn"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Good to see you, {user?.name?.split(" ")[0]} 👋</h1>
          <p>Here&apos;s an overview of your workspace</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tasks.filter((t) => !t.description).length}</div>
            <div className="stat-label">No Description</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user?.role === "ADMIN" ? "★" : "—"}</div>
            <div className="stat-label">Access Level</div>
          </div>
        </div>

        {/* Alert */}
        {alertMsg && (
          <div className={`alert alert-${alertMsg.type}`} role="alert">
            <span>{alertMsg.type === "success" ? "✓" : "✕"}</span>
            {alertMsg.text}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Create Task Form */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <span>✦</span> New Task
              </span>
            </div>
            <form onSubmit={handleCreateTask} id="create-task-form">
              <div className="form-group">
                <label htmlFor="task-title" className="form-label">Title *</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-desc" className="form-label">Description (optional)</label>
                <textarea
                  id="task-desc"
                  className="form-input form-textarea"
                  placeholder="Add more context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                id="create-task-btn"
                type="submit"
                className="btn btn-primary"
                disabled={creating || !title.trim()}
              >
                {creating ? <><span className="spinner" /> Creating...</> : "Create Task"}
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                Your Tasks
                <span className="count-badge">{tasks.length}</span>
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No tasks yet</p>
                <span>Create your first task using the form on the left</span>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div className="task-item" key={task.id} id={`task-${task.id}`}>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}
                      <div className="task-meta">
                        <span>🗓</span>
                        {formatDate(task.createdAt)}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        id={`delete-task-${task.id}`}
                        className="btn btn-danger"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingId === task.id}
                        title="Delete task"
                      >
                        {deletingId === task.id ? (
                          <span className="spinner" style={{ width: 14, height: 14 }} />
                        ) : (
                          "✕"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin hint */}
        {user?.role === "ADMIN" && (
          <div style={{ marginTop: 24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  <span>👑</span> Admin Panel
                </span>
                <a
                  href="/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  id="open-api-docs"
                >
                  API Docs ↗
                </a>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                As an admin, you have access to{" "}
                <code style={{ color: "var(--accent-primary)", fontSize: 13 }}>
                  GET /api/v1/users
                </code>{" "}
                to view all users and their task counts.
                Visit the API docs to explore all endpoints.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
