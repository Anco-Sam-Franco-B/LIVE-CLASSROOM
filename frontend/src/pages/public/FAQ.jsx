import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is Live Class Code?', a: 'Live Class Code is a comprehensive online learning management system designed for Ugandan students and teachers. It supports live classes, course management, assignments, quizzes, and mobile money payments.' },
  { q: 'How do I enroll in a course?', a: 'Create an account, browse the course catalog, and click "Enroll Now" on any course. You can pay via MTN MoMo or Airtel Money.' },
  { q: 'What payment methods are accepted?', a: 'We accept MTN Mobile Money and Airtel Money. Bank transfers and card payments coming soon.' },
  { q: 'Can teachers create their own courses?', a: 'Yes! Teachers can create structured courses with modules, lessons, videos, PDFs, assignments, and quizzes.' },
  { q: 'How do live classes work?', a: 'Teachers schedule live classes with HD video, screen sharing, and chat. Students receive reminders and join via a secure link.' },
  { q: 'How are certificates issued?', a: 'Certificates are automatically generated when a student completes all course requirements. Each certificate has a unique verification number.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use JWT authentication, bcrypt password hashing, Helmet security headers, and SQL injection protection.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">Find answers to common questions about Live Class Code.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="card cursor-pointer" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{faq.q}</h3>
              <ChevronDown className={`text-gray-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} size={20} />
            </div>
            {openIndex === i && <p className="mt-3 text-gray-600 text-sm">{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
