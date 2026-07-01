import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { cmsAPI } from '../../services/api';

export default function Contact() {
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('contact')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const contactInfo = [
    { icon: Mail, title: 'Email', details: [cms.contact?.email || 'info@liveclasscode.com', cms.contact?.support_email || 'support@liveclasscode.com'] },
    { icon: Phone, title: 'Phone', details: [cms.contact?.phone || '+256 700 000 000', cms.contact?.phone2 || '+256 800 000 000'] },
    { icon: MapPin, title: 'Address', details: [cms.contact?.address || 'Kampala, Uganda', cms.contact?.address_detail || 'Plot 123, Commercial Street'] },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4" style={{
            background: 'linear-gradient(135deg, var(--neon), #00bfff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {cms.hero?.title || "Contact Us"}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{cms.hero?.subtitle || "We'd love to hear from you"}</p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="neon-card space-y-6">
              {sent && (
                <div
                  className="px-5 py-3 rounded-lg text-sm font-medium flex items-center space-x-2"
                  style={{
                    background: 'rgba(0,255,65,0.1)',
                    color: 'var(--neon)',
                    border: '1px solid rgba(0,255,65,0.3)',
                    boxShadow: '0 0 16px rgba(0,255,65,0.15)',
                  }}
                >
                  <span>✓</span>
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="neon-input"
                    style={{
                      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)';
                      e.currentTarget.style.borderColor = 'var(--neon)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-neon)';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="neon-input"
                    style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)';
                      e.currentTarget.style.borderColor = 'var(--neon)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-neon)';
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="neon-input"
                  style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)';
                    e.currentTarget.style.borderColor = 'var(--neon)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-neon)';
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="neon-input"
                  style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)';
                    e.currentTarget.style.borderColor = 'var(--neon)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-neon)';
                  }}
                />
              </div>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--neon), #00cc55)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(0,255,65,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.5)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
          <div className="space-y-6">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="neon-card flex items-start space-x-5"
                style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0,255,65,0.08)',
                    boxShadow: '0 0 16px rgba(0,255,65,0.12)',
                    border: '1px solid rgba(0,255,65,0.15)',
                  }}
                >
                  <item.icon style={{ color: 'var(--neon)' }} size={26} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  {item.details.map((d, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)' }}>{d}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
