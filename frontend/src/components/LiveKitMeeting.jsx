import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useIsMuted,
  useConnectionState,
  useEnsureRoom,
  useTrackToggle,
  useChat,
  LayoutContextProvider,
  ConnectionStateToast,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import axios from 'axios';
import { meetingsAPI } from '../services/api';
import MeetingLayout from './MeetingLayout';
import AttendancePanel from './AttendancePanel';
import { 
  Loader2, 
  ShieldX, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Users, 
  X, 
  Settings, 
  WifiOff, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  File as FileIcon, 
  MessageSquare, 
  ScreenShare, 
  ScreenShareOff, 
  PhoneOff, 
  FileSpreadsheet,
  Maximize,
  Minimize
} from 'lucide-react';

const SANDBOX_API = 'https://cloud-api.livekit.io/api/sandbox/connection-details';
const SANDBOX_ID = 'liveclass-nbzpw2';
const USE_SANDBOX = import.meta.env.VITE_USE_LIVEKIT_SANDBOX === 'true';

async function fetchSandboxToken(roomName, participantName) {
  const { data } = await axios.post(SANDBOX_API,
    { room_name: roomName || undefined, participant_name: participantName || undefined },
    { headers: { 'X-Sandbox-ID': SANDBOX_ID, 'Content-Type': 'application/json' } },
  );
  return { token: data.participantToken, serverUrl: data.serverUrl, room: data.roomName };
}

const formatTime = (s) => {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
};

