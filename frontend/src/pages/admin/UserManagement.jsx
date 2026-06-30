import { useState, useEffect, useCallback } from 'react';
import { usersAPI, adminAPI } from '../../services/api';
import { Lock, Unlock, Trash2, Check, X, Edit3, UserCog, Plus, UserPlus, Key, Mail, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DebouncedInput from '../../components/DebouncedInput';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { Input, Select, FieldSet } from '../../components/FormFields';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', roleId: 4, isActive: true });
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      usersAPI.getAll({ page, limit, search, role: roleFilter || undefined }),
      adminAPI.getRoles(),
    ])
      .then(([usersRes, rolesRes]) => {
        setUsers(usersRes.data.data);
        setTotal(usersRes.data.total || usersRes.data.data.length);
        setRoles(rolesRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', roleId: 4, isActive: true });

  const openAdd = () => {
    setEditTarget(null);
    resetForm();
    setShowModal('add');
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setForm({ firstName: u.first_name || '', lastName: u.last_name || '', email: u.email || '', password: '', phone: u.phone || '', roleId: u.role_id, isActive: u.is_active });
    setShowModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        const payload = { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, roleId: form.roleId, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        await usersAPI.updateUser(editTarget.id, payload);
        setToast({ type: 'success', message: 'User updated' });
      } else {
        await usersAPI.createUser(form);
        setToast({ type: 'success', message: 'User created' });
      }
      setShowModal(null);
      load();
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const toggleLock = async (id, isLocked) => {
    try {
      if (isLocked) await usersAPI.unlockUser(id);
      else await usersAPI.lockUser(id, {});
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_locked: !isLocked } : u));
      setToast({ type: 'success', message: isLocked ? 'User unlocked' : 'User locked' });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed' }); }
  };

  const deleteUser = async (id) => {
    try {
      await usersAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setToast({ type: 'success', message: 'User deleted' });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete' }); }
  };

  const startEditRole = (user) => {
    setEditingRole(user.id);
    setSelectedRoleId(user.role_id);
  };

  const saveRole = async (userId) => {
    try {
      await usersAPI.updateUser(userId, { roleId: selectedRoleId });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role_id: selectedRoleId, role_name: roles.find(r => r.id === selectedRoleId)?.name, role_slug: roles.find(r => r.id === selectedRoleId)?.slug } : u));
      setEditingRole(null);
      setToast({ type: 'success', message: 'Role updated' });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed' }); }
  };

  const cancelEdit = () => { setEditingRole(null); setSelectedRoleId(null); };
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <PageHeader title="User Management" description={`${total} users found`} actions={
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><UserPlus size={18} /><span>Add User</span></button>
      } />

      <div className="flex flex-wrap gap-4 mb-6">
        <DebouncedInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search users..." className="flex-1 min-w-[200px] input-field" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Roles</option>
          {roles.map(r => <option key={r.id} value={r.slug}>{r.name}</option>)}
        </select>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { if (!saving) setShowModal(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {editTarget ? <><Edit3 size={20} className="text-indigo-500" /> Edit User</> : <><UserPlus size={20} className="text-indigo-500" /> Add User</>}
              </h2>
              <button onClick={() => setShowModal(null)} disabled={saving} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                <Input label="Last Name" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label={editTarget ? 'New Password (leave blank to keep current)' : 'Password'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editTarget} minLength={8} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Select label="Role" required value={form.roleId} onChange={e => setForm({ ...form, roleId: Number(e.target.value) })}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
              {editTarget && (
                <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-gray-700 font-medium">Account Active</span>
                </label>
              )}
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save size={16} />{saving ? 'Saving...' : editTarget ? 'Update User' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowModal(null)} disabled={saving} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <TableSkeleton rows={8} cols={6} /> : users.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" description="Try adjusting your search or filter." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Role</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Verified</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">{u.first_name?.[0]}{u.last_name?.[0]}</span>
                        </div>
                        <span className="font-medium text-gray-900">{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      {editingRole === u.id ? (
                        <div className="flex items-center justify-center space-x-1">
                          <select value={selectedRoleId} onChange={e => setSelectedRoleId(Number(e.target.value))} className="text-xs border border-gray-300 rounded px-2 py-1" autoFocus>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                          <button onClick={() => saveRole(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={14} /></button>
                        </div>
                      ) : (
                        <span className="badge badge-info">{u.role_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                      {u.is_locked && <span className="badge badge-danger ml-1">Locked</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>{u.is_verified ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        {editingRole !== u.id && (
                          <button onClick={() => startEditRole(u)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50" title="Change role">
                            <Edit3 size={15} />
                          </button>
                        )}
                        <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50" title="Edit user">
                          <UserCog size={15} />
                        </button>
                        <button onClick={() => toggleLock(u.id, u.is_locked)} className={`p-2 rounded-lg ${u.is_locked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`} title={u.is_locked ? 'Unlock' : 'Lock'}>
                          {u.is_locked ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>
                        <button onClick={() => setConfirm({ action: () => deleteUser(u.id), title: 'Delete User', message: `Are you sure you want to delete ${u.first_name} ${u.last_name}? This cannot be undone.` })} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {confirm && (
        <ConfirmDialog title={confirm.title} message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}
