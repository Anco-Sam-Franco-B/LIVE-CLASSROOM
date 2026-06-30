import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { BookOpen, Clock, Percent, CreditCard, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getMyCourses()
      .then(({ data }) => setCourses(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="My Courses" /><CardSkeleton count={6} /></>;

  const needsPayment = (c) => !c.payment_id && c.price > 0;

  return (
    <div>
      <PageHeader title="My Courses" actions={<>
        <Link to="/student/payment" className="btn-secondary flex items-center space-x-2"><CreditCard size={18} /><span>Payments</span></Link>
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
      </>} />
      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Not enrolled in any courses" description="Explore our catalog and start learning today." action={<Link to="/courses" className="btn-primary">Explore Courses</Link>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow overflow-hidden p-0">
              <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop'} alt={course.title} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.teacher_name}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center space-x-1"><Percent size={14} /><span>{Number(course.progress || 0).toFixed(0)}%</span></span>
                  <span className="flex items-center space-x-1"><Clock size={14} /><span>{course.completed_lessons}/{course.total_lessons} lessons</span></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${course.progress || 0}%` }} />
                </div>
                {needsPayment(course) ? (
                  <Link to="/student/payment" className="btn-warning w-full flex items-center justify-center space-x-2">
                    <CreditCard size={18} /><span>Complete Payment - UGX {parseFloat(course.price).toLocaleString()}</span>
                  </Link>
                ) : (
                  <Link to={`/student/courses/${course.course_id}/learn`} className="btn-primary w-full flex items-center justify-center space-x-2">
                    <ExternalLink size={18} /><span>Continue Learning</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}