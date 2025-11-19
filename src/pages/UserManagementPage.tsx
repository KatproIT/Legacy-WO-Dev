import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';

type UserRow = { id: string; email: string; role: string; created_at: string };

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'technician' | 'pm' | 'admin'>('technician');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/auth/users');
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || 'Failed to load users');
      }
      const data = await res.json();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) return setError('Email required');

    try {
      const payload = { email, role };
      const res = await authFetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || 'Create failed');
      }
      const body = await res.json();
      setSuccess(`User created. Default password: ${body.defaultPassword || '12345678'}`);
      setEmail('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">User Management (Superadmin)</h2>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-3 text-sm text-green-700">{success}</div>}

          <form onSubmit={createUser} className="flex gap-2 flex-col sm:flex-row items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-3 py-2 border rounded" placeholder="new.user@company.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)}
                      className="px-3 py-2 border rounded">
                <option value="technician">technician</option>
                <option value="pm">pm</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create User</button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Existing users</h3>
            {loading ? <div>Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm">Email</th>
                      <th className="text-left px-4 py-2 text-sm">Role</th>
                      <th className="text-left px-4 py-2 text-sm">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b">
                        <td className="px-4 py-3 text-sm">{u.email}</td>
                        <td className="px-4 py-3 text-sm">{u.role}</td>
                        <td className="px-4 py-3 text-sm">{new Date(u.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
