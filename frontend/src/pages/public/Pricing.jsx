import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    features: ['Access to free courses', 'Basic quizzes', 'Course progress tracking', 'Community forum access'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Student',
    price: '50,000',
    period: '/month',
    features: ['All free features', 'Unlimited course access', 'Live class participation', 'Assignments & quizzes', 'Certificate on completion', 'Priority support'],
    cta: 'Start Learning',
    featured: true,
  },
  {
    name: 'Teacher',
    price: '100,000',
    period: '/month',
    features: ['Create unlimited courses', 'Student management', 'Live class hosting', 'Advanced analytics', 'Payment integration', 'Dedicated support'],
    cta: 'Start Teaching',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600">Choose the plan that fits your needs</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`card ${plan.featured ? 'ring-2 ring-indigo-600 relative' : ''}`}>
            {plan.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</div>}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">UGX {plan.price}</span>
              <span className="text-gray-500 ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className={`w-full text-center py-2.5 rounded-lg font-medium block ${plan.featured ? 'btn-primary' : 'btn-outline'}`}>{plan.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
