import { useEffect, useState } from "react";
import api from "../../api/client.js";
import AdminLayout from "../../components/AdminLayout.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  function load() {
    api.get("/admin/users").then(({ data }) => setUsers(data.users));
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(u) {
    const newRole = u.role === "admin" ? "customer" : "admin";
    await api.put(`/admin/users/${u.id}/role`, { role: newRole });
    load();
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl mb-8">Customers</h1>
      <div className="border border-line rounded-xl2 bg-white/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-line/40 text-left text-ink/50">
            <tr><th className="p-3">Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="p-3 flex items-center gap-3">
                  <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} className="w-8 h-8 rounded-full" alt="" />
                  {u.name}
                </td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => toggleRole(u)} className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-clay">
                    Make {u.role === "admin" ? "customer" : "admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