function PreJoinScreen({ onJoin }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [showDevices, setShowDevices] = useState(false);

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(d => {
      setDevices(d);
      const cam = d.find(dd => dd.kind === 'videoinput');
      const mic = d.find(dd => dd.kind === 'audioinput');
      if (cam) setSelectedCam(cam.deviceId);
      if (mic) setSelectedMic(mic.deviceId);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startPreview = async () => {
      try {
        const constraints = {
          video: videoEnabled
            ? (selectedCam ? { deviceId: { exact: selectedCam }, width: 640, height: 480 } : { width: 640, height: 480, facingMode: 'user' })
            : false,
          audio: audioEnabled
            ? (selectedMic ? { deviceId: { exact: selectedMic } } : true)
            : false,
        };

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }

        if (!videoEnabled && !audioEnabled) {
          streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error("Preview stream error:", e);
      }
    };
    startPreview();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [selectedCam, selectedMic, videoEnabled, audioEnabled]);

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !audioEnabled);
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
    }
    setVideoEnabled(!videoEnabled);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 relative overflow-hidden bg-[#07070a] w-full">
      {/* Dynamic background glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[rgba(0,255,65,0.03)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(0,191,255,0.03)] blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-4xl bg-[rgba(18,18,26,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left Section: Camera Preview */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video max-w-[440px] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#0f0f15] shadow-[0_10px_30px_rgba(0,0,0,0.6)] group">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            
            {(!videoEnabled || !streamRef.current) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d12] bg-opacity-95 backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-3 border border-[rgba(255,255,255,0.05)]">
                  <CameraOff size={28} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-400">Your camera is turned off</p>
              </div>
            )}
            
            {/* Camera Overlay Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[rgba(10,10,15,0.2)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <button 
                onClick={toggleAudio}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  audioEnabled 
                    ? 'bg-transparent text-white hover:bg-[rgba(255,255,255,0.1)]' 
                    : 'bg-[#ff3232] text-white hover:bg-[#ff5050] shadow-[0_0_15px_rgba(255,50,50,0.3)]'
                }`}
                title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  videoEnabled 
                    ? 'bg-transparent text-white hover:bg-[rgba(255,255,255,0.1)]' 
                    : 'bg-[#ff3232] text-white hover:bg-[#ff5050] shadow-[0_0_15px_rgba(255,50,50,0.3)]'
                }`}
                title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {videoEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-[rgba(255,255,255,0.06)] self-stretch" />

        {/* Right Section: Configuration Details */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Join Classroom</h2>
            <p className="text-sm text-[var(--text-secondary)]">Set your screen name and verify device settings before entering the session.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Display Name</label>
              <input 
                type="text" 
                placeholder="Enter your name..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && username.trim() && onJoin(username)}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--neon)] focus:ring-1 focus:ring-[var(--neon)] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)] transition-all duration-300 text-sm" 
              />
            </div>

            {/* Device Settings Selector dropdowns */}
            <div className="space-y-2">
              <button 
                onClick={() => setShowDevices(!showDevices)}
                className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-white transition-colors duration-200"
              >
                <Settings size={14} className={`transition-transform duration-300 ${showDevices ? 'rotate-45 text-[var(--neon)]' : ''}`} />
                <span>Configure Devices</span>
              </button>

              {showDevices && (
                <div className="rounded-xl p-4 space-y-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] transition-all duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Camera source</label>
                    <select 
                      value={selectedCam} 
                      onChange={(e) => setSelectedCam(e.target.value)}
                      className="w-full bg-[#12121a] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--neon)]"
                    >
                      {devices.filter(d => d.kind === 'videoinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Microphone source</label>
                    <select 
                      value={selectedMic} 
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full bg-[#12121a] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--neon)]"
                    >
                      {devices.filter(d => d.kind === 'audioinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 8)}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onJoin(username)} 
            disabled={!username.trim()}
            className="w-full relative group overflow-hidden bg-[var(--neon)] text-black font-semibold py-3.5 px-6 rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.35)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>Join Class Session</span>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

function ChatPanel({ onClose }) {
  const { chatMessages, send, isSending } = useChat();
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    try {
      if (text && files.length > 0) {
        await send(text, { attachments: files });
      } else if (files.length > 0) {
        for (const file of files) {
          await send(`📎 ${file.name}`, { attachments: [file] });
        }
      } else {
        await send(text);
      }
      setFiles([]);
    } catch (e) {}
    setInput('');
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full w-full sm:w-80 bg-[rgba(10,10,15,0.75)] backdrop-blur-2xl border-l border-[rgba(255,255,255,0.06)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--neon)]" />
          <h3 className="text-sm font-semibold text-white">Chat Room</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={32} className="mx-auto mb-2 text-gray-600" />
            <p className="text-xs text-gray-500 font-medium">No messages yet. Start the conversation!</p>
          </div>
        )}
        {chatMessages.map((msg, i) => {
          const isLocal = msg.from?.isLocal;
          const showName = i === 0 || chatMessages[i - 1]?.from?.identity !== msg.from?.identity;
          return (
            <div key={msg.id || i} className={`flex gap-2.5 ${isLocal ? 'flex-row-reverse' : ''}`}>
              {showName && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-sm border border-[rgba(255,255,255,0.1)]"
                  style={{ background: 'linear-gradient(135deg, var(--neon), var(--neon-dark))', color: '#000' }}>
                  {(msg.from?.name || msg.from?.identity || '?').charAt(0).toUpperCase()}
                </div>
              )}
              {!showName && <div className="w-7 shrink-0" />}
              <div className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'} max-w-[80%]`}>
                {showName && (
                  <span className="text-[10px] mb-1 px-1 font-medium text-gray-400">
                    {msg.from?.name || msg.from?.identity}{isLocal && ' (you)'}
                  </span>
                )}
                <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words space-y-2 border shadow-sm ${
                  isLocal 
                    ? 'rounded-tr-md bg-gradient-to-br from-[rgba(0,255,65,0.15)] to-[rgba(0,255,65,0.05)] border-[rgba(0,255,65,0.25)] text-white shadow-[0_0_10px_rgba(0,255,65,0.05)]' 
                    : 'rounded-tl-md bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-gray-200'
                }`}>
                  <span>{msg.message}</span>
                  {msg.attachedFiles?.map((file, fi) => (
                    file.type?.startsWith('image/') ? (
                      <div key={fi} className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.05)]">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="max-w-full h-auto rounded-lg" onLoad={(e) => URL.revokeObjectURL(e.target.src)} />
                      </div>
                    ) : (
                      <div key={fi} className="flex items-center gap-2 text-[10px] opacity-80 bg-[rgba(0,0,0,0.2)] p-2 rounded-lg">
                        <FileIcon size={12} />
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <span className="opacity-60">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    )
                  ))}
                </div>
                <span className="text-[9px] px-1 mt-1 text-gray-500 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                {f.type.startsWith('image/') ? <ImageIcon size={12} className="text-[var(--neon)]" /> : <FileIcon size={12} className="text-gray-400" />}
                <span className="text-gray-300 truncate max-w-24">{f.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="ml-1 text-gray-500 hover:text-white"><X size={10} /></button>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] focus-within:border-[var(--neon)] focus-within:ring-1 focus-within:ring-[var(--neon)] focus-within:shadow-[0_0_10px_rgba(0,255,65,0.08)] transition-all duration-300">
          <button onClick={() => fileRef.current?.click()} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Paperclip size={15} />
          </button>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..." className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none min-w-0"
            disabled={isSending} />
          <button onClick={handleSend} disabled={(!input.trim() && files.length === 0) || isSending}
            className="p-1 rounded-lg text-[var(--neon)] hover:bg-[rgba(0,255,65,0.08)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent">
            <Send size={15} />
          </button>
        </div>
        <input ref={fileRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
      </div>
    </div>
  );
}

function ConnectionIndicator() {
  const state = useConnectionState();
  const colors = {
    [ConnectionState.Connected]: 'var(--neon)',
    [ConnectionState.Connecting]: '#ffc800',
    [ConnectionState.Reconnecting]: '#ff3232',
    [ConnectionState.Disconnected]: 'var(--text-muted)',
  };
  const labels = {
    [ConnectionState.Connected]: 'Connected',
    [ConnectionState.Connecting]: 'Connecting',
    [ConnectionState.Reconnecting]: 'Reconnecting',
    [ConnectionState.Disconnected]: 'Disconnected',
  };
  return (
    <div className="flex items-center gap-2" title={labels[state]}>
      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: colors[state] || 'var(--text-muted)', color: colors[state] }} />
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 hidden sm:inline">{labels[state]}</span>
    </div>
  );
}

function ParticipantsBadge() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-gray-300">
      <Users size={12} className="text-[var(--neon)]" />
      <span className="tabular-nums">{participants.length} online</span>
    </div>
  );
}

function ParticipantListPanel({ onClose }) {
  const participants = useParticipants();

  return (
    <div className="flex flex-col h-full w-full sm:w-72 bg-[rgba(10,10,15,0.75)] backdrop-blur-2xl border-l border-[rgba(255,255,255,0.06)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className="text-sm font-semibold text-white">Participants ({participants.length})</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {participants.map(p => (
          <div key={p.identity} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.05)] transition-all duration-300">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--neon), var(--neon-dark))' }}>
              {p.name?.charAt(0)?.toUpperCase() || p.identity?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">
                {p.name || p.identity}
              </p>
              {p.isLocal && <span className="text-[9px] text-[var(--neon)] font-medium">Organizer (you)</span>}
            </div>
            <MicStatus participant={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MicStatus({ participant }) {
  const micPub = participant?.getTrackPublication?.(Track.Source.Microphone);
  const muted = micPub?.isMuted ?? true;
  return muted ? <MicOff size={14} style={{ color: '#ff3232' }} className="shrink-0" /> : <Mic size={14} style={{ color: 'var(--neon)' }} className="shrink-0 animate-pulse" />;
}

function ToggleBtn({ source, icon, offIcon, label }) {
  const { buttonProps, enabled } = useTrackToggle({ source });
  return (
    <button 
      {...buttonProps} 
      className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
        enabled 
          ? 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.05)]' 
          : 'bg-[#ff3232] text-white hover:bg-[#ff5050] border border-red-500 shadow-[0_0_15px_rgba(255,50,50,0.25)]'
      }`}
    >
      {enabled ? icon : offIcon}
      <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none transform -translate-y-1 transition-all duration-200">
        {label}
      </span>
    </button>
  );
}

function CustomControlBar({ 
  onToggleChat, 
  onToggleParticipants, 
  onToggleAttendance, 
  chatOpen, 
  participantsOpen, 
  attendanceOpen,
  isFullscreen,
  onToggleFullscreen
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <ToggleBtn source={Track.Source.Microphone} icon={<Mic size={18} />} offIcon={<MicOff size={18} />} label="Toggle Microphone" />
      <ToggleBtn source={Track.Source.Camera} icon={<Camera size={18} />} offIcon={<CameraOff size={18} />} label="Toggle Camera" />
      <ToggleBtn source={Track.Source.ScreenShare} icon={<ScreenShare size={18} />} offIcon={<ScreenShareOff size={18} />} label="Share Screen" />

      <div className="w-px h-6 bg-[rgba(255,255,255,0.08)] mx-1" />

      {/* Hardware Fullscreen button */}
      <button 
        onClick={onToggleFullscreen}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.05)]`}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
          {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </span>
      </button>

      <div className="w-px h-6 bg-[rgba(255,255,255,0.08)] mx-1" />

      <button 
        onClick={onToggleChat}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
          chatOpen 
            ? 'bg-[rgba(0,255,65,0.12)] text-[var(--neon)] border border-[rgba(0,255,65,0.25)] shadow-[0_0_15px_rgba(0,255,65,0.15)]' 
            : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.05)]'
        }`}
      >
        <MessageSquare size={18} />
        <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
          Toggle Chat
        </span>
      </button>

      <button 
        onClick={onToggleParticipants}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
          participantsOpen 
            ? 'bg-[rgba(0,255,65,0.12)] text-[var(--neon)] border border-[rgba(0,255,65,0.25)] shadow-[0_0_15px_rgba(0,255,65,0.15)]' 
            : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.05)]'
        }`}
      >
        <Users size={18} />
        <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
          Toggle Participants
        </span>
      </button>

      <button 
        onClick={onToggleAttendance}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
          attendanceOpen 
            ? 'bg-[rgba(0,255,65,0.12)] text-[var(--neon)] border border-[rgba(0,255,65,0.25)] shadow-[0_0_15px_rgba(0,255,65,0.15)]' 
            : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.05)]'
        }`}
      >
        <FileSpreadsheet size={18} />
        <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
          Toggle Attendance
        </span>
      </button>

      <div className="w-px h-6 bg-[rgba(255,255,255,0.08)] mx-1" />

      <LeaveButton />
    </div>
  );
}

