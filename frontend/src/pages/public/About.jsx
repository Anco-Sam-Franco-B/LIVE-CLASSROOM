import { Link } from 'react-router-dom';
import { Users, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Live Class Code</h1>
        <p className="text-lg text-gray-600">Empowering Ugandan education through technology. Live Class Code is a modern virtual classroom platform that connects students and teachers.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">To make quality education accessible to every Ugandan student through technology. We provide tools for live classes, course management, assignments, quizzes, and progress tracking.</p>
          <p className="text-gray-600">Our platform supports MTN MoMo and Airtel Money payments, making it easy for students to pay for courses.</p>
        </div>
        <div>
          <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop" alt="Our mission" className="rounded-xl shadow-lg" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="card">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-indigo-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Our Team</h3>
          <p className="text-gray-600 text-sm">Dedicated educators and technologists passionate about transforming education.</p>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-indigo-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Our Vision</h3>
          <p className="text-gray-600 text-sm">To be Uganda's leading online learning platform serving students nationwide.</p>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-indigo-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Our Values</h3>
          <p className="text-gray-600 text-sm">Quality, accessibility, innovation, and community-driven education.</p>
        </div>
      </div>
    </div>
  );
}
