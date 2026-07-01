import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#00ff41', sortOrder: 0 });

  const load = useCallback(() => {
    setLoading(true);
    categoriesAPI.getAll()
      .then(({ data }) => setCategories(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ name: '', description: '', icon: '', color: '#00ff41', sortOrder: 0 });

  const openAdd = () => {
    setEditTarget(null);
    resetForm();
    setShowModal('add');
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#00ff41', sortOrder: cat.sort_order || 0 });
    setShowModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await categoriesAPI.update(editTarget.id, form);
        setToast({ type: 'success', message: 'Category updated' });
      } else {
        await categoriesAPI.create(form);
        setToast({ type: 'success', message: 'Category created' });
      }
      setShowModal(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    setConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? Courses in this category will have their category removed.`,
      onConfirm: async () => {
        try {
          await categoriesAPI.delete(cat.id);
          setToast({ type: 'success', message: 'Category deleted' });
          load();
        } catch (err) {
          setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete' });
        }
        setConfirm(null);
      },
    });
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Categories" description="Manage course categories">
        <button onClick={openAdd} className="neon-btn"><Plus size={18} /> Add Category</button>
      </PageHeader>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create your first category to organize courses" action={<button onClick={openAdd} className="neon-btn"><Plus size={18} /> Add Category</button>} />
      ) : (
        <div className="neon-card overflow-hidden">
          <table className="w-full neon-table">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-neon)', background: 'var(--bg-dark)' }}>
                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
                <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Courses</th>
                <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Order</th>
                <th className="text-right p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b" style={{ borderColor: 'var(--border-neon)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: cat.color || '#00ff41' }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{cat.description || '\u2014'}</td>
                  <td className="p-3 text-center text-sm">{cat.course_count || 0}</td>
                  <td className="p-3 text-center text-sm">{cat.sort_order || 0}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.05)';e.currentTarget.style.color='var(--neon)'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}} title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg" style={{ color: '#ff3232' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,50,50,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(null)}>
          <div className="rounded-xl shadow-xl w-full max-w-lg p-6" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editTarget ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.05)';e.currentTarget.style.color='var(--text-primary)'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="neon-input" placeholder="e.g., Programming" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="neon-input" placeholder="Brief description of this category" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" style={{ border: '1px solid var(--border-neon)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{form.color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="neon-input" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(null)} className="neon-btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className={`neon-btn ${saving ? 'btn-loading' : ''}`}>
                  {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