function LeaveButton() {
  const room = useEnsureRoom();
  return (
    <button 
      onClick={() => room.disconnect()}
      className="relative group w-11 h-11 rounded-xl flex items-center justify-center bg-[#ff3232] text-white hover:bg-[#ff5050] border border-red-500 shadow-[0_0_15px_rgba(255,50,50,0.25)] transition-all duration-300 active:scale-[0.95]"
    >
      <PhoneOff size={18} />
      <span className="absolute bottom-full mb-3 hidden group-hover:flex bg-[#0f0f15]/95 border border-[rgba(255,255,255,0.08)] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
        Leave Room
      </span>
    </button>
  );
}

export default function LiveKitMeeting({ meetingId, roomName: roomNameProp, onLeave }) {
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [showRoom, setShowRoom] = useState(false);
  const [joining, setJoining] = useState(false);
  const [elapsed, setElapsed] = useState('00:00');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const disconnectedRef = useRef(false);
  const elapsedStartRef = useRef(null);
  const meetingContainerRef = useRef(null);

  const handleToggleFullscreen = () => {
    const container = meetingContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleJoin = useCallback(async (username) => {
    setJoining(true);
    try {
      let tk, url;
      if (USE_SANDBOX) {
        const result = await fetchSandboxToken(roomNameProp || meetingId, username || `user_${meetingId}`);
        tk = result.token;
        url = result.serverUrl;
      } else {
        const tokenRes = await meetingsAPI.getLiveKitToken(meetingId);
        tk = tokenRes.data.data.token;
        url = tokenRes.data.data.serverUrl;
      }
      setToken(tk);
      setServerUrl(url);
      setShowRoom(true);
    } catch (err) {
      const msg = err.message || '';
      const respMsg = err.response?.data?.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('Network')) {
        setErrorType('network');
        setError('Could not connect. Check your internet connection.');
      } else if (respMsg.includes('not configured')) {
        setErrorType('config');
        setError('Meeting service is not configured.');
      } else {
        setError(respMsg || msg || 'Failed to join meeting');
      }
    } finally {
      setJoining(false);
    }
  }, [meetingId, roomNameProp]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDisconnected = useCallback(async () => {
    if (disconnectedRef.current) return;
    disconnectedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      if (!USE_SANDBOX) await meetingsAPI.leave(meetingId);
    } catch (e) {}
    onLeave?.();
  }, [meetingId, onLeave]);

  const handleConnected = useCallback(() => {
    if (!USE_SANDBOX) meetingsAPI.join(meetingId).catch(() => {});
    elapsedStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - elapsedStartRef.current) / 1000);
      setElapsed(formatTime(s));
    }, 1000);
  }, [meetingId]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-dark-secondary))' }}>
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" style={{ border: '1px solid rgba(0,255,65,0.1)' }}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${errorType === 'network' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            {errorType === 'network' ? <WifiOff className="w-7 h-7 text-red-400" /> : <ShieldX className="w-7 h-7 text-amber-400" />}
          </div>
          <p className={`font-medium mb-2 ${errorType === 'config' ? 'text-amber-400' : 'text-red-400'}`}>
            {errorType === 'network' ? 'Connection Error' : 'Configuration Error'}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={onLeave} className="neon-btn">Close</button>
        </div>
      </div>
    );
  }

  if (joining) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-dark-secondary))' }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(26,26,37,0.8)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--neon)' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Preparing your session...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Connecting to the meeting service</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showRoom) {
    return (
      <div className="fixed inset-0 z-50" style={{ background: 'var(--bg-dark)' }}>
        <PreJoinScreen onJoin={handleJoin} />
      </div>
    );
  }

  return (
    <div 
      ref={meetingContainerRef} 
      className="fixed inset-0 z-50 flex flex-col bg-[#07070a] overflow-hidden text-white w-full h-full"
    >
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        options={{ adaptiveStream: { pixelDropping: true } }}
        style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />

        <LayoutContextProvider>
          <div className="relative flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Transparent Floating Header */}
            <div className="w-full absolute top-0">
              <header className="flex items-center justify-between px-6 py-4 shrink-0 select-none z-30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse shadow-[0_0_10px_rgba(0,255,65,0.8)]" style={{ background: 'var(--neon)' }} />
                  <span className="text-sm font-semibold tracking-wider uppercase text-white truncate">Live Class</span>
                  <div className="hidden sm:block h-4 w-px bg-[rgba(255,255,255,0.1)]" />
                  <ConnectionIndicator />
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <ParticipantsBadge />
                  <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]" />
                  <span className="tabular-nums font-mono font-semibold px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-gray-300">{elapsed}</span>
                </div>
              </header>
            </div>

            {/* Video + Panel drawers container */}
            <div className="flex-1 flex overflow-hidden relative">
              <main className="flex-1 min-w-0 min-h-0 relative">
                <MeetingLayout />
                
                {/* Floating Bottom Control Bar Dock */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none w-full max-w-fit px-4">
                  <div className="pointer-events-auto flex items-center justify-center px-4 py-3 rounded-2xl bg-[rgba(10,10,15,0.7)] backdrop-blur-2xl border border-[rgba(255,255,255,0.06)] shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
                    <CustomControlBar
                      onToggleChat={() => {
                        setShowChat(v => !v);
                        setShowParticipants(false);
                        setShowAttendance(false);
                      }}
                      onToggleParticipants={() => {
                        setShowParticipants(v => !v);
                        setShowChat(false);
                        setShowAttendance(false);
                      }}
                      onToggleAttendance={() => {
                        setShowAttendance(v => !v);
                        setShowChat(false);
                        setShowParticipants(false);
                      }}
                      chatOpen={showChat}
                      participantsOpen={showParticipants}
                      attendanceOpen={showAttendance}
                      isFullscreen={isFullscreen}
                      onToggleFullscreen={handleToggleFullscreen}
                    />
                  </div>
                </div>
              </main>

              {/* Chat Panel Side-Drawer */}
              {showChat && (
                <div className="fixed md:relative inset-y-0 right-0 z-40 h-full shrink-0 flex shadow-2xl md:shadow-none">
                  <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setShowChat(false)} />
                  <div className="relative z-40 h-full">
                    <ChatPanel onClose={() => setShowChat(false)} />
                  </div>
                </div>
              )}

              {/* Participants Panel Side-Drawer */}
              {showParticipants && (
                <div className="fixed md:relative inset-y-0 right-0 z-40 h-full shrink-0 flex shadow-2xl md:shadow-none">
                  <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setShowParticipants(false)} />
                  <div className="relative z-40 h-full">
                    <ParticipantListPanel onClose={() => setShowParticipants(false)} />
                  </div>
                </div>
              )}

              {/* Attendance Panel Side-Drawer */}
              {showAttendance && (
                <div className="fixed md:relative inset-y-0 right-0 z-40 h-full shrink-0 flex shadow-2xl md:shadow-none">
                  <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setShowAttendance(false)} />
                  <div className="relative z-40 h-full">
                    <AttendancePanel meetingId={meetingId} onClose={() => setShowAttendance(false)} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}
