import { useState } from 'react';
import { useTracks, useParticipants, useIsSpeaking, useIsMuted, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Monitor, Menu, X } from 'lucide-react';

function SidebarTile({ trackRef, isSelected, onSelect }) {
  const participant = trackRef?.participant;
  const isSpeaking = useIsSpeaking(participant);
  const muted = useIsMuted(Track.Source.Microphone, { participant });
  const isLocal = participant?.isLocal;
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare;
  const name = participant?.name || participant?.identity || 'Unknown';
  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => onSelect(participant?.identity)}
      className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800 transition-all cursor-pointer group text-left ${
        isSelected
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20'
          : isSpeaking
            ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/15'
            : 'ring-1 ring-white/5 hover:ring-white/20'
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
          {initial}
        </div>
      </div>

      <div className="relative z-10 w-full h-full">
        <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-1.5 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="flex items-center gap-1">
          {muted ? (
            <MicOff size={10} className="text-red-400 shrink-0" />
          ) : (
            <Mic size={10} className="text-white shrink-0" />
          )}
          <span className="text-white text-[10px] font-medium truncate">{name}</span>
          {isLocal && <span className="text-gray-400 text-[9px]">(you)</span>}
          {isScreenShare && <Monitor size={10} className="text-indigo-400 shrink-0" />}
        </div>
      </div>
    </button>
  );
}

function MainView({ trackRef }) {
  const participant = trackRef?.participant;
  const isSpeaking = useIsSpeaking(participant);
  const muted = useIsMuted(Track.Source.Microphone, { participant });
  const isLocal = participant?.isLocal;
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare;
  const name = participant?.name || participant?.identity || 'Unknown';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-gray-800 ${
        isSpeaking ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : 'ring-1 ring-white/5'
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-medium shadow-lg shadow-indigo-500/20">
          {initial}
        </div>
      </div>

      <div className="relative z-10 w-full h-full">
        <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
      </div>

      {isScreenShare && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          <Monitor size={14} />
          <span>Screen Share</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="flex items-center gap-2">
          {muted ? (
            <MicOff size={14} className="text-red-400 shrink-0" />
          ) : (
            <Mic size={14} className="text-white shrink-0" />
          )}
          <span className="text-white text-sm font-medium truncate">{name}</span>
          {isLocal && <span className="text-gray-400 text-xs">(you)</span>}
        </div>
      </div>
    </div>
  );
}

function WaitingRoom() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center mx-auto">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="text-gray-100 font-medium">Waiting for participants...</p>
          <p className="text-gray-500 text-sm mt-1">You are the first one here</p>
        </div>
      </div>
    </div>
  );
}

export default function MeetingLayout() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const participants = useParticipants();
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (tracks.length === 0 && participants.length === 0) {
    return <WaitingRoom />;
  }

  const screenShareTracks = tracks.filter(t => t.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);

  let mainTrack = null;
  if (screenShareTracks.length > 0) {
    mainTrack = screenShareTracks[0];
  } else if (selectedIdentity) {
    mainTrack = tracks.find(t => t.participant?.identity === selectedIdentity);
  } else if (cameraTracks.length > 0) {
    mainTrack = cameraTracks[0];
  }

  const sidebarTracks = cameraTracks.filter(t => {
    if (!mainTrack) return true;
    return t.participant?.identity !== mainTrack.participant?.identity;
  });

  const sidebarContent = (
    <div className="flex flex-col gap-1.5 overflow-y-auto">
      {sidebarTracks.map((trackRef) => (
        <SidebarTile
          key={trackRef.participant?.identity + '_' + trackRef.source}
          trackRef={trackRef}
          isSelected={trackRef.participant?.identity === selectedIdentity}
          onSelect={(id) => { setSelectedIdentity(id); setSidebarOpen(false); }}
        />
      ))}
      {sidebarTracks.length === 0 && (
        <p className="text-gray-500 text-[10px] text-center py-4">No other participants</p>
      )}
    </div>
  );

  return (
    <div className="relative flex h-full">
      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/60 flex flex-col p-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-white text-xs font-medium">Participants</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
                <X size={14} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'w-44 xl:w-52 p-2' : 'w-0 p-0'
        }`}
      >
        <div className="flex items-center justify-between mb-2 px-1 shrink-0">
          <span className="text-gray-400 text-xs font-medium">Participants</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800/60 transition-colors">
            <X size={12} />
          </button>
        </div>
        {sidebarOpen && sidebarContent}
      </aside>

      {/* Main view */}
      <main className="relative flex-1 min-w-0 min-h-0">
        {mainTrack ? <MainView trackRef={mainTrack} /> : (
          <div className="flex items-center justify-center h-full bg-gray-900 rounded-2xl">
            <p className="text-gray-500 text-sm">No participants yet</p>
          </div>
        )}

        {/* Hamburger overlay - visible when sidebar is closed on any screen */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-2 left-2 z-20 p-2 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-white transition-colors shadow-lg backdrop-blur-sm"
            title="Show participants"
          >
            <Menu size={16} />
          </button>
        )}
      </main>
    </div>
  );
}
