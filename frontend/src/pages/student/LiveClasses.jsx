import { useState, useEffect } from 'react';
import { meetingsAPI } from '../../services/api';
import { Video, Clock, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import LiveKitMeeting from '../../components/LiveKitMeeting';

export default function LiveClasses() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState(null);

  useEffect(() => {
    meetingsAPI.getAll()
      .then(({ data }) => setMeetings(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (meeting) => {
    setActiveMeeting(meeting);
  };

  if (activeMeeting) {
    return <LiveKitMeeting meetingId={activeMeeting.id} onLeave={() => setActiveMeeting(null)} />;
  }

  if (loading) return <><PageHeader title="Live Classes" /><ListSkeleton count={5} /></>;

  return (
    <div>
      <PageHeader title="Live Classes" description={`${meetings.length} class${meetings.length !== 1 ? 'es' : ''}`} />
      {meetings.length === 0 ? (
        <EmptyState icon={Video} title="No live classes scheduled" description="Check back later for upcoming classes." />
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="neon-card flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,50,50,0.1)' }}>
                  <Video size={24} style={{ color: '#ff3232' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{meeting.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{meeting.course_title}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center space-x-1"><Calendar size={14} /><span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span></span>
                    <span className="flex items-center space-x-1"><Clock size={14} /><span>{meeting.duration_minutes} min</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleJoin(meeting)} className="neon-btn">
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
