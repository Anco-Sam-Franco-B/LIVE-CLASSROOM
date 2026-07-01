import { useState, useEffect } from 'react';
import { assignmentsAPI } from '../../services/api';
import { FileText, Upload, CheckCircle, Clock, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const loadData = () => {
    assignmentsAPI.getAll()
      .then(({ data }) => setAssignments(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const submitAssignment = async (assignmentId) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      if (file) formData.append('file', file);
      await assignmentsAPI.submit(formData);
      setSelectedAssignment(null);
      setFile(null);
      toast('Assignment submitted!', 'success');
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  const deleteSubmission = async (submissionId) => {
    try {
      await assignmentsAPI.deleteSubmission(submissionId);
      toast('Submission deleted', 'success');
      loadData();
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete submission', 'error'); }
  };

  if (loading) return <><PageHeader title="Assignments" /><ListSkeleton count={5} /></>;

  return (
    <div>
      <PageHeader title="Assignments" description={`${assignments.length} assignments`} />
      {assignments.length === 0 ? (
        <EmptyState icon={FileText} title="No assignments yet" />
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="neon-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0">
                  <FileText className="mt-1 shrink-0" size={20} style={{ color: 'var(--neon)' }} />
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{assignment.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{assignment.course_title}</p>
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center space-x-1"><Clock size={14} /><span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}</span></span>
                      <span>Points: {assignment.total_points}</span>
                      <span>Pass: {assignment.passing_points}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedAssignment(assignment)} className="neon-btn text-sm shrink-0 ml-4">Submit</button>
              </div>
              {assignment.submission && (
                <div className="mt-3 pt-3 flex items-center justify-between text-sm" style={{ borderTop: '1px solid var(--border-neon)' }}>
                  <div className="flex items-center space-x-2">
                    {assignment.submission.status === 'graded' ? (
                      <span className="flex items-center space-x-1" style={{ color: 'var(--neon)' }}><CheckCircle size={16} /><span>Graded: {assignment.submission.points_earned}/{assignment.total_points}</span></span>
                    ) : (
                      <span className="flex items-center space-x-1" style={{ color: '#ffc800' }}><Upload size={16} /><span>Submitted - awaiting grade</span></span>
                    )}
                  </div>
                  <button onClick={() => setConfirm({ action: () => deleteSubmission(assignment.submission.id), title: 'Delete Submission', message: 'Delete your submission? This cannot be undone.' })} style={{ color: '#ff3232' }} onMouseEnter={e => e.currentTarget.style.color = '#ff6666'} onMouseLeave={e => e.currentTarget.style.color = '#ff3232'}><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAssignment(null)}>
            <div className="rounded-xl max-w-lg w-full p-6" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Submit: {selectedAssignment.title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Upload File</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="neon-input" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Allowed: {selectedAssignment.file_types || 'PDF, DOC, ZIP'}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => submitAssignment(selectedAssignment.id)} disabled={submitting || !file} className={`neon-btn flex-1 ${submitting ? 'btn-loading' : ''}`}>{submitting ? 'Submitting...' : 'Submit Assignment'}</button>
                <button onClick={() => setSelectedAssignment(null)} className="neon-btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
