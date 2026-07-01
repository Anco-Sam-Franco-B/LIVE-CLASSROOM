import { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import { MessageSquare, Send, User, Paperclip, File, X, Image, FileText } from 'lucide-react';
import Toast from '../../components/Toast';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesAPI.getConversations()
      .then(({ data }) => setConversations(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const { data } = await messagesAPI.getMessages(conv.id);
      setMessages(data.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConv) return;
    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('message', newMessage);
      if (selectedFile) formData.append('file', selectedFile);
      const { data } = await messagesAPI.sendMessage(selectedConv.id, formData);
      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
      setSelectedFile(null);
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed to send' }); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const getFileIcon = (url) => {
    const ext = url?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Image;
    if (['pdf'].includes(ext)) return FileText;
    if (['doc', 'docx'].includes(ext)) return FileText;
    if (['mp4', 'webm', 'ogg'].includes(ext)) return File;
    return File;
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--neon)', borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="w-80 overflow-y-auto shrink-0" style={{ borderRight: '1px solid var(--border-neon)' }}>
        <h2 className="font-semibold p-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-neon)' }}>Conversations</h2>
        {conversations.map((conv) => (
          <div key={conv.id} onClick={() => selectConversation(conv)}
            className="p-4 cursor-pointer"
            style={{ borderBottom: '1px solid var(--border-neon)', background: selectedConv?.id === conv.id ? 'rgba(0,255,65,0.1)' : '' }}
            onMouseEnter={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; }}
            onMouseLeave={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = ''; }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.1)' }}>
                <User size={20} style={{ color: 'var(--neon)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{conv.title || 'Conversation'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{conv.last_message || 'No messages'}</p>
              </div>
              {conv.unread_count > 0 && <span className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ background: 'var(--neon)' }}>{conv.unread_count}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            <div className="p-4 font-medium" style={{ borderBottom: '1px solid var(--border-neon)', color: 'var(--text-primary)' }}>{selectedConv.title || 'Conversation'}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const FileIcon = msg.file_url ? getFileIcon(msg.file_url) : null;
                const isImage = msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)' }}>
                      <User size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{msg.sender_name}</p>
                      {msg.message && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{msg.message}</p>}
                      {msg.file_url && (
                        <div className="mt-1">
                          {isImage ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer"><img src={msg.file_url} alt="attachment" className="max-w-xs rounded-lg" style={{ borderColor: 'var(--border-neon)' }} /></a>
                          ) : (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}><FileIcon size={16} /><span>View attachment</span></a>
                          )}
                        </div>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4" style={{ borderTop: '1px solid var(--border-neon)' }}>
              {selectedFile && (
                <div className="flex items-center space-x-2 mb-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(0,255,65,0.1)' }}>
                  <File size={16} style={{ color: 'var(--neon)' }} />
                  <span className="truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} style={{ color: '#ff3232' }} onMouseEnter={e => e.currentTarget.style.color = '#ff6666'} onMouseLeave={e => e.currentTarget.style.color = '#ff3232'}><X size={16} /></button>
                </div>
              )}
              <div className="flex space-x-3">
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-lg transition" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-card)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = ''; }}><Paperclip size={20} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="neon-input flex-1" placeholder="Type a message..." />
                <button onClick={sendMessage} className="neon-btn"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4" size={48} style={{ color: 'var(--text-muted)' }} />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
