import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await quizzesAPI.getById(quizId);
        setQuiz(data.data);
        if (data.data.time_limit_minutes > 0) {
          setTimeLeft(data.data.time_limit_minutes * 60);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId, answer,
      }));
      const { data } = await quizzesAPI.submitAttempt({
        attemptId: attempt?.id,
        answers: formattedAnswers,
        timeSpentSeconds: quiz.time_limit_minutes * 60 - (timeLeft || 0),
      });
      navigate(`/student/quizzes/results/${data.data.attemptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
    }
  };

  const startAttempt = async () => {
    try {
      const { data } = await quizzesAPI.startAttempt(quizId);
      setAttempt(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--neon)', borderTopColor: 'transparent' }} /></div>;

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{quiz?.title}</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>{quiz?.description}</p>
        <button onClick={startAttempt} className="neon-btn text-lg px-12">Start Quiz</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {timeLeft !== null && (
        <div className="text-center mb-6">
          <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}
      <div className="space-y-6">
        {quiz?.questions?.map((q, i) => (
          <div key={q.id} className="neon-card">
            <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{i + 1}. {q.question_text}</h3>
            {q.options?.map((opt, oi) => (
              <label key={oi} className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer" onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} style={{ accentColor: 'var(--neon)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button onClick={handleSubmit} className="neon-btn px-12">Submit Answers</button>
      </div>
    </div>
  );
}
