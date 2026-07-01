import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizzesAPI.getAll()
      .then(({ data }) => setQuizzes(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Quizzes" /><ListSkeleton count={5} /></>;

  return (
    <div>
      <PageHeader title="Quizzes" description={`${quizzes.length} available`} />
      {quizzes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No quizzes yet" />
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="neon-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0">
                  <ClipboardList className="mt-1 shrink-0" size={20} style={{ color: 'var(--neon)' }} />
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h3>
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{quiz.course_title}</p>
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {quiz.time_limit_minutes > 0 && <span className="flex items-center space-x-1"><Clock size={14} /><span>{quiz.time_limit_minutes} min</span></span>}
                      <span>Pass: {quiz.passing_score}%</span>
                      <span>Max: {quiz.max_attempts} attempt{quiz.max_attempts > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/student/quizzes/${quiz.id}/attempt`} className="neon-btn text-sm shrink-0 ml-4">Start Quiz</Link>
              </div>
              {quiz.attempts?.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-neon)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{quiz.attempts.length} attempt{quiz.attempts.length > 1 ? 's' : ''}</p>
                  {quiz.attempts.map(a => (
                    <div key={a.id} className="flex items-center space-x-2 text-sm mt-1">
                      {a.is_passed ? <CheckCircle size={14} style={{ color: 'var(--neon)' }} /> : <Clock size={14} style={{ color: '#ffc800' }} />}
                      <span>Attempt {a.attempt_number}: {a.score?.toFixed(0)}% - {a.is_passed ? 'Passed' : 'Failed'}</span>
                      <Link to={`/student/quizzes/results/${a.id}`} className="ml-2" style={{ color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>View</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
