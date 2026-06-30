import { Link } from 'react-router-dom';
import { BookOpen, Video, Award, Users, TrendingUp, Globe, ArrowRight, Star, CheckCircle } from 'lucide-react';

const features = [
  { icon: Video, title: 'Live Interactive Classes', desc: 'Real-time virtual classrooms with HD video and screen sharing' },
  { icon: BookOpen, title: 'Structured Courses', desc: 'Well-organized curriculum with modules and lessons' },
  { icon: Award, title: 'Certificates', desc: 'Earn verifiable certificates upon course completion' },
  { icon: Users, title: 'Expert Teachers', desc: 'Learn from qualified and experienced instructors' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your learning journey with detailed analytics' },
  { icon: Globe, title: 'Learn Anywhere', desc: 'Access courses on any device, anytime' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Student', text: 'Live Class Code transformed the way I learn. The interactive classes and quizzes keep me engaged.', avatar: 'SJ', rating: 5 },
  { name: 'James Mwangi', role: 'Teacher', text: 'The platform makes it easy to create courses and manage students. Highly recommended!', avatar: 'JM', rating: 5 },
  { name: 'Grace Nakato', role: 'Student', text: 'Live Class Code has transformed how I learn. The live classes and quizzes are fantastic.', avatar: 'GN', rating: 5 },
];

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Courses', value: '500+' },
  { label: 'Expert Teachers', value: '200+' },
  { label: 'Certificates Issued', value: '5,000+' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">Learn Anytime, Anywhere with Live Class Code</h1>
              <p className="text-lg text-indigo-200 mb-8">Uganda's premier online learning platform. Access live classes, interactive quizzes, assignments, and earn certificates from expert teachers.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">Get Started Free</Link>
                <Link to="/courses" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">Browse Courses</Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" alt="Students learning" className="rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Live Class Code?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">A complete learning management system designed for Ugandan students and teachers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What People Say</h2>
            <p className="text-lg text-gray-600">Hear from our community of learners and educators.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="card text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-indigo-600">{t.avatar}</span>
                </div>
                <div className="flex justify-center mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{t.text}"</p>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-indigo-200 mb-8">Join thousands of students already learning on Live Class Code.</p>
          <Link to="/register" className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition inline-flex items-center space-x-2">
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
