import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useIsMuted,
  useIsSpeaking,
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
          video: selectedCam ? { deviceId: { exact: selectedCam }, width: 320, height: 240 } : { width: 320, height: 240, facingMode: 'user' },
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {}
    };
    startPreview();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [selectedCam, selectedMic]);

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full max-w-2xl">
        <div className="relative w-full max-w-xs sm:w-80 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800 shadow-2xl shadow-black/40 ring-1 ring-white/5">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm">
              <div className="text-center">
                <CameraOff size={40} className="text-gray-500 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Camera off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
            <button
              onClick={toggleAudio}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${audioEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/80 text-white'}`}
              title={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${videoEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/80 text-white'}`}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start gap-4 w-full max-w-xs">
          <div className="text-center sm:text-left">
            <h1 className="text-white text-xl font-semibold">Join Live Class</h1>
            <p className="text-gray-400 text-sm mt-1">Set up your devices before joining</p>
          </div>

          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && username.trim() && onJoin(username)}
            className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 placeholder-gray-500 transition-all"
          />

          <button
            onClick={() => setShowDevices(!showDevices)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <Settings size={14} />
            Device settings
          </button>

          {showDevices && (
            <div className="w-full bg-gray-800/60 rounded-xl p-3 space-y-2 border border-gray-700/40">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Camera</label>
                <select
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(e.target.value)}
                  className="w-full bg-gray-700/60 text-white text-xs rounded-lg px-3 py-2 border border-gray-600/50 focus:outline-none focus:border-indigo-500"
                >
                  {devices.filter(d => d.kind === 'videoinput').map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Microphone</label>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full bg-gray-700/60 text-white text-xs rounded-lg px-3 py-2 border border-gray-600/50 focus:outline-none focus:border-indigo-500"
                >
                  {devices.filter(d => d.kind === 'audioinput').map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 8)}`}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={() => onJoin(username)}
            disabled={!username.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-xl text-sm transition-all disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Join Room
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
    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800/60 w-full sm:w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-400" />
          <h3 className="text-white text-sm font-medium">Chat</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">No messages yet</p>
          </div>
        )}
        {chatMessages.map((msg, i) => {
          const isLocal = msg.from?.isLocal;
          const showName = i === 0 || chatMessages[i - 1]?.from?.identity !== msg.from?.identity;
          return (
            <div key={msg.id || i} className={`flex gap-2.5 ${isLocal ? 'flex-row-reverse' : ''}`}>
              {showName && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-medium shrink-0 mt-0.5">
                  {(msg.from?.name || msg.from?.identity || '?').charAt(0).toUpperCase()}
                </div>
              )}
              {!showName && <div className="w-7 shrink-0" />}
              <div className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'} max-w-[85%]`}>
                {showName && (
                  <span className="text-[10px] text-gray-500 mb-0.5 px-1">
                    {msg.from?.name || msg.from?.identity}
                    {isLocal && ' (you)'}
                  </span>
                )}
                <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words space-y-2 ${
                  isLocal
                    ? 'bg-indigo-600 text-white rounded-tr-md'
                    : 'bg-gray-800 text-gray-100 rounded-tl-md'
                }`}>
                  <span>{msg.message}</span>
                  {msg.attachedFiles?.map((file, fi) => (
                    file.type?.startsWith('image/') ? (
                      <div key={fi} className="rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="max-w-full h-auto rounded-lg"
                          onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                        />
                      </div>
                    ) : (
                      <div key={fi} className="flex items-center gap-2 text-xs opacity-80">
                        <FileIcon size={14} />
                        <span className="truncate">{file.name}</span>
                        <span className="opacity-60">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    )
                  ))}
                </div>
                <span className="text-[9px] text-gray-600 mt-0.5 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 rounded-xl">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-700/60 rounded-lg px-3 py-2 text-xs">
                {f.type.startsWith('image/') ? <ImageIcon size={14} className="text-indigo-400" /> : <FileIcon size={14} className="text-gray-400" />}
                <span className="text-gray-300 truncate max-w-24">{f.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-500 hover:text-white ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-800/60">
        <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl px-3 py-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700/60 transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none min-w-0"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || isSending}
            className="text-indigo-400 hover:text-indigo-300 p-1 rounded-lg hover:bg-indigo-500/10 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
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
    [ConnectionState.Connected]: 'bg-green-500',
    [ConnectionState.Connecting]: 'bg-yellow-500 animate-pulse',
    [ConnectionState.Reconnecting]: 'bg-red-500 animate-pulse',
    [ConnectionState.Disconnected]: 'bg-gray-500',
  };
  const labels = {
    [ConnectionState.Connected]: 'Connected',
    [ConnectionState.Connecting]: 'Connecting...',
    [ConnectionState.Reconnecting]: 'Reconnecting...',
    [ConnectionState.Disconnected]: 'Disconnected',
  };
  return (
    <div className="flex items-center gap-2" title={labels[state]}>
      <div className={`w-2 h-2 rounded-full ${colors[state] || 'bg-gray-500'}`} />
      <span className="text-gray-400 text-xs hidden sm:inline">{labels[state]}</span>
    </div>
  );
}

function ParticipantsBadge() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-1.5 text-gray-300 text-sm">
      <Users size={14} />
      <span className="font-medium tabular-nums">{participants.length}</span>
    </div>
  );
}

function ParticipantListPanel({ onClose }) {
  const participants = useParticipants();

  return (
    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800/60 w-full sm:w-72">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <h3 className="text-white text-sm font-medium">Participants ({participants.length})</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {participants.map(p => (
          <div
            key={p.identity}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {p.name?.charAt(0)?.toUpperCase() || p.identity?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">
                {p.name || p.identity}
                {p.isLocal && <span className="text-gray-400 text-xs ml-1">(you)</span>}
              </p>
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
  return muted ? <MicOff size={14} className="text-red-400 shrink-0" /> : <Mic size={14} className="text-green-400 shrink-0" />;
}

function ToggleBtn({ source, icon, offIcon, label }) {
  const { buttonProps, enabled } = useTrackToggle({ source });
  return (
    <button {...buttonProps} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      enabled
        ? 'bg-gray-700/80 text-white hover:bg-gray-600/80'
        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
    }`} title={label}>
      {enabled ? icon : offIcon}
      <span className="hidden sm:inline text-xs">{label}</span>
    </button>
  );
}

