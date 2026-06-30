import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { Settings, Save, RefreshCw, Globe, Palette, Shield, CreditCard, Mail, Image, Link as LinkIcon, ScrollText, Upload, Trash2, PenLine, FileImage, X } from 'lucide-react';
import Toast from '../../components/Toast';
import SignaturePad from '../../components/SignaturePad';
import axios from 'axios';

const API_URL = '/api';

const SETTINGS_GROUPS = {
  'Branding': {
    icon: Palette,
    keys: ['platform_name', 'platform_logo', 'platform_favicon', 'platform_tagline', 'platform_description', 'brand_primary_color', 'brand_secondary_color']
  },
  'Platform': {
    icon: Globe,
    keys: ['platform_email', 'platform_currency', 'default_timezone', 'registration_enabled', 'maintenance_mode', 'default_user_role', 'session_timeout_minutes', 'password_min_length']
  },
  'Features': {
    icon: Settings,
    keys: ['enable_certificates', 'smtp_enabled', 'jaas_enabled', 'mtn_momo_enabled', 'airtel_money_enabled', 'allowed_file_types', 'course_levels', 'max_file_upload_size']
  },
  'Security': {
    icon: Shield,
    keys: ['max_login_attempts', 'lockout_duration_minutes']
  },
  'Payment': {
    icon: CreditCard,
    keys: ['payment_providers']
  },
  'Support': {
    icon: Mail,
    keys: ['support_email', 'support_phone']
  },
  'Social': {
    icon: LinkIcon,
    keys: ['social_facebook', 'social_twitter', 'social_linkedin', 'social_youtube', 'social_instagram']
  },
  'Certificate': {
    icon: ScrollText,
    keys: ['enable_certificates', 'certificate_signature_url', 'certificate_authority_name']
  },
};

