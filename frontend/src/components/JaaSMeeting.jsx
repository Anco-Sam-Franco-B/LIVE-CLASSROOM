import { useEffect, useState, useRef, useCallback } from 'react';
import { meetingsAPI } from '../services/api';
import { LogOut, Loader2, AlertTriangle, Wifi, Video, ShieldX } from 'lucide-react';

const EXTERNAL_API_URL = 'https://8x8.vc/external_api.js';

function loadExternalApi() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const script = document.createElement('script');
    script.src = EXTERNAL_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load 8x8.vc meeting module'));
    document.head.appendChild(script);
  });
}

export default function JaaSMeeting({ meetingId, onLeave }) {
  const [status, setStatus] = useState('joining');
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const tokenRes = await meetingsAPI.getJaaSToken(meetingId);
        if (cancelled) return;
        const { token, room } = tokenRes.data.data;
        tokenRef.current = token;

        await loadExternalApi();
        if (cancelled) return;

        checkPermissions().then((perms) => {
          if (perms && (perms.camera === 'denied' || perms.microphone === 'denied')) {
            const blocked = [];
            if (perms.camera === 'denied') blocked.push('camera');
            if (perms.microphone === 'denied') blocked.push('microphone');
            setError(`${blocked.join(' & ')} permission blocked. Please enable in browser settings.`);
            setStatus('warning');
          }
        });

        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const backendHost = import.meta.env.DEV ? 'localhost:5000' : window.location.host;
        const domain = `${protocol}//${backendHost}/jaas`;

        const origCreateElement = document.createElement;
        document.createElement = function (tagName, options) {
          const el = origCreateElement.call(document, tagName, options);
          if (tagName.toLowerCase() === 'iframe') {
            let _allow = '';
            Object.defineProperty(el, 'allow', {
              get() { return _allow; },
              set(v) {
                _allow = typeof v === 'string' ? v.replace(/\s*speaker-selection\s*/gi, '').trim() : v;
                el.setAttribute('allow', _allow);
              },
              configurable: true,
              enumerable: true,
            });
          }
          return el;
        };

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: room,
          jwt: token,
          protocol,
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            disableModeratorIndicator: false,
            prejoinPageEnabled: false,
            toolbarButtons: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile',
              'chat', 'raisehand', 'settings',
              'tileview', 'sharedvideo', 'etherpad', 'stats'
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        });

        document.createElement = origCreateElement;

        if (cancelled) { api.dispose(); return; }
        apiRef.current = api;
        setStatus('ready');

        api.addListener('readyToClose', () => { handleLeave(); });
        api.addListener('videoConferenceLeft', () => { handleLeave(); });
        api.addListener('videoConferenceJoined', () => { setStatus('joined'); });
      } catch (err) {
        if (cancelled) return;
        const msg = err.message || '';
        const respMsg = err.response?.data?.message || '';
        if (msg.includes('Failed to load') || msg.includes('Failed to fetch')) {
          setErrorType('network');
          setError('Could not connect to 8x8.vc meeting service. Check your internet connection.');
        } else if (respMsg.includes('not configured') || respMsg.includes('JaaS')) {
          setErrorType('config');
          setError('Meeting service is not configured. Contact the administrator.');
        } else {
          setError(respMsg || msg || 'Failed to join meeting');
        }
        setStatus('error');
      }
    };
    init();
    return () => {
      cancelled = true;
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
    };
  }, [meetingId]);

  const handleLeave = useCallback(async () => {
    try {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
      await meetingsAPI.leave(meetingId);
    } catch (e) {}
    onLeave?.();
  }, [meetingId, onLeave]);

  const checkPermissions = async () => {
    try {
      const cam = await navigator.permissions.query({ name: 'camera' });
      const mic = await navigator.permissions.query({ name: 'microphone' });
      return { camera: cam.state, microphone: mic.state };
    } catch { return null; }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-dark)' }}>
      <div className="px-4 py-2 flex items-center justify-between shrink-0" style={{ background: 'var(--bg-dark-secondary)', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Live Class</span>
        <div className="flex items-center space-x-3">
          {status === 'ready' && (
            <span className="text-xs flex items-center space-x-1" style={{ color: '#ffc800' }}>
              <Loader2 size={12} className="animate-spin" />
              <span>Connecting...</span>
            </span>
          )}
          <button onClick={handleLeave} className="neon-btn-danger flex items-center space-x-2 text-sm px-4 py-1.5">
            <LogOut size={16} />
            <span>Leave Meeting</span>
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full relative">
        {status === 'joining' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="glass rounded-xl p-8 text-center" style={{ border: '1px solid rgba(0,255,65,0.1)' }}>
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--neon)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Joining meeting...</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Connecting to 8x8.vc</p>
            </div>
          </div>
        )}
        {status === 'warning' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="glass rounded-xl p-8 max-w-md text-center" style={{ border: '1px solid rgba(255,200,0,0.2)' }}>
              <ShieldX className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffc800' }} />
              <p className="mb-2" style={{ color: '#ffc800' }}>{error}</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>The meeting will still load but some features may be limited.</p>
              <button onClick={handleLeave} className="neon-btn">Close</button>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="glass rounded-xl p-8 max-w-md text-center" style={{ border: '1px solid rgba(0,255,65,0.1)' }}>
              {errorType === 'network' ? (
                <Wifi className="w-12 h-12 mx-auto mb-4" style={{ color: '#ff3232' }} />
              ) : errorType === 'config' ? (
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffc800' }} />
              ) : (
                <Video className="w-12 h-12 mx-auto mb-4" style={{ color: '#ff3232' }} />
              )}
              <p className={`mb-4 ${errorType === 'config' ? 'text-amber-400' : 'text-red-400'}`}>{error}</p>
              <button onClick={handleLeave} className="neon-btn">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
