import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export default function QuizResults() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizzesAPI.getResults(attemptId)
      .then(({ data }) => setResult(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--neon)', borderTopColor: 'transparent' }} /></div>;
  if (!result) return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Result not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="neon-card text-center mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: result.is_passed ? 'rgba(0,255,65,0.1)' : 'rgba(255,50,50,0.1)' }}>
          {result.is_passed ? <Award size={40} style={{ color: 'var(--neon)' }} /> : <XCircle size={40} style={{ color: '#ff3232' }} />}
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{result.is_passed ? 'Congratulations!' : 'Not Passed'}</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{result.quiz_title}</p>
        <div className="text-5xl font-bold mb-2" style={{ color: 'var(--neon)' }}>{Number(result.score ?? 0).toFixed(0)}%</div>
        <p style={{ color: 'var(--text-secondary)' }}>Score: {result.earned_points}/{result.total_points} points</p>
      </div>

      {result.answers?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Review Answers</h2>
          {result.answers.map((a, i) => (
            <div key={i} className="neon-card" style={{ borderLeft: `4px solid ${a.isCorrect ? 'var(--neon)' : '#ff3232'}` }}>
              <div className="flex items-start space-x-3">
                {a.isCorrect ? <CheckCircle className="mt-1 flex-shrink-0" size={18} style={{ color: 'var(--neon)' }} /> : <XCircle className="mt-1 flex-shrink-0" size={18} style={{ color: '#ff3232' }} />}
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.questionText}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your answer: {a.userAnswer || 'No answer'}</p>
                  {!a.isCorrect && <p className="text-sm mt-1" style={{ color: 'var(--neon)' }}>Correct answer: {a.correctAnswer}</p>}
                  {a.explanation && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{a.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/student/quizzes" className="neon-btn">Back to Quizzes</Link>
      </div>
    </div>
  );
}
