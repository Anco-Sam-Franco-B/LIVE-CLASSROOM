import { useState } from 'react';
import { usersAPI, authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { User, Lock, Camera, Plus, X, Link as LinkIcon, GraduationCap, Briefcase, MapPin } from 'lucide-react';
import Toast from '../../components/Toast';
import { Input, Select, Textarea, Toggle, Checkbox } from '../../components/FormFields';

export default function StudentSettings() {
  const { user, updateUser } = useAuthStore();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    firstName: user?.first_name || '', lastName: user?.last_name || '',
    phone: user?.phone || '', bio: user?.bio || '',
    timezone: user?.timezone || 'UTC', headline: user?.headline || '',
    address: user?.address || '', city: user?.city || '', country: user?.country || '',
    skills: user?.skills || [],
    socialLinks: user?.social_links || [],
    education: user?.education || [],
    experience: user?.experience || [],
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [newSkill, setNewSkill] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersAPI.updateProfile({
        firstName: profile.firstName, lastName: profile.lastName,
        phone: profile.phone, bio: profile.bio, timezone: profile.timezone,
        headline: profile.headline, address: profile.address,
        city: profile.city, country: profile.country,
        skills: profile.skills, socialLinks: profile.socialLinks,
        education: profile.education, experience: profile.experience,
      });
      updateUser(data.data);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.changePassword(passwords);
      setToast({ type: 'success', message: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Password change failed' });
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await usersAPI.updateAvatar(formData);
      updateUser(data.data);
      setToast({ type: 'success', message: 'Avatar updated!' });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Upload failed' }); }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });

  const addSocialLink = () => setProfile({ ...profile, socialLinks: [...profile.socialLinks, { platform: '', url: '' }] });

  const updateSocialLink = (i, field, value) => {
    const links = [...profile.socialLinks];
    links[i] = { ...links[i], [field]: value };
    setProfile({ ...profile, socialLinks: links });
  };

  const removeSocialLink = (i) => setProfile({ ...profile, socialLinks: profile.socialLinks.filter((_, idx) => idx !== i) });

  const addEducation = () => setProfile({ ...profile, education: [...profile.education, { institution: '', degree: '', field: '', startYear: '', endYear: '' }] });

  const updateEducation = (i, field, value) => {
    const edu = [...profile.education];
    edu[i] = { ...edu[i], [field]: value };
    setProfile({ ...profile, education: edu });
  };

  const removeEducation = (i) => setProfile({ ...profile, education: profile.education.filter((_, idx) => idx !== i) });

  const addExperience = () => setProfile({ ...profile, experience: [...profile.experience, { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }] });

  const updateExperience = (i, field, value) => {
    const exp = [...profile.experience];
    exp[i] = { ...exp[i], [field]: value };
    setProfile({ ...profile, experience: exp });
  };

  const removeExperience = (i) => setProfile({ ...profile, experience: profile.experience.filter((_, idx) => idx !== i) });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <div className="max-w-3xl">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="card mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="text-indigo-600" size={36} />}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition shadow-lg">
              <Camera className="text-white" size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.first_name} {user?.last_name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {profile.headline && <p className="text-sm text-indigo-600">{profile.headline}</p>}
          </div>
        </div>

        <div className="flex space-x-1 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={18} /><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
              <Input label="Last Name" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
            </div>
            <Input label="Headline" value={profile.headline} onChange={e => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g. Full Stack Developer" />
            <Textarea label="Bio" rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              <Select label="Timezone" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}><option value="UTC">UTC</option><option value="Africa/Kampala">Africa/Kampala</option><option value="Africa/Nairobi">Africa/Nairobi</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option></Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
              <Input label="City" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
              <Input label="Country" value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} />
            </div>

            <div><label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex items-center space-x-2 mb-2">
                <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input flex-1" placeholder="Add a skill..." />
                <button type="button" onClick={addSkill} className="btn-secondary"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"><span>{skill}</span><button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={14} /></button></span>
                ))}
              </div>
            </div>

            <div><label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              {profile.socialLinks.map((link, i) => (
                <div key={i} className="flex items-center space-x-2 mb-2">
                  <input type="text" value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)} className="input w-32" placeholder="Platform" />
                  <input type="url" value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} className="input flex-1" placeholder="URL" />
                  <button type="button" onClick={() => removeSocialLink(i)} className="p-2 text-red-500 hover:text-red-700"><X size={18} /></button>
                </div>
              ))}
              <button type="button" onClick={addSocialLink} className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"><Plus size={16} /><span>Add Social Link</span></button>
            </div>

            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            {profile.education.map((edu, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg relative">
                <button type="button" onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={18} /></button>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Institution" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                  <Input label="Degree" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
                  <Input label="Field of Study" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Start Year" value={edu.startYear} onChange={e => updateEducation(i, 'startYear', e.target.value)} />
                    <Input label="End Year" value={edu.endYear} onChange={e => updateEducation(i, 'endYear', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"><Plus size={16} /><span>Add Education</span></button>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4">
            {profile.experience.map((exp, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg relative">
                <button type="button" onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={18} /></button>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Company" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                  <Input label="Position" value={exp.position} onChange={e => updateExperience(i, 'position', e.target.value)} />
                  <Input label="Start Date" value={exp.startDate} onChange={e => updateExperience(i, 'startDate', e.target.value)} />
                  <div className="flex items-end space-x-2">
                    <Input label="End Date" value={exp.endDate} onChange={e => updateExperience(i, 'endDate', e.target.value)} disabled={exp.current} wrapperClass="flex-1" />
                    <Checkbox label="Current" checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} />
                  </div>
                </div>
                <Textarea label="Description" value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={2} />
              </div>
            ))}
            <button type="button" onClick={addExperience} className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"><Plus size={16} /><span>Add Experience</span></button>
          </div>
        )}

        {activeTab === 'password' && (
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <Input label="Current Password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            <Input label="New Password" type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="Min 8 characters" />
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Changing...' : 'Change Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
