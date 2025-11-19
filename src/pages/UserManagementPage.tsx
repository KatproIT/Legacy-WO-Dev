import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  "https://legacy-wo-backend-agefgdh7eec7esag.southindia-01.azurewebsites.net/api";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");
  const [role, setRole] = useState("technician");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const superadminPassword = "Legacy@123!"; // can move to prompt

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await authFetch(`${API}/auth/users`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast("Error loading users", "error");
    }
  };

  const createUser = async () => {
    if (!email) return showToast("Email required", "error");

    setLoading(true);
    try {
      const res = await authFetch(`${API}/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, superadminPassword })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create user");
      }

      showToast("User created successfully", "success");
      setEmail("");
      loadUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await authFetch(`${API}/auth/delete-user/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete user");
      showToast("User deleted", "success");
      loadUsers();
    } catch {
      showToast("Error deleting user", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Superadmin - User Management</h1>

      {toast && (
        <div className={`mb-4 p-3 rounded text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="form-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="technician">Technician</option>
            <option value="pm">PM</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={createUser}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>

      {/* User List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Existing Users</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
