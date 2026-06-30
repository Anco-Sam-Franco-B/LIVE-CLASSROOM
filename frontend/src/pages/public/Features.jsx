import { BookOpen, Video, Award, Users, BarChart3, CreditCard, MessageSquare, Bell, FileText, Shield, Globe, Zap } from 'lucide-react';

const featuresList = [
  { icon: Video, title: 'Live Virtual Classrooms', desc: 'Real-time interactive classes with HD video, screen sharing, chat, and file sharing.' },
  { icon: BookOpen, title: 'Course Management', desc: 'Create structured courses with modules, lessons, videos, PDFs, and articles.' },
  { icon: Award, title: 'Certificates', desc: 'Auto-generate verifiable certificates upon course completion with unique IDs.' },
  { icon: Users, title: 'Multi-Role Support', desc: 'Dedicated portals for super admins, admins, teachers, and students.' },
  { icon: FileText, title: 'Assignments & Quizzes', desc: 'Create assignments and quizzes with auto-grading, multiple attempts, and feedback.' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Comprehensive reports on student progress, revenue, attendance, and course performance.' },
  { icon: CreditCard, title: 'Mobile Money Payments', desc: 'Integrated MTN MoMo and Airtel Money for seamless course payments.' },
  { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Built-in messaging system for students, teachers, and parents.' },
  { icon: Bell, title: 'Notifications', desc: 'In-app and email notifications for assignments, meetings, payments, and updates.' },
  { icon: Shield, title: 'Secure Authentication', desc: 'JWT tokens, 2FA, account locking, and session management for maximum security.' },
  { icon: Globe, title: 'Accessible Anywhere', desc: 'Responsive design works on desktop, tablet, and mobile devices.' },
  { icon: Zap, title: 'Progress Tracking', desc: 'Track lesson completion, quiz scores, assignment grades, and overall course progress.' },
];

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to run a successful online learning program.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((f) => (
          <div key={f.title} className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <f.icon className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
