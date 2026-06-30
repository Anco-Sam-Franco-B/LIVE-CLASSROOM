import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

const posts = [
  { title: 'The Future of Online Learning in Uganda', excerpt: 'How digital education is transforming the Ugandan education landscape and creating new opportunities.', author: 'Admin', date: '2024-01-15', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop' },
  { title: 'Tips for Effective Online Teaching', excerpt: 'Best practices for teachers transitioning to virtual classrooms and engaging students remotely.', author: 'Teacher John', date: '2024-01-10', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop' },
  { title: 'Why Mobile Money is Perfect for Education', excerpt: 'How MTN MoMo and Airtel Money are making education payments accessible to all Ugandans.', author: 'Admin', date: '2024-01-05', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop' },
];

export default function Blog() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
        <p className="text-lg text-gray-600">Insights and updates from the Live Class Code team.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.title} className="card overflow-hidden p-0">
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center space-x-1"><User size={14} /><span>{post.author}</span></span>
                <span className="flex items-center space-x-1"><Calendar size={14} /><span>{post.date}</span></span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
              <Link to="#" className="text-indigo-600 text-sm font-medium hover:text-indigo-500">Read More →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
