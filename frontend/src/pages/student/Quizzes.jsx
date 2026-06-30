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
            <div key={quiz.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0">
                  <ClipboardList className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{quiz.course_title}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      {quiz.time_limit_minutes > 0 && <span className="flex items-center space-x-1"><Clock size={14} /><span>{quiz.time_limit_minutes} min</span></span>}
                      <span>Pass: {quiz.passing_score}%</span>
                      <span>Max: {quiz.max_attempts} attempt{quiz.max_attempts > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/student/quizzes/${quiz.id}/attempt`} className="btn-primary text-sm shrink-0 ml-4">Start Quiz</Link>
              </div>
              {quiz.attempts?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">{quiz.attempts.length} attempt{quiz.attempts.length > 1 ? 's' : ''}</p>
                  {quiz.attempts.map(a => (
                    <div key={a.id} className="flex items-center space-x-2 text-sm mt-1">
                      {a.is_passed ? <CheckCircle className="text-green-500" size={14} /> : <Clock className="text-orange-500" size={14} />}
                      <span>Attempt {a.attempt_number}: {a.score?.toFixed(0)}% - {a.is_passed ? 'Passed' : 'Failed'}</span>
                      <Link to={`/student/quizzes/results/${a.id}`} className="text-indigo-600 hover:underline ml-2">View</Link>
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
