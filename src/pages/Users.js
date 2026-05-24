import React, { useState, useCallback } from "react";
import { RiEyeLine, RiProhibitedLine, RiCheckLine } from "react-icons/ri";
import { getUsers, getUserById, toggleBlockUser } from "../api/api";
import useFetch from "../hooks/useFetch";
import {
  Card, PageHeader, Btn, Table, Pagination, Modal, Loader, ErrorBox,
  Empty, SearchInput, fmtCurrency, statusClass, fmtStatus,
} from "../components/ui";

export default function Users() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [isBlocked, setIsBlocked] = useState("");
  const [viewUser, setViewUser]   = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [blocking, setBlocking] = useState(null);

  const fetchFn = useCallback(
    () => getUsers({ page, limit: 20, search, ...(isBlocked !== "" ? { isBlocked } : {}) }),
    [page, search, isBlocked]
  );
  const { data, loading, error, refetch } = useFetch(fetchFn, [page, search, isBlocked]);
  const users = data?.users || [];
  const total = data?.total || 0;

  const openUser = async (u) => {
    setViewUser(u);
    setDetailLoading(true);
    try {
      const d = await getUserById(u._id);
      setUserDetail(d);
    } catch { setUserDetail(null); }
    finally { setDetailLoading(false); }
  };

  const handleToggleBlock = async (u) => {
    setBlocking(u._id);
    try {
      await toggleBlockUser(u._id);
      refetch();
      if (viewUser?._id === u._id) {
        const d = await getUserById(u._id);
        setUserDetail(d);
        setViewUser(d.user || d);
      }
    } catch { /* ignore */ }
    finally { setBlocking(null); }
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Users" sub={`${total} registered users`} />

      <div className="flex gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or email…"
        />
        <select
          value={isBlocked}
          onChange={(e) => { setIsBlocked(e.target.value); setPage(1); }}
          className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none"
        >
          <option value="">All Users</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
      </div>

      <Card>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={refetch} /> : users.length === 0 ? (
          <Empty />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                  <th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="text-eb-cream font-medium">{u.name}</td>
                    <td className="font-mono text-xs text-eb-muted">{u.email}</td>
                    <td className="font-mono text-xs">{u.phone || "—"}</td>
                    <td>
                      <span className={u.role === "admin" ? "badge badge-terra" : "badge badge-muted"}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="font-mono text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <span className={u.isBlocked ? "badge badge-red" : "badge badge-green"}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Btn size="sm" variant="ghost" onClick={() => openUser(u)}>
                          <RiEyeLine size={14} />
                        </Btn>
                        <Btn
                          size="sm"
                          variant={u.isBlocked ? "success" : "danger"}
                          onClick={() => handleToggleBlock(u)}
                          disabled={blocking === u._id}
                        >
                          {u.isBlocked ? <RiCheckLine size={14} /> : <RiProhibitedLine size={14} />}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="px-4 pb-4">
              <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* User Detail Modal */}
      <Modal open={!!viewUser} onClose={() => { setViewUser(null); setUserDetail(null); }} title="User Details" width="max-w-2xl">
        {viewUser && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg text-eb-cream">{viewUser.name}</h3>
                <p className="text-sm text-eb-muted font-mono">{viewUser.email}</p>
                {viewUser.phone && <p className="text-xs text-eb-muted font-mono mt-0.5">{viewUser.phone}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={viewUser.isBlocked ? "badge badge-red" : "badge badge-green"}>
                  {viewUser.isBlocked ? "Blocked" : "Active"}
                </span>
                <Btn
                  size="sm"
                  variant={viewUser.isBlocked ? "success" : "danger"}
                  onClick={() => handleToggleBlock(viewUser)}
                  disabled={blocking === viewUser._id}
                >
                  {viewUser.isBlocked ? "Unblock User" : "Block User"}
                </Btn>
              </div>
            </div>

            {/* Addresses */}
            {viewUser.addresses?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-2">Saved Addresses</h4>
                <div className="space-y-2">
                  {viewUser.addresses.map((a, i) => (
                    <div key={i} className="bg-eb-surface rounded-lg p-3 text-xs text-eb-muted">
                      {a.address}, {a.city}, {a.state} — {a.pincode}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders */}
            {detailLoading ? (
              <Loader rows={3} />
            ) : userDetail?.orders?.length > 0 ? (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-2">
                  Order History ({userDetail.orders.length})
                </h4>
                <Table>
                  <thead>
                    <tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {userDetail.orders.map((o) => (
                      <tr key={o._id}>
                        <td className="font-mono text-xs text-eb-terra">#{o._id?.slice(-6).toUpperCase()}</td>
                        <td className="font-mono">{fmtCurrency(o.total)}</td>
                        <td><span className={statusClass(o.status)}>{fmtStatus(o.status)}</span></td>
                        <td className="font-mono text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Empty message="No orders yet" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
