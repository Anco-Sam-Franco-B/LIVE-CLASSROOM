import { useState, useEffect, useCallback } from 'react';
import { cmsAPI } from '../../services/api';
import {
  Globe, Save, Eye, EyeOff, RotateCcw, Plus, Trash2, X, ChevronDown,
  ChevronRight, Home, Users, Target, HelpCircle, CreditCard, Mail,
  BookOpen, Award, Search, Shield, Scale, Sparkles, CheckCircle,
  Zap, GripVertical, List, DollarSign, MessageSquare,
  AlertCircle, RefreshCw
} from 'lucide-react';
import Toast from '../../components/Toast';

const sectionIcons = {
  hero: { icon: Sparkles, color: '#00d4ff', label: 'Hero Section' },
  stats: { icon: BarChart3, color: '#ffc800', label: 'Statistics' },
  features: { icon: Zap, color: 'var(--neon)', label: 'Feature List' },
  testimonials: { icon: MessageSquare, color: '#0096ff', label: 'Testimonials' },
  cta: { icon: Target, color: 'var(--neon)', label: 'Call to Action' },
  faqs: { icon: HelpCircle, color: '#ff8800', label: 'FAQ Items' },
  pricing: { icon: DollarSign, color: '#ffc800', label: 'Pricing Plans' },
  contact: { icon: Mail, color: '#0096ff', label: 'Contact Info' },
  mission: { icon: Target, color: 'var(--neon)', label: 'Mission Statement' },
  values: { icon: Heart, color: '#ff4444', label: 'Company Values' },
  posts: { icon: BookOpen, color: '#00d4ff', label: 'Blog Posts' },
  content: { icon: FileText, color: 'var(--neon)', label: 'Page Content' },
};

const pageMeta = [
  { key: 'home', label: 'Home', icon: Home, sections: ['hero', 'stats', 'features', 'testimonials', 'cta'] },
  { key: 'about', label: 'About', icon: Users, sections: ['hero', 'mission', 'values'] },
  { key: 'features', label: 'Features', icon: Award, sections: ['hero', 'features'] },
  { key: 'faq', label: 'FAQ', icon: HelpCircle, sections: ['hero', 'faqs'] },
  { key: 'pricing', label: 'Pricing', icon: CreditCard, sections: ['hero', 'pricing'] },
  { key: 'contact', label: 'Contact', icon: Mail, sections: ['hero', 'contact'] },
  { key: 'blog', label: 'Blog', icon: BookOpen, sections: ['hero', 'posts'] },
  { key: 'courses', label: 'Courses', icon: BookOpen, sections: ['hero'] },
  { key: 'teachers', label: 'Teachers', icon: Users, sections: ['hero'] },
  { key: 'certificates', label: 'Certificates', icon: Award, sections: ['hero'] },
  { key: 'not-found', label: '404 Page', icon: Search, sections: ['hero'] },
  { key: 'privacy-policy', label: 'Privacy Policy', icon: Shield, sections: ['hero', 'content'] },
  { key: 'terms-conditions', label: 'Terms & Conditions', icon: Scale, sections: ['hero', 'content'] },
];

