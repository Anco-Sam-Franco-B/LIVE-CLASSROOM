import { useState, useEffect, useCallback } from 'react';
import { useParticipants } from '@livekit/components-react';
import { meetingsAPI } from '../services/api';
import { Check, X, Clock, AlertCircle, Loader2, Users, FileSpreadsheet } from 'lucide-react';

const STATUSES = ['present', 'absent', 'late', 'excused'];

const STATUS_ICON = {
  present: Check,
  absent: X,
  late: Clock,
  excused: AlertCircle,
};

const STATUS_COLOR = {
  present: 'text-green-400 bg-green-500/10',
  absent: 'text-red-400 bg-red-500/10',
  late: 'text-amber-400 bg-amber-500/10',
  excused: 'text-blue-400 bg-blue-500/10',
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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-colors group">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
        {initials || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{name}</p>
        {duration && <p className="text-gray-500 text-[10px]">{duration} attended</p>}
      </div>
      {att?.check_in_time && (
        <span className="text-[10px] text-gray-500 hidden sm:block">
          {new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      <div className="flex items-center gap-1">
        {STATUSES.map((s) => {
          const Icon = STATUS_ICON[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              onClick={() => onToggleStatus(student.id, s)}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? `${STATUS_COLOR[s]} ring-1 ring-current`
                  : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700/50'
              }`}
              title={s.charAt(0).toUpperCase() + s.slice(1)}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
      {att?.marked_by && att.status !== 'present' && (
        <span className="text-[9px] text-gray-600 italic">manual</span>
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

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleToggleStatus = async (studentId, status) => {
    setSaving(studentId);
    try {
      await meetingsAPI.markAttendance(meetingId, { studentId, status });
      setStudents(prev => prev.map(s =>
        s.id === studentId
          ? { ...s, attendance: { ...(s.attendance || {}), status, marked_by: true } }
          : s
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
    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800/60 w-full sm:w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-indigo-400" />
          <h3 className="text-white text-sm font-medium">Attendance</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800/40 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {enrolledCount} enrolled
        </span>
        <span className="flex items-center gap-1 text-green-400">
          <Check size={12} />
          {presentCount} present
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">No enrolled students found</p>
          </div>
        ) : (
          students.map((s) => (
            <AttendanceRow
              key={s.id}
              student={s}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