function CustomControlBar({ onToggleChat, onToggleParticipants, onToggleAttendance, chatOpen, participantsOpen, attendanceOpen }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3">
      <ToggleBtn source={Track.Source.Microphone} icon={<Mic size={18} />} offIcon={<MicOff size={18} />} label="Mic" />
      <ToggleBtn source={Track.Source.Camera} icon={<Camera size={18} />} offIcon={<CameraOff size={18} />} label="Camera" />
      <ToggleBtn source={Track.Source.ScreenShare} icon={<ScreenShare size={18} />} offIcon={<ScreenShareOff size={18} />} label="Share" />

      <div className="w-px h-7 bg-gray-700/60 hidden sm:block" />

      <button
        onClick={onToggleChat}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          chatOpen
            ? 'bg-indigo-500/20 text-indigo-400'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
        }`}
        title="Chat"
      >
        <MessageSquare size={18} />
        <span className="hidden sm:inline text-xs">Chat</span>
      </button>
      <button
        onClick={onToggleParticipants}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          participantsOpen
            ? 'bg-indigo-500/20 text-indigo-400'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
        }`}
        title="Participants"
      >
        <Users size={18} />
        <span className="hidden sm:inline text-xs">People</span>
      </button>
      <button
        onClick={onToggleAttendance}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          attendanceOpen
            ? 'bg-indigo-500/20 text-indigo-400'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
        }`}
        title="Attendance"
      >
        <FileSpreadsheet size={18} />
        <span className="hidden sm:inline text-xs">Attendance</span>
      </button>

      <div className="w-px h-7 bg-gray-700/60" />

      <LeaveButton />
    </div>
  );
}

function LeaveButton() {
  const room = useEnsureRoom();
  return (
    <button
      onClick={() => room.disconnect()}
      className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 shadow-lg shadow-red-600/20"
      title="Leave"
    >
      <PhoneOff size={18} />
      <span className="hidden sm:inline text-xs">Leave</span>
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
  const timerRef = useRef(null);
  const disconnectedRef = useRef(false);
  const elapsedStartRef = useRef(null);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full text-center border border-gray-800/60 shadow-2xl">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${errorType === 'network' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            {errorType === 'network' ? <WifiOff className="w-7 h-7 text-red-400" /> : <ShieldX className="w-7 h-7 text-amber-400" />}
          </div>
          <p className={`font-medium mb-2 ${errorType === 'config' ? 'text-amber-400' : 'text-red-400'}`}>
            {errorType === 'network' ? 'Connection Error' : 'Configuration Error'}
          </p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={onLeave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (joining) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/80 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">Preparing your session...</p>
            <p className="text-gray-500 text-sm mt-1">Connecting to the meeting service</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showRoom) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950">
        <PreJoinScreen onJoin={handleJoin} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        options={{ adaptiveStream: { pixelDropping: true } }}
        style={{ height: '100%', width: '100%' }}
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />

        <LayoutContextProvider>
          <div className="flex flex-col h-full">
            <header className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/60 shrink-0 select-none gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                <span className="text-white text-sm font-medium truncate">Live Class</span>
                <ConnectionIndicator />
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-gray-300 text-sm">
                <ParticipantsBadge />
                <span className="text-gray-400 tabular-nums font-mono text-xs sm:text-sm">{elapsed}</span>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <main className="flex-1 min-w-0 min-h-0">
                <MeetingLayout />
              </main>

              {showParticipants && (
                <aside className="hidden sm:block shrink-0">
                  <ParticipantListPanel onClose={() => setShowParticipants(false)} />
                </aside>
              )}
              {showChat && (
                <aside className="hidden sm:block shrink-0">
                  <ChatPanel onClose={() => setShowChat(false)} />
                </aside>
              )}
              {showAttendance && (
                <aside className="hidden sm:block shrink-0">
                  <AttendancePanel meetingId={meetingId} onClose={() => setShowAttendance(false)} />
                </aside>
              )}
            </div>

            <footer className="shrink-0 flex justify-center px-3 py-2 sm:py-3 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/60">
              <CustomControlBar
                onToggleChat={() => setShowChat(v => !v)}
                onToggleParticipants={() => setShowParticipants(v => !v)}
                onToggleAttendance={() => setShowAttendance(v => !v)}
                chatOpen={showChat}
                participantsOpen={showParticipants}
                attendanceOpen={showAttendance}
              />
            </footer>
          </div>

          {showParticipants && (
            <div className="sm:hidden fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowParticipants(false)} />
              <ParticipantListPanel onClose={() => setShowParticipants(false)} />
            </div>
          )}
          {showChat && (
            <div className="sm:hidden fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowChat(false)} />
              <ChatPanel onClose={() => setShowChat(false)} />
            </div>
          )}
          {showAttendance && (
            <div className="sm:hidden fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowAttendance(false)} />
              <AttendancePanel meetingId={meetingId} onClose={() => setShowAttendance(false)} />
            </div>
          )}
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}
