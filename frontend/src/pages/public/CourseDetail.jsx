import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Star, Clock, Users, BookOpen, CheckCircle, Play } from 'lucide-react';

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await coursesAPI.getBySlug(slug);
        setCourse(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;
  if (!course) return <div className="text-center py-20 text-gray-500">Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.short_description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <span className="flex items-center space-x-1"><Star className="text-yellow-400 fill-current" size={18} /><span className="font-semibold">{parseFloat(course.rating).toFixed(1)}</span> ({course.rating_count} reviews)</span>
            <span className="flex items-center space-x-1"><Users size={18} /><span>{course.enrollment_count} enrolled</span></span>
            <span className="flex items-center space-x-1"><BookOpen size={18} /><span>{course.total_lessons} lessons</span></span>
            <span className="badge badge-info">{course.level}</span>
          </div>

          <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop'} alt={course.title} className="w-full h-72 object-cover rounded-xl mb-8" />

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600">{course.description}</p>
            </section>
            {course.learning_objectives && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-2">
                  {course.learning_objectives.split('\n').filter(Boolean).map((obj, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {course.requirements && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                <div className="space-y-1">
                  {course.requirements.split('\n').filter(Boolean).map((req, i) => (
                    <li key={i} className="text-gray-600 text-sm ml-4">{req}</li>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Course Content</h2>
              {course.modules?.map((mod, i) => (
                <div key={mod.id} className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 font-medium text-gray-900 flex items-center justify-between">
                    <span>Module {i + 1}: {mod.title}</span>
                    <span className="text-sm text-gray-500">{mod.lessons?.length || 0} lessons</span>
                  </div>
                  {mod.lessons?.map((lesson) => (
                    <div key={lesson.id} className="px-4 py-2.5 border-t border-gray-100 flex items-center space-x-3 text-sm text-gray-600">
                      <Play size={14} className="text-gray-400" />
                      <span>{lesson.title}</span>
                      {lesson.duration_minutes > 0 && <span className="ml-auto text-gray-400">{lesson.duration_minutes} min</span>}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="text-3xl font-bold text-indigo-600 mb-6">{course.is_free ? 'Free' : `UGX ${course.price?.toLocaleString()}`}</div>
            <Link to="/register" className="btn-primary w-full text-center block mb-4">Enroll Now</Link>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between"><span>Duration</span><span className="font-medium">{course.duration_hours || 'Self-paced'}</span></div>
              <div className="flex items-center justify-between"><span>Lessons</span><span className="font-medium">{course.total_lessons}</span></div>
              <div className="flex items-center justify-between"><span>Level</span><span className="font-medium capitalize">{course.level}</span></div>
              <div className="flex items-center justify-between"><span>Language</span><span className="font-medium">{course.language}</span></div>
              <div className="flex items-center justify-between"><span>Certificate</span><span className="font-medium">{course.has_certificate ? 'Yes' : 'No'}</span></div>
            </div>
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-indigo-600">{course.teacher_name?.[0]}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{course.teacher_name}</div>
                  <div className="text-sm text-gray-500">Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