function BarChart3({ size, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

function Heart({ size, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function FileText({ size, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}

const valueType = (val) => {
  if (val === null || val === undefined) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
};

function FieldEditor({ label, value, onChange, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const type = valueType(value);
  const labelStr = String(label);
  const isImageField = labelStr.match(/url|image|icon|avatar|thumbnail/i);

  const handleArrayItemChange = (idx, key, newVal) => {
    const updated = [...value];
    if (key === null) {
      updated[idx] = newVal;
    } else {
      updated[idx] = { ...updated[idx], [key]: newVal };
    }
    onChange(updated);
  };

  const addArrayItem = () => {
    const sample = value.length > 0 ? value[0] : {};
    const empty = typeof sample === 'object' && !Array.isArray(sample)
      ? Object.fromEntries(Object.entries(sample).map(([k]) => [k, '']))
      : '';
    onChange([...value, empty]);
  };

  const removeArrayItem = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveArrayItem = (idx, dir) => {
    const updated = [...value];
    const target = idx + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    onChange(updated);
  };

  if (type === 'string' && isImageField && value?.length > 40) {
    return (
      <div className="mb-3 group">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labelStr.replace(/_/g, ' ')}</label>
        <div className="flex gap-3">
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
            className="neon-input flex-1 text-xs" />
          {value && (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border-neon)' }}>
              <img src={value} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'string') {
    const isLong = (value?.length || 0) > 100;
    return (
      <div className="mb-3 group">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labelStr.replace(/_/g, ' ')}</label>
        {isLong ? (
          <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
            className="neon-input text-xs w-full" />
        ) : (
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
            className="neon-input text-xs w-full" />
        )}
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div className="mb-3 group">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labelStr.replace(/_/g, ' ')}</label>
        <input type="number" value={value ?? ''} onChange={e => onChange(Number(e.target.value))}
          className="neon-input text-xs w-full" />
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="mb-3 group flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <button onClick={() => onChange(!value)}
          className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
          style={{ background: value ? 'var(--neon)' : 'rgba(255,255,255,0.12)', boxShadow: value ? '0 0 12px rgba(0,255,65,0.3)' : 'none' }}>
          <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md"
            style={{ left: value ? '22px' : '2px', boxShadow: value ? '0 0 8px rgba(0,255,65,0.4)' : 'none' }} />
        </button>
        <label className="text-xs font-medium cursor-pointer" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{labelStr.replace(/_/g, ' ')}</label>
      </div>
    );
  }

  if (type === 'array') {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labelStr.replace(/_/g, ' ')} ({value.length})</label>
          <button onClick={addArrayItem} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all"
            style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,65,0.1)'}>
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
                <GripVertical size={12} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
                <span className="text-xs font-medium flex-1" style={{ color: 'var(--neon)' }}>Item {idx + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveArrayItem(idx, -1)} disabled={idx === 0} className="p-1 rounded transition-all"
                    style={{ color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
                    <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                  <button onClick={() => moveArrayItem(idx, 1)} disabled={idx === value.length - 1} className="p-1 rounded transition-all"
                    style={{ color: idx === value.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: idx === value.length - 1 ? 0.3 : 1, cursor: idx === value.length - 1 ? 'not-allowed' : 'pointer' }}>
                    <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                </div>
                <button onClick={() => removeArrayItem(idx)} className="p-1 rounded transition-all"
                  style={{ color: '#ff4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,50,50,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="px-3 py-2">
                {typeof item === 'object' && item !== null ? (
                  Object.entries(item).map(([k, v]) => (
                    <FieldEditor key={k} label={k} value={v} onChange={(nv) => handleArrayItemChange(idx, k, nv)} depth={depth + 1} />
                  ))
                ) : (
                  <input type="text" value={item || ''} onChange={e => handleArrayItemChange(idx, null, e.target.value)}
                    className="neon-input text-xs w-full" />
                )}
              </div>
            </div>
          ))}
          {value.length === 0 && (
            <div className="text-center py-6 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <List size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No items yet. Click "Add" to create one.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'object') {
    const keys = Object.keys(value || {});
    if (keys.length === 0) return null;
    const filteredKeys = keys.filter(k => k !== 'id' && k !== 'is_active');
    if (filteredKeys.length === 0) return null;
    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2 cursor-pointer px-1 py-1 rounded-md transition-all"
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {expanded ? <ChevronDown size={12} style={{ color: 'var(--neon)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
          <label className="text-xs font-medium cursor-pointer" style={{ color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{labelStr.replace(/_/g, ' ')}</label>
        </div>
        {expanded && (
          <div className="pl-3 space-y-1" style={{ borderLeft: '2px solid rgba(0,255,65,0.12)' }}>
            {filteredKeys.map(k => (
              <FieldEditor key={k} label={k} value={value[k]} onChange={(nv) => onChange({ ...value, [k]: nv })} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

const sectionDefaults = {
  hero: { title: 'Hero Title', subtitle: 'Hero description', badge: 'Badge text', cta_primary: 'Get Started', cta_secondary: 'Learn More' },
  stats: { items: [{ label: 'Stat 1', value: '100+' }, { label: 'Stat 2', value: '200+' }] },
  features: { badge: 'Why Choose Us', title: 'Features Title', subtitle: 'Description', items: [{ title: 'Feature 1', desc: 'Description' }] },
  testimonials: { badge: 'Testimonials', title: 'What People Say', subtitle: 'Description', items: [{ name: 'Name', role: 'Role', text: 'Quote', avatar: 'NA', rating: 5 }] },
  cta: { badge: 'Get Started', title: 'Call to Action', subtitle: 'Description', button_text: 'Get Started' },
  faqs: { items: [{ q: 'Question?', a: 'Answer.' }] },
  pricing: { plans: [{ name: 'Plan', price: '0', period: '/month', features: ['Feature 1'], cta: 'Sign Up', featured: false }] },
  contact: { email: 'info@example.com', support_email: 'support@example.com', phone: '+256...', phone2: '', address: 'Kampala, Uganda', address_detail: '' },
  mission: { title: 'Our Mission', body: 'Description...', image_url: '' },
  values: { items: [{ title: 'Value', desc: 'Description' }] },
  posts: { items: [{ title: 'Post Title', excerpt: '...', author: 'Admin', date: '2024-01-01', image: '', tag: 'News' }] },
  content: { sections: [{ heading: 'Section Title', body: 'Content...' }] },
};

export default function CmsContent() {
  const [pages, setPages] = useState({});
  const [selectedPage, setSelectedPage] = useState('home');
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [pageSearch, setPageSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const { data } = await cmsAPI.getAll();
      setPages(data.data || {});
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const currentSections = pages[selectedPage] || {};
  const meta = pageMeta.find(p => p.key === selectedPage);

  const handleFieldChange = (section, fieldPath, value) => {
    setEditing(prev => ({
      ...prev,
      [selectedPage]: {
        ...prev[selectedPage],
        [section]: {
          ...(prev[selectedPage]?.[section] || currentSections[section] || {}),
          [fieldPath]: value,
        },
      },
    }));
  };

  const handleSave = async (section) => {
    setSavingSection(section);
    try {
      const content = editing[selectedPage]?.[section] || currentSections[section] || {};
      await cmsAPI.updateSection(selectedPage, section, content);
      setToast({ message: `"${section}" saved successfully`, type: 'success' });
      setEditing(prev => {
        const next = { ...prev };
        if (next[selectedPage]) delete next[selectedPage][section];
        return next;
      });
      loadData();
    } catch {
      setToast({ message: 'Failed to save section', type: 'error' });
    }
    setSavingSection(null);
  };

  const handleToggle = async (section) => {
    try {
      await cmsAPI.toggleSection(selectedPage, section);
      setToast({ message: `"${section}" ${currentSections[section]?.is_active !== false ? 'deactivated' : 'activated'}`, type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to toggle', type: 'error' });
    }
  };

  const handleReset = async (section) => {
    try {
      await cmsAPI.resetSection(selectedPage, section);
      setToast({ message: `"${section}" reset to defaults`, type: 'info' });
      loadData();
    } catch {
      setToast({ message: 'Failed to reset', type: 'error' });
    }
  };

  const sectionNames = Object.keys(currentSections).length > 0
    ? Object.keys(currentSections)
    : (meta?.sections || ['hero']);

  const effectiveContent = (section) => {
    return editing[selectedPage]?.[section] ?? currentSections[section] ?? sectionDefaults[section] ?? {};
  };

  const filteredPages = pageSearch
    ? pageMeta.filter(p => p.label.toLowerCase().includes(pageSearch.toLowerCase()) || p.key.includes(pageSearch.toLowerCase()))
    : pageMeta;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,255,65,0.2), rgba(0,255,65,0.05))' }} />
          <div>
            <div className="h-6 rounded w-40 mb-2" style={{ background: 'linear-gradient(90deg, rgba(0,255,65,0.1) 25%, rgba(0,255,65,0.05) 50%, rgba(0,255,65,0.1) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div className="h-3 rounded w-64" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="w-56 space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 rounded-xl" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, rgba(0,255,65,0.15), rgba(0,255,65,0.05))',
          border: '1px solid rgba(0,255,65,0.2)',
          boxShadow: '0 0 24px rgba(0,255,65,0.08)',
        }}>
          <Globe size={28} style={{ color: 'var(--neon)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{
            background: 'linear-gradient(135deg, #fff 0%, var(--neon) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>CMS Content</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage dynamic content for all public-facing pages</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="relative mb-3">
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <input type="text" value={pageSearch} onChange={e => setPageSearch(e.target.value)}
              placeholder="Search pages..."
              className="neon-input w-full text-xs"
              style={{ paddingLeft: '32px' }} />
            {pageSearch && (
              <button onClick={() => setPageSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredPages.map(p => {
              const Icon = p.icon;
              const hasContent = pages[p.key] && Object.keys(pages[p.key]).length > 0;
              const isSelected = selectedPage === p.key;
              return (
                <button key={p.key} onClick={() => { setSelectedPage(p.key); setExpandedSection(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 group relative overflow-hidden"
                  style={{
                    background: isSelected ? 'rgba(0,255,65,0.08)' : 'transparent',
                    color: isSelected ? 'var(--neon)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid rgba(0,255,65,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; } }}>
                  {isSelected && (
                    <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: 'var(--neon)', boxShadow: '0 0 8px rgba(0,255,65,0.5)' }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span className="flex-1">{p.label}</span>
                  {hasContent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)' }}>
                      {Object.keys(pages[p.key]).length}
                    </span>
                  )}
                  {!hasContent && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0</span>
                  )}
                </button>
              );
            })}
            {filteredPages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No pages match your search</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(0,255,65,0.12), rgba(0,255,65,0.03))',
              border: '1px solid rgba(0,255,65,0.15)',
            }}>
              {meta && <meta.icon size={22} style={{ color: 'var(--neon)' }} />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{meta?.label || selectedPage}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {sectionNames.length} section{sectionNames.length !== 1 ? 's' : ''} · {meta?.sections?.length || 0} defined
              </p>
            </div>
            <div className="flex items-center gap-2">
              {Object.keys(currentSections).length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(0,255,65,0.08)', color: 'var(--neon)' }}>
                  <CheckCircle size={12} />
                  <span>{Object.keys(currentSections).filter(s => currentSections[s]?.is_active !== false).length} active</span>
                </div>
              )}
            </div>
          </div>

          {sectionNames.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No Content Yet</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a page with existing content or start editing below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sectionNames.map(section => {
                const content = effectiveContent(section);
                const isExpanded = expandedSection === section;
                const isActive = currentSections[section]?.is_active !== false;
                const hasUnsaved = editing[selectedPage]?.[section] !== undefined;
                const secIcon = sectionIcons[section] || { icon: FileText, color: 'var(--neon)', label: section };
                const SecIcon = secIcon.icon;
                const isSaving = savingSection === section;

                return (
                  <div key={section} className="rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      border: isExpanded ? '1px solid rgba(0,255,65,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      background: 'var(--bg-card)',
                      boxShadow: isExpanded ? '0 0 30px rgba(0,255,65,0.05)' : 'none',
                    }}>
                    <div
                      className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none transition-all duration-200"
                      onClick={() => setExpandedSection(isExpanded ? null : section)}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                      style={{ background: isExpanded ? 'rgba(0,255,65,0.03)' : 'transparent' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: isExpanded ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.03)' }}>
                          <SecIcon size={14} style={{ color: isExpanded ? secIcon.color : 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{section.replace(/_/g, ' ')}</span>
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{secIcon.label}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {hasUnsaved && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium animate-pulse" style={{ background: 'rgba(255,200,0,0.15)', color: '#ffc800' }}>
                              Unsaved
                            </span>
                          )}
                          {!isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444' }}>
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); handleToggle(section); }}
                          className="p-2 rounded-lg transition-all" title={isActive ? 'Deactivate section' : 'Activate section'}
                          style={{ color: isActive ? 'var(--neon)' : 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleSave(section); }}
                          disabled={isSaving || !hasUnsaved}
                          className="p-2 rounded-lg transition-all" title="Save section"
                          style={{
                            color: hasUnsaved ? 'var(--neon)' : 'var(--text-muted)',
                            opacity: hasUnsaved ? 1 : 0.3,
                          }}
                          onMouseEnter={e => { if (hasUnsaved) e.currentTarget.style.background = 'rgba(0,255,65,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} style={{ color: isExpanded ? 'var(--neon)' : 'var(--text-muted)' }} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.12)' }}>
                        {Object.entries(content).filter(([k]) => k !== 'id' && k !== 'is_active').length === 0 ? (
                          <div className="text-center py-6">
                            <AlertCircle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', opacity: 0.5 }} />
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No editable fields in this section</p>
                          </div>
                        ) : (
                          Object.entries(content).filter(([k]) => k !== 'id' && k !== 'is_active').map(([key, val]) => (
                            <FieldEditor key={key} label={key} value={val}
                              onChange={(nv) => handleFieldChange(section, key, nv)} />
                          ))
                        )}
                        <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button onClick={() => handleSave(section)} disabled={isSaving}
                            className="neon-btn flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all"
                            style={{
                              background: 'linear-gradient(135deg, var(--neon) 0%, #00cc52 100%)',
                              color: '#000',
                              boxShadow: hasUnsaved ? '0 0 20px rgba(0,255,65,0.3)' : 'none',
                              opacity: isSaving ? 0.7 : 1,
                            }}>
                            {isSaving ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          {currentSections[section] && (
                            <button onClick={() => handleReset(section)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,50,50,0.08)'; e.currentTarget.style.color = '#ff4444'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                              <RotateCcw size={14} />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
