import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { Star, BookOpen } from 'lucide-react';

export default function TeacherProfiles() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getTeachers()
      .then(({ data }) => setTeachers(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Teachers</h1>
        <p className="text-lg text-gray-600">Learn from experienced and qualified educators</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(teacher => (
          <div key={teacher.id} className="card text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">{teacher.first_name?.[0]}{teacher.last_name?.[0]}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{teacher.first_name} {teacher.last_name}</h3>
            <p className="text-sm text-gray-500 mb-3">{teacher.email}</p>
            <p className="text-sm text-gray-600 mb-4">{teacher.bio || 'Experienced educator passionate about teaching.'}</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-1"><BookOpen size={16} /><span>{teacher.course_count} courses</span></span>
              <span className="flex items-center space-x-1"><Star className="text-yellow-400" size={16} /><span>{parseFloat(teacher.avg_rating).toFixed(1)}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
