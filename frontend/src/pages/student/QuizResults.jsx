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

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;
  if (!result) return <div className="text-center py-12 text-gray-500">Result not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card text-center mb-8">
        <div className={`w-20 h-20 ${result.is_passed ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {result.is_passed ? <Award className="text-green-600" size={40} /> : <XCircle className="text-red-600" size={40} />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{result.is_passed ? 'Congratulations!' : 'Not Passed'}</h1>
        <p className="text-gray-600 mb-6">{result.quiz_title}</p>
        <div className="text-5xl font-bold text-indigo-600 mb-2">{Number(result.score ?? 0).toFixed(0)}%</div>
        <p className="text-gray-500">Score: {result.earned_points}/{result.total_points} points</p>
      </div>

      {result.answers?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Review Answers</h2>
          {result.answers.map((a, i) => (
            <div key={i} className={`card border-l-4 ${a.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex items-start space-x-3">
                {a.isCorrect ? <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} /> : <XCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />}
                <div>
                  <p className="font-medium text-gray-900">{a.questionText}</p>
                  <p className="text-sm text-gray-600 mt-1">Your answer: {a.userAnswer || 'No answer'}</p>
                  {!a.isCorrect && <p className="text-sm text-green-600 mt-1">Correct answer: {a.correctAnswer}</p>}
                  {a.explanation && <p className="text-sm text-gray-500 mt-2">{a.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/student/quizzes" className="btn-primary">Back to Quizzes</Link>
      </div>
    </div>
  );
}
