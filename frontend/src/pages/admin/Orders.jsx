import { useEffect, useState } from "react";
import api from "../../api/client.js";
import AdminLayout from "../../components/AdminLayout.jsx";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    api.get("/orders", { params: filter ? { status: filter } : {} }).then(({ data }) => setOrders(data.orders));
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="border border-line rounded-xl2 bg-white/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-line/40 text-left text-ink/50">
            <tr><th className="p-3">Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="p-3">#{o.id}</td>
                <td>{o.customer_name}<br /><span className="text-xs text-ink/40">{o.customer_email}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>₹{o.total_amount}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="input py-1.5 text-xs w-32">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-ink/40 text-sm">No orders found.</p>}
      </div>
    </AdminLayout>
  );
}
