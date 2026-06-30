import { useState, useEffect } from 'react';
import { certificateTemplatesAPI, adminAPI } from '../../services/api';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, X, Shield, Calendar, Clock, Award, User, BookOpen } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { Input, Select, Textarea, Checkbox, ColorPicker } from '../../components/FormFields';

function CertificatePreview({ template, signatureUrl, authorityName, onClose }) {
  const previewData = {
    studentName: 'John Doe',
    courseName: 'Full Stack Web Development',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    grade: 'A',
    duration: '120 hours',
    certNumber: 'CERT-2024-00001',
    teacherName: 'Jane Smith',
  };

  const qrValue = JSON.stringify({
    cert: previewData.certNumber,
    student: previewData.studentName,
    course: previewData.courseName,
    issued: previewData.date,
    grade: previewData.grade,
    verify: `https://liveclasscode.com/certificates/verify/${previewData.certNumber}`,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Certificate Preview: {template.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        <div className="p-8 flex justify-center bg-gray-50">
          <div
            className="relative w-full max-w-3xl aspect-[1.4/1] rounded-xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: '#fff',
              fontFamily: template.font_family,
              background: `linear-gradient(135deg, #ffffff 0%, ${template.accent_color}05 50%, #ffffff 100%)`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${template.accent_color}, ${template.accent_color}88, ${template.accent_color})` }} />

            <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 rounded-tl-xl" style={{ borderColor: `${template.accent_color}40` }} />
            <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 rounded-tr-xl" style={{ borderColor: `${template.accent_color}40` }} />
            <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 rounded-bl-xl" style={{ borderColor: `${template.accent_color}40` }} />
            <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 rounded-br-xl" style={{ borderColor: `${template.accent_color}40` }} />

            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award size={320} style={{ color: template.accent_color }} />
            </div>

            <div className="relative h-full flex flex-col items-center justify-center px-16 py-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: template.accent_color }} />
                <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: template.accent_color }}>Certificate of Completion</span>
                <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: template.accent_color }} />
              </div>

              <h1 className="text-4xl font-bold tracking-tight mb-6" style={{ color: template.font_color }}>
                Certificate of <span style={{ color: template.accent_color }}>Achievement</span>
              </h1>

              <p className="text-sm text-gray-400 mb-2">This is to certify that</p>
              {template.show_student_name && (
                <h2 className="text-2xl font-bold mb-3" style={{ color: template.font_color }}>
                  {previewData.studentName}
                </h2>
              )}
              <p className="text-sm text-gray-400 mb-2">has successfully completed the course</p>
              {template.show_course_name && (
                <h3 className="text-xl font-semibold mb-6 px-8 py-2 rounded-full" style={{ color: '#fff', backgroundColor: template.accent_color }}>
                  {previewData.courseName}
                </h3>
              )}

              <div className="flex items-center justify-center gap-6 text-xs mb-6">
                {template.show_date && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={14} style={{ color: template.accent_color }} />
                    <span>{previewData.date}</span>
                  </div>
                )}
                {template.show_grade && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Award size={14} style={{ color: template.accent_color }} />
                    <span>Grade: <strong>{previewData.grade}</strong></span>
                  </div>
                )}
                {template.show_duration && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} style={{ color: template.accent_color }} />
                    <span>{previewData.duration}</span>
                  </div>
                )}
              </div>

              {template.custom_text && (
                <p className="text-xs italic text-gray-400 mb-6 max-w-lg text-center leading-relaxed">{template.custom_text}</p>
              )}

              <div className="absolute bottom-8 left-16 right-16 flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                    <Shield size={12} style={{ color: template.accent_color }} />
                    <span>ID: {previewData.certNumber}</span>
                  </div>
                  {signatureUrl ? (
                    <div className="flex flex-col items-start gap-1">
                      <img src={signatureUrl} alt="Authorized Signature" className="h-10 object-contain" style={{ filter: 'brightness(0.6)' }} />
                      <div className="w-32 h-0.5" style={{ backgroundColor: template.accent_color }} />
                      <span className="text-[10px] text-gray-400">{authorityName || 'Authorized Signature'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-0.5" style={{ backgroundColor: template.accent_color }} />
                      <span className="text-[10px] text-gray-400">Authorized Signature</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <QRCodeSVG value={qrValue} size={56} level="M" fgColor={template.font_color} />
                  </div>
                  <span className="text-[9px] text-gray-300 tracking-wider">SCAN TO VERIFY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200 text-xs text-gray-400">
          <span>Font: {template.font_family}</span>
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: template.accent_color }} />
          <span style={{ color: template.font_color }}>■ {template.font_color}</span>
        </div>
      </div>
    </div>
  );
}

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [authorityName, setAuthorityName] = useState('');
  const [form, setForm] = useState({ name: '', description: '', fontFamily: 'Arial', fontColor: '#1a1a2e', accentColor: '#4f46e5', showStudentName: true, showCourseName: true, showDate: true, showGrade: true, showDuration: true, customText: '' });

  const load = () => {
    setLoading(true);
    certificateTemplatesAPI.getAll().then(({ data }) => setTemplates(data.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => {
      setSignatureUrl(data.data?.certificate_signature_url || '');
      setAuthorityName(data.data?.certificate_authority_name || '');
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await certificateTemplatesAPI.update(editing, form); setToast({ type: 'success', message: 'Template updated' }); }
      else { await certificateTemplatesAPI.create(form); setToast({ type: 'success', message: 'Template created' }); }
      setShowForm(false); setEditing(null);
      setForm({ name: '', description: '', fontFamily: 'Arial', fontColor: '#1a1a2e', accentColor: '#4f46e5', showStudentName: true, showCourseName: true, showDate: true, showGrade: true, showDuration: true, customText: '' });
      load();
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  const handleEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, description: t.description || '', fontFamily: t.font_family, fontColor: t.font_color, accentColor: t.accent_color, showStudentName: t.show_student_name, showCourseName: t.show_course_name, showDate: t.show_date, showGrade: t.show_grade, showDuration: t.show_duration, customText: t.custom_text || '' });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try { await certificateTemplatesAPI.delete(confirmDelete); setToast({ type: 'success', message: 'Template deleted' }); setConfirmDelete(null); load(); }
    catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  const toggleActive = async (t) => {
    try { await certificateTemplatesAPI.update(t.id, { isActive: !t.is_active }); load(); }
    catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  if (loading) return <><PageHeader title="Certificate Templates" /><ListSkeleton count={5} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {preview && <CertificatePreview template={preview} signatureUrl={signatureUrl} authorityName={authorityName} onClose={() => setPreview(null)} />}

      <PageHeader title="Certificate Templates" description="Design and manage certificate layouts" actions={!showForm && <button onClick={() => { setEditing(null); setForm({ name: '', description: '', fontFamily: 'Arial', fontColor: '#1a1a2e', accentColor: '#4f46e5', showStudentName: true, showCourseName: true, showDate: true, showGrade: true, showDuration: true, customText: '' }); setShowForm(true); }} className="btn-primary flex items-center space-x-2"><Plus size={20} /><span>New Template</span></button>} />

      {showForm && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Template' : 'Create Template'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select label="Font Family" value={form.fontFamily} onChange={e => setForm({ ...form, fontFamily: e.target.value })}>
                <option value="Arial">Arial</option><option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option><option value="Helvetica">Helvetica</option>
                <option value="Courier New">Courier New</option><option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option><option value="Trebuchet MS">Trebuchet MS</option>
              </Select>
            </div>
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid md:grid-cols-3 gap-4">
              <ColorPicker label="Font Color" value={form.fontColor} onChange={e => setForm({ ...form, fontColor: e.target.value })} />
              <ColorPicker label="Accent Color" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show on Certificate</label>
              <div className="flex flex-wrap gap-4">
                {[{ key: 'showStudentName', label: 'Student Name' }, { key: 'showCourseName', label: 'Course Name' }, { key: 'showDate', label: 'Date' }, { key: 'showGrade', label: 'Grade' }, { key: 'showDuration', label: 'Duration' }].map(({ key, label }) => (
                  <Checkbox key={key} label={label} checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                ))}
              </div>
            </div>
            <Textarea label="Custom Text" value={form.customText} onChange={e => setForm({ ...form, customText: e.target.value })} rows={2} placeholder="Optional custom text to appear on certificate" />
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Template</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 ? (
        <EmptyState icon={FileText} title="No templates yet" description="Create your first certificate template." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.id} className={`card relative ${!t.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-indigo-600" size={20} />
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setPreview(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => toggleActive(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title={t.is_active ? 'Deactivate' : 'Activate'}>{t.is_active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600" title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => setConfirmDelete(t.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              {t.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.description}</p>}
              <div className="flex items-center space-x-3 mt-3 text-xs text-gray-400">
                <span>Font: {t.font_family}</span>
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: t.accent_color }} />
                <span className={`px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title="Delete Template?" message="Are you sure? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
