import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, Plus, Trash2, Edit3, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingPerms, setEditingPerms] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', slug: '' });
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const loadData = () => {
    Promise.all([adminAPI.getRoles(), adminAPI.getPermissions()])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data.data);
        setPermissions(permsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const startEditPerms = (role) => {
    setEditingPerms(role.id);
    setSelectedPerms(role.permissions?.map(p => p.id) || []);
  };

  const togglePerm = (permId) => {
    setSelectedPerms(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
  };

  const savePerms = async (roleId) => {
    try {
      await adminAPI.updateRolePermissions(roleId, selectedPerms);
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: [...permissions].flatMap(m => m.perms || []).filter(p => selectedPerms.includes(p.id)) } : r));
      setEditingPerms(null);
      toast('Permissions updated', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteRole = async (id) => {
    try {
      await adminAPI.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
      toast('Role deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const createRole = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createRole(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', description: '', slug: '' });
      toast('Role created!', 'success');
      loadData();
    } catch (err) { toast(err.response?.data?.message || 'Failed to create role', 'error'); }
  };

  if (loading) return <><PageHeader title="Roles & Permissions" /><CardSkeleton count={3} /></>;

  return (
    <div>
      <PageHeader title="Roles & Permissions" description={`${roles.length} roles configured`} actions={<button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2"><Plus size={20} /><span>Create Role</span></button>} />
      {roles.length === 0 ? (
        <EmptyState icon={Shield} title="No roles found" />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="text-indigo-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role.is_system && <span className="badge badge-info">System</span>}
                  {!role.is_system && (
                    <>
                      <button onClick={() => startEditPerms(role)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50" title="Edit permissions"><Edit3 size={14} /></button>
                      <button onClick={() => setConfirm({ action: () => deleteRole(role.id), title: 'Delete Role', message: `Delete the "${role.name}" role?` })} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {Object.entries(permissions).map(([module, perms]) => {
                  const isEditing = editingPerms === role.id;
                  return (
                    <div key={module}>
                      <p className="text-xs font-medium text-gray-500 uppercase mt-3 mb-1">{module}</p>
                      <div className="flex flex-wrap gap-1">
                        {perms.map(p => (
                          isEditing ? (
                            <button key={p.id} onClick={() => togglePerm(p.id)} className={`text-xs px-2 py-0.5 rounded border ${selectedPerms.includes(p.id) ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {p.name}
                            </button>
                          ) : (
                            <span key={p.id} className={`text-xs px-2 py-0.5 rounded ${role.permissions?.find(rp => rp.id === p.id) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.name}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  );
                })}
                {editingPerms === role.id && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => savePerms(role.id)} className="btn-primary text-xs py-1.5 px-3">Save</button>
                    <button onClick={() => setEditingPerms(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Role</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={createRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input type="text" required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="input-field" placeholder="e.g., Moderator" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" required value={createForm.slug} onChange={e => setCreateForm({ ...createForm, slug: e.target.value })} className="input-field" placeholder="e.g., moderator" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="input-field" placeholder="Role description" />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Create Role</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}