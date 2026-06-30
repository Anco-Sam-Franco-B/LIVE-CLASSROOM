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
            <div key={assignment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0">
                  <FileText className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">{assignment.course_title}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1"><Clock size={14} /><span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}</span></span>
                      <span>Points: {assignment.total_points}</span>
                      <span>Pass: {assignment.passing_points}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedAssignment(assignment)} className="btn-primary text-sm shrink-0 ml-4">Submit</button>
              </div>
              {assignment.submission && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {assignment.submission.status === 'graded' ? (
                      <span className="flex items-center space-x-1 text-green-600"><CheckCircle size={16} /><span>Graded: {assignment.submission.points_earned}/{assignment.total_points}</span></span>
                    ) : (
                      <span className="flex items-center space-x-1 text-orange-600"><Upload size={16} /><span>Submitted - awaiting grade</span></span>
                    )}
                  </div>
                  <button onClick={() => setConfirm({ action: () => deleteSubmission(assignment.submission.id), title: 'Delete Submission', message: 'Delete your submission? This cannot be undone.' })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAssignment(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit: {selectedAssignment.title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="input-field" />
                <p className="text-xs text-gray-500 mt-1">Allowed: {selectedAssignment.file_types || 'PDF, DOC, ZIP'}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => submitAssignment(selectedAssignment.id)} disabled={submitting || !file} className={`btn-primary flex-1 ${submitting ? 'btn-loading' : ''}`}>{submitting ? 'Submitting...' : 'Submit Assignment'}</button>
                <button onClick={() => setSelectedAssignment(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
