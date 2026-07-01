import { useState, useEffect, useCallback } from 'react';
import { useParticipants } from '@livekit/components-react';
import { meetingsAPI } from '../services/api';
import { Check, X, Clock, AlertCircle, Loader2, Users, FileSpreadsheet } from 'lucide-react';

const STATUSES = ['present', 'absent', 'late', 'excused'];

const STATUS_ICON = { present: Check, absent: X, late: Clock, excused: AlertCircle };

const STATUS_COLOR = {
  present: { color: 'var(--neon)', bg: 'rgba(0,255,65,0.1)' },
  absent: { color: '#ff3232', bg: 'rgba(255,50,50,0.1)' },
  late: { color: '#ffc800', bg: 'rgba(255,200,0,0.1)' },
  excused: { color: '#0096ff', bg: 'rgba(0,150,255,0.1)' },
};

function AttendanceRow({ student, onToggleStatus }) {
  const att = student.attendance;
  const status = att?.status || null;
  const initials = (student.first_name?.[0] || '') + (student.last_name?.[0] || '');
  const name = `${student.first_name} ${student.last_name}`;
  const duration = att?.duration_seconds
    ? `${Math.floor(att.duration_seconds / 60)}m ${att.duration_seconds % 60}s`
    : null;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.05)] transition-all duration-300 group">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold shrink-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, var(--neon), var(--neon-dark))' }}>
        {initials || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-200 truncate">{name}</p>
        {duration && <p className="text-[10px] text-gray-500 mt-0.5">{duration} attended</p>}
      </div>
      {att?.check_in_time && (
        <span className="text-[10px] text-gray-500 hidden sm:block font-mono">
          {new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      <div className="flex items-center gap-1">
        {STATUSES.map((s) => {
          const Icon = STATUS_ICON[s];
          const isActive = status === s;
          const c = STATUS_COLOR[s];
          return (
            <button key={s} onClick={() => onToggleStatus(student.id, s)}
              className="p-1.5 rounded-lg transition-all"
              style={isActive ? { background: c.bg, color: c.color, border: `1px solid ${c.color}` } : { color: 'var(--text-muted)' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon size={13} />
            </button>
          );
        })}
      </div>
      {att?.marked_by && att.status !== 'present' && (
        <span className="text-[9px] text-gray-500 italic">manual</span>
      )}
    </div>
  );
}

export default function AttendancePanel({ meetingId, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const participants = useParticipants();

  const loadAttendance = useCallback(async () => {
    try {
      const { data } = await meetingsAPI.getAttendance(meetingId);
      setStudents(data.data || []);
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const handleToggleStatus = async (studentId, status) => {
    setSaving(studentId);
    try {
      await meetingsAPI.markAttendance(meetingId, { studentId, status });
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, attendance: { ...(s.attendance || {}), status, marked_by: true } } : s
      ));
    } catch (e) {
      console.error('Failed to mark attendance:', e);
    } finally {
      setSaving(null);
    }
  };

  const onlineIds = new Set(participants.map(p => p.identity));
  const enrolledCount = students.length;
  const presentCount = students.filter(s => s.attendance?.status === 'present').length;

  return (
    <div className="flex flex-col h-full w-full sm:w-80 bg-[rgba(10,10,15,0.75)] backdrop-blur-2xl border-l border-[rgba(255,255,255,0.06)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-[var(--neon)]" />
          <h3 className="text-sm font-semibold text-white">Attendance</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 text-xs border-b border-[rgba(255,255,255,0.05)] text-gray-400">
        <span className="flex items-center gap-1"><Users size={12} className="text-[var(--neon)]" />{enrolledCount} enrolled</span>
        <span className="flex items-center gap-1 text-[var(--neon)]"><Check size={12} />{presentCount} present</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--neon)' }} />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet size={32} className="mx-auto mb-2 text-gray-600" />
            <p className="text-xs text-gray-500 font-medium">No enrolled students found</p>
          </div>
        ) : (
          students.map((s) => <AttendanceRow key={s.id} student={s} onToggleStatus={handleToggleStatus} />)
        )}
      </div>
    </div>
  );
}
