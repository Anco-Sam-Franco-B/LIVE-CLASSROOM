import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, categoriesAPI } from '../../services/api';
import { Search, Star, Clock, Users } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          coursesAPI.getAll({ limit: 50 }),
          categoriesAPI.getAll(),
        ]);
        setCourses(coursesRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category_id === parseInt(category);
    const matchLevel = !level || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-lg text-gray-600">Discover courses from expert teachers</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="input-field pl-10" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-auto">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)} className="input-field w-auto">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No courses found</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => (
            <Link key={course.id} to={`/courses/${course.slug}`} className="card hover:shadow-lg transition-shadow overflow-hidden p-0">
              <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop'} alt={course.title} className="w-full h-44 object-cover" />
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="badge badge-info">{course.level}</span>
                  {course.is_free && <span className="badge badge-success">Free</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.teacher_name}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center space-x-1"><Star className="text-yellow-400 fill-current" size={16} /><span>{parseFloat(course.rating).toFixed(1)}</span></span>
                  <span className="flex items-center space-x-1"><Users size={16} /><span>{course.enrollment_count}</span></span>
                  <span className="font-semibold text-indigo-600">{course.is_free ? 'Free' : `UGX ${course.price?.toLocaleString()}`}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
