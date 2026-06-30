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
            <div key={meeting.id} className="card flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-500">{meeting.course_title}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1"><Calendar size={14} /><span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span></span>
                    <span className="flex items-center space-x-1"><Clock size={14} /><span>{meeting.duration_minutes} min</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleJoin(meeting)} className="btn-primary">
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
