import { useState } from "react";
import * as adminApi from "../api/admin";

export default function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await adminApi.createUser({
        name: name.trim() || undefined,
        email: email.trim(),
        password,
        role: "USER",
      });
      onSuccess?.(user);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-md p-4 w-screen h-screen min-h-screen" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-white/[0.1] bg-navy-900 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold tracking-tight text-ink-50">Add User</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mq-btn-icon"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Display name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5">Email (required)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5">Password (required)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Min 8 characters"
            />
          </div>
          <div className="flex gap-2 pt-4 border-t border-white/[0.08] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mq-btn-secondary flex-1"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mq-btn-primary flex-1"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
