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

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="w-80 border-r border-gray-200 overflow-y-auto shrink-0">
        <h2 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Conversations</h2>
        {conversations.map((conv) => (
          <div key={conv.id} onClick={() => selectConversation(conv)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedConv?.id === conv.id ? 'bg-indigo-50' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{conv.title || 'Conversation'}</p>
                <p className="text-xs text-gray-500 truncate">{conv.last_message || 'No messages'}</p>
              </div>
              {conv.unread_count > 0 && <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread_count}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-gray-200 font-medium text-gray-900">{selectedConv.title || 'Conversation'}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const FileIcon = msg.file_url ? getFileIcon(msg.file_url) : null;
                const isImage = msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-gray-500" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{msg.sender_name}</p>
                      {msg.message && <p className="text-sm text-gray-600">{msg.message}</p>}
                      {msg.file_url && (
                        <div className="mt-1">
                          {isImage ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer"><img src={msg.file_url} alt="attachment" className="max-w-xs rounded-lg border border-gray-200" /></a>
                          ) : (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition"><FileIcon size={16} /><span>View attachment</span></a>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
              {selectedFile && (
                <div className="flex items-center space-x-2 mb-2 px-3 py-2 bg-indigo-50 rounded-lg text-sm">
                  <File size={16} className="text-indigo-600" />
                  <span className="text-gray-700 truncate flex-1">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                </div>
              )}
              <div className="flex space-x-3">
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Paperclip size={20} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="input-field flex-1" placeholder="Type a message..." />
                <button onClick={sendMessage} className="btn-primary"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4" size={48} />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