function SettingsField({ label, value, onChange, onUpload, uploading }) {
  const displayVal = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  const fileRef = useRef(null);
  const [signatureMode, setSignatureMode] = useState(null);

  const booleanKeys = ['smtp_enabled', 'jaas_enabled', 'mtn_momo_enabled', 'airtel_money_enabled', 'maintenance_mode', 'registration_enabled', 'enable_certificates'];
  if (booleanKeys.includes(label)) {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
      </label>
    );
  }

  const numericKeys = ['max_file_upload_size', 'max_login_attempts', 'lockout_duration_minutes', 'session_timeout_minutes', 'password_min_length'];
  if (numericKeys.includes(label)) {
    return <input type="number" value={displayVal} onChange={e => onChange(Number(e.target.value))} className="input" />;
  }

  if (label === 'default_timezone') {
    return (
      <select value={displayVal} onChange={e => onChange(e.target.value)} className="input">
        <option value="">Select timezone</option>
        <optgroup label="Africa">
          <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
          <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
          <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
          <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
          <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
          <option value="Africa/Accra">Africa/Accra (UTC+0)</option>
        </optgroup>
        <optgroup label="Other">
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="America/Chicago">America/Chicago</option>
          <option value="America/Denver">America/Denver</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="Asia/Dubai">Asia/Dubai</option>
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="Asia/Singapore">Asia/Singapore</option>
        </optgroup>
      </select>
    );
  }

  if (['allowed_file_types', 'course_levels', 'payment_providers'].includes(label)) {
    return <input type="text" value={displayVal} onChange={e => onChange(e.target.value.split(',').map(s => s.trim()))} className="input" placeholder="Comma-separated values" />;
  }

  if (label === 'platform_currency') {
    return (
      <select value={displayVal} onChange={e => onChange(e.target.value)} className="input">
        <option value="UGX">UGX - Ugandan Shilling</option>
        <option value="KES">KES - Kenyan Shilling</option>
        <option value="TZS">TZS - Tanzanian Shilling</option>
        <option value="RWF">RWF - Rwandan Franc</option>
        <option value="USD">USD - US Dollar</option>
        <option value="EUR">EUR - Euro</option>
      </select>
    );
  }

  if (['default_user_role'].includes(label)) {
    return (
      <select value={displayVal} onChange={e => onChange(e.target.value)} className="input">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
    );
  }

  if (['brand_primary_color', 'brand_secondary_color'].includes(label)) {
    return <input type="color" value={displayVal || '#4f46e5'} onChange={e => onChange(e.target.value)} className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer" />;
  }

  if (label === 'certificate_signature_url') {
    return (
      <div className="space-y-3">
        {value ? (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <img src={value} alt="Signature" className="h-12 object-contain rounded border border-gray-200 bg-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 font-medium truncate">Current Signature</p>
              <p className="text-xs text-gray-400 truncate">{value}</p>
            </div>
            <button type="button" onClick={() => onChange('')} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove">
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-400">No signature uploaded</p>
          </div>
        )}

        {signatureMode === 'draw' ? (
          <div className="relative">
            <button type="button" onClick={() => setSignatureMode(null)} className="absolute -top-2 -right-2 z-10 p-1 bg-white rounded-full shadow border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
            <SignaturePad
              width={500}
              height={180}
              onSave={async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const { data } = await axios.post(`${API_URL}/admin/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  if (data.success) {
                    onChange(data.data.url);
                    setSignatureMode(null);
                  }
                } catch (err) {
                  console.error('Signature upload failed:', err);
                }
              }}
              onCancel={() => setSignatureMode(null)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" className="hidden" onChange={onUpload} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline flex items-center gap-2 text-sm">
              <FileImage size={16} />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <button type="button" onClick={() => setSignatureMode('draw')} className="btn-outline flex items-center gap-2 text-sm">
              <PenLine size={16} />
              Draw Signature
            </button>
            <span className="text-xs text-gray-400">PNG with transparent background recommended</span>
          </div>
        )}
      </div>
    );
  }

  if (['platform_logo', 'platform_favicon'].includes(label)) {
    return (
      <div className="flex items-center space-x-2">
        <input type="text" value={displayVal} onChange={e => onChange(e.target.value)} className="input flex-1" placeholder="URL" />
      </div>
    );
  }

  return <input type="text" value={displayVal} onChange={e => onChange(e.target.value)} className="input" />;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeGroup, setActiveGroup] = useState('Branding');

  useEffect(() => {
    adminAPI.getSettings()
      .then(({ data }) => setSettings(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      setToast({ type: 'success', message: 'Settings saved successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to save settings' });
    } finally { setSaving(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        handleChange('certificate_signature_url', data.data.url);
        setToast({ type: 'success', message: 'Signature uploaded!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
    } finally { setUploading(false); if (e.target) e.target.value = ''; }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><RefreshCw size={32} className="text-indigo-600 animate-spin" /></div>;
  }

  const labels = {
    platform_name: 'Platform Name',
    platform_logo: 'Logo URL',
    platform_favicon: 'Favicon URL',
    platform_tagline: 'Tagline',
    platform_description: 'Description',
    brand_primary_color: 'Primary Color',
    brand_secondary_color: 'Secondary Color',
    platform_email: 'Platform Email',
    platform_currency: 'Currency',
    default_timezone: 'Default Timezone',
    registration_enabled: 'Allow Registration',
    maintenance_mode: 'Maintenance Mode',
    default_user_role: 'Default User Role',
    session_timeout_minutes: 'Session Timeout (min)',
    password_min_length: 'Min Password Length',
    enable_certificates: 'Enable Certificates',
    smtp_enabled: 'SMTP Enabled',
    jaas_enabled: 'Live Classes (LiveKit)',
    mtn_momo_enabled: 'MTN MoMo',
    airtel_money_enabled: 'Airtel Money',
    allowed_file_types: 'Allowed File Types',
    course_levels: 'Course Levels',
    max_file_upload_size: 'Max Upload (bytes)',
    max_login_attempts: 'Max Login Attempts',
    lockout_duration_minutes: 'Lockout Duration (min)',
    payment_providers: 'Payment Providers',
    support_email: 'Support Email',
    support_phone: 'Support Phone',
    social_facebook: 'Facebook',
    social_twitter: 'Twitter / X',
    social_linkedin: 'LinkedIn',
    social_youtube: 'YouTube',
    social_instagram: 'Instagram',
    certificate_signature_url: 'Signature Image',
    certificate_authority_name: 'Authority Name',
  };

  const groupKeys = SETTINGS_GROUPS[activeGroup].keys.filter(k => k in settings);

  return (
    <div className="max-w-4xl">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings size={28} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {Object.entries(SETTINGS_GROUPS).map(([group, { icon: Icon }]) => (
            <button key={group} onClick={() => setActiveGroup(group)}
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeGroup === group ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18} /><span>{group}</span>
            </button>
          ))}
        </div>

        <form onSubmit={saveSettings} className="flex-1 card">
          <div className="flex items-center space-x-3 mb-6">
            {(() => { const g = SETTINGS_GROUPS[activeGroup]; const Icon = g.icon; return <><Icon size={24} className="text-indigo-600" /><h2 className="text-lg font-semibold text-gray-900">{activeGroup} Settings</h2></>; })()}
          </div>
          <div className="space-y-5">
            {groupKeys.map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <SettingsField label={key} value={settings[key]} onChange={val => handleChange(key, val)} onUpload={handleUpload} uploading={uploading} />
              </div>
            ))}
            {groupKeys.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No settings available in this group.</p>}
          </div>
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center space-x-2">
              <Save size={18} /><span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
