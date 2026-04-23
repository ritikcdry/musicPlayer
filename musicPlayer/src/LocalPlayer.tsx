import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Song = {
  name: string;
  url: string;
  cover: string;
  hue: number;
};

const getRandomCover = () =>
  `https://picsum.photos/200?random=${Math.floor(Math.random() * 9999)}`;

const getRandomHue = () => Math.floor(Math.random() * 360);

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const LocalPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newSongs: Song[] = files.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      cover: getRandomCover(),
      hue: getRandomHue(),
    }));
    setSongs((prev) => [...prev, ...newSongs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const safePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setTimeout(() => { audio.play().catch(() => {}); setIsPlaying(true); }, 30);
  };

  const playSong = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !songs.length) return;
    setCurrentIndex(index);
    setCurrentSong(songs[index]);
    setTimeout(() => { audio.src = songs[index].url; audio.currentTime = 0; safePlay(); }, 50);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) safePlay();
    else { audio.pause(); setIsPlaying(false); }
  };

  const nextSong = () => {
    if (!songs.length) return;
    if (isShuffle) playSong(Math.floor(Math.random() * songs.length));
    else playSong((currentIndex + 1) % songs.length);
  };

  const prevSong = () => {
    if (!songs.length) return;
    playSong((currentIndex - 1 + songs.length) % songs.length);
  };

  const deleteSong = (index: number) => {
    const updated = songs.filter((_, i) => i !== index);
    setSongs(updated);
    if (!updated.length) { setCurrentIndex(0); return; }
    if (index < currentIndex) setCurrentIndex((p) => p - 1);
    else if (index === currentIndex) setCurrentIndex(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (!audio.duration) return;
      if (!isSeeking) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
      setDuration(audio.duration);
    };
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [isSeeking]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const value = Number(e.target.value);
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
    setCurrentTime(audio.currentTime);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v); setPrevVolume(v); setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = prevVolume;
      setVolume(prevVolume); setIsMuted(false);
    } else {
      setPrevVolume(volume);
      audioRef.current.volume = 0;
      setVolume(0); setIsMuted(true);
    }
  };

  const handleEnd = () => {
    if (isRepeat) safePlay();
    else nextSong();
  };

  return (
    <div className="flex h-screen w-full bg-[#080b0f] text-white font-sans relative">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        .seek-thumb-hidden::-webkit-slider-thumb { opacity: 0; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .art-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Ambient orbs */}
      <div className="fixed w-96 h-96 rounded-full -top-24 -left-20 blur-[100px] opacity-20 pointer-events-none z-0 bg-green-800" />
      <div className="fixed w-80 h-80 rounded-full -bottom-16 -right-16 blur-[100px] opacity-15 pointer-events-none z-0 bg-emerald-900" />

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-[#080b0f]/90 backdrop-blur-2xl border-r border-white/8 flex-col p-7 z-30 hidden md:flex">
        <div className="mb-9">
          <div className="text-green-400 font-syne font-extrabold text-sm tracking-tight mb-1">🎧 Music Player</div>
          <div className="text-white/35 font-mono-dm text-[11px] tracking-wide">Local Collection</div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-green-400 bg-green-500/10 font-syne font-semibold text-[13px] w-full text-left transition-all hover:text-white hover:bg-white/8"
          >
            <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Home
          </button>
          <button className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/35 hover:text-white hover:bg-white/5 font-syne font-semibold text-[13px] w-full text-left transition-all">
            <span className="material-symbols-rounded text-lg">search</span>
            Search
          </button>
          <button className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/35 hover:text-white hover:bg-white/5 font-syne font-semibold text-[13px] w-full text-left transition-all">
            <span className="material-symbols-rounded text-lg">library_music</span>
            Library
          </button>
        </nav>
        <p className="text-[10px] text-white/15 font-mono-dm text-center">Local audio only · No streaming</p>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-60 md:mr-80 flex flex-col items-center justify-center p-5 md:p-8 relative z-10 overflow-y-auto pb-20 md:pb-8">

        {/* Upload button */}
        <label className="absolute top-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-white/70 hover:text-white hover:bg-white/10 hover:border-green-500/50 font-syne font-bold text-xs cursor-pointer transition-all">
          <input type="file" accept="audio/*" multiple onChange={handleUpload} ref={fileInputRef} className="hidden" />
          <span className="material-symbols-rounded text-base">upload</span>
          Upload Music
        </label>

        {/* Mobile upload */}
        <label className="md:hidden self-end mb-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-white/70 font-syne font-bold text-xs cursor-pointer transition-all hover:bg-white/10">
          <input type="file" accept="audio/*" multiple onChange={handleUpload} className="hidden" />
          <span className="material-symbols-rounded text-base">upload</span>
          Upload
        </label>

        {/* Player card */}
        <div className="w-full max-w-sm bg-white/4 backdrop-blur-3xl border border-white/8 rounded-[28px] p-7 md:p-8 flex flex-col items-center relative overflow-hidden">
          {/* card gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent pointer-events-none rounded-[28px]" />

          {/* Album art */}
          <div className={`w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden mb-6 flex-shrink-0 shadow-2xl ring-1 ring-white/10 relative z-10 ${isPlaying ? "art-float" : ""}`}>
            {currentSong ? (
              <img src={currentSong.cover} alt={currentSong.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/4 flex flex-col items-center justify-center gap-2.5">
                <span className="material-symbols-rounded text-5xl text-white/15">library_music</span>
                <p className="text-white/25 text-[11px] text-center px-4 font-mono-dm">Upload songs to begin</p>
              </div>
            )}
          </div>

          {/* Song info */}
          <div className="text-center mb-5 w-full relative z-10">
            <div className="text-white font-syne font-extrabold text-base tracking-tight truncate mb-1">
              {currentSong?.name ?? "No track selected"}
            </div>
            <div className="text-green-400 font-mono-dm text-[11px] tracking-widest uppercase">
              {currentSong ? "Local Track" : "—"}
            </div>
          </div>

          {/* Progress */}
          <div className="w-full mb-5 relative z-10">
            <div className="flex justify-between font-mono-dm text-[10px] text-white/35 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative w-full h-1 rounded-full bg-white/10 group cursor-pointer">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              {/* thumb dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(74,222,128,0.8)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progress}%` }}
              />
              <input
                type="range" min={0} max={100} value={progress}
                onChange={handleSeek}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
                onTouchStart={() => setIsSeeking(true)}
                onTouchEnd={() => setIsSeeking(false)}
                disabled={!currentSong}
                className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:pointer-events-none"
                style={{ margin: 0, height: "100%" }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-5 w-full relative z-10">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              disabled={!currentSong}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-25 ${isShuffle ? "text-green-400" : "text-white/35 hover:text-white hover:bg-white/6"}`}
            >
              <span className="material-symbols-rounded text-xl">shuffle</span>
            </button>
            <button
              onClick={prevSong} disabled={!currentSong}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/6 transition-all disabled:opacity-25"
            >
              <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
            </button>
            <button
              onClick={togglePlayPause} disabled={!currentSong}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-green-400 text-black shadow-[0_0_28px_rgba(74,222,128,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
              <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button
              onClick={nextSong} disabled={!currentSong}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/6 transition-all disabled:opacity-25"
            >
              <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              disabled={!currentSong}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-25 ${isRepeat ? "text-green-400" : "text-white/35 hover:text-white hover:bg-white/6"}`}
            >
              <span className="material-symbols-rounded text-xl">repeat</span>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full relative z-10">
            <button
            onClick={toggleMute}
            disabled={!currentSong}
            className="text-white/35 hover:text-white transition-colors disabled:opacity-25 flex-shrink-0 leading-none flex items-center justify-center"
            >
            <span className="material-symbols-rounded text-base leading-none">
            {isMuted || volume === 0 ? "volume_off" : volume < 0.4 ? "volume_down" : "volume_up"}
            </span>
            </button>

          {/* Volume slider — vertically aligned with button using translate */}
          <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={changeVolume}
          disabled={!currentSong}
          className="flex-1 accent-blue-500 drop-shadow-[0_0_8px_#3b82f6] cursor-pointer disabled:opacity-40"
          style={{ height: "3px", marginTop: "0", verticalAlign: "middle" }}
          />
        </div>
        </div>
      </main>

      {/* ── Desktop Playlist Panel ── */}
      <aside className="fixed right-0 top-0 h-full w-80 bg-[#080b0f]/90 backdrop-blur-2xl border-l border-white/8 flex-col z-30 hidden md:flex">
        <div className="flex items-center justify-between px-5 py-7 border-b border-white/8">
          <span className="text-green-400 font-syne font-extrabold text-sm">Playlist</span>
          <span className="text-[10px] font-mono-dm text-white/35 bg-white/5 px-2.5 py-1 rounded-full">{songs.length} tracks</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/25">
              <span className="material-symbols-rounded text-4xl opacity-30">queue_music</span>
              <p className="text-xs font-mono-dm">No tracks yet</p>
            </div>
          ) : (
            songs.map((song, index) => (
              <div
                key={index}
                onClick={() => playSong(index)}
                className={`group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all mb-0.5 border ${
                  index === currentIndex && currentSong
                    ? "bg-green-500/8 border-green-500/20"
                    : "border-transparent hover:bg-white/4"
                }`}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img src={song.cover} alt={song.name} className="w-full h-full object-cover" />
                  {index === currentIndex && currentSong && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="material-symbols-rounded text-green-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>equalizer</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-syne font-bold truncate mb-0.5 ${index === currentIndex && currentSong ? "text-green-400" : "text-white"}`}>
                    {song.name}
                  </p>
                  <p className="text-[10px] font-mono-dm text-white/30 tracking-wide">Local Track</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSong(index); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <span className="material-symbols-rounded text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-[#06080c]/95 backdrop-blur-2xl border-t border-white/8 z-50 flex justify-around items-center px-2">
        <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 text-green-400 hover:text-white transition-colors px-4 py-2 rounded-xl font-syne font-bold text-[9px]">
          <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          Home
        </button>
        <button className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white transition-colors px-4 py-2 rounded-xl font-syne font-bold text-[9px]">
          <span className="material-symbols-rounded text-xl">search</span>
          Search
        </button>
        <button
          onClick={() => setShowPlaylist(true)}
          className={`relative flex flex-col items-center gap-0.5 transition-colors px-4 py-2 rounded-xl font-syne font-bold text-[9px] ${showPlaylist ? "text-green-400" : "text-white/30 hover:text-white"}`}
        >
          {songs.length > 0 && (
            <span className="absolute top-1 right-2 min-w-[16px] h-4 bg-green-400 text-black text-[8px] font-extrabold rounded-full flex items-center justify-center px-1">
              {songs.length > 9 ? "9+" : songs.length}
            </span>
          )}
          <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: songs.length > 0 ? "'FILL' 1" : "'FILL' 0" }}>queue_music</span>
          Playlist
        </button>
        <button className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white transition-colors px-4 py-2 rounded-xl font-syne font-bold text-[9px]">
          <span className="material-symbols-rounded text-xl">library_music</span>
          Library
        </button>
      </nav>

      {/* ── Mobile Playlist Drawer ── */}
      {showPlaylist && (
        <div className="md:hidden fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex flex-col justify-end" onClick={() => setShowPlaylist(false)}>
          <div className="bg-[#0d1117] border-t border-white/8 rounded-t-3xl max-h-[78vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="w-9 h-1 bg-white/15 rounded-full mx-auto mt-3 flex-shrink-0" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <span className="text-green-400 font-syne font-extrabold text-sm">Playlist · {songs.length} tracks</span>
              <button onClick={() => setShowPlaylist(false)} className="w-7 h-7 rounded-full bg-white/6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 transition-all">
                <span className="material-symbols-rounded text-base">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
              {songs.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3 text-white/25">
                  <span className="material-symbols-rounded text-4xl opacity-30">queue_music</span>
                  <p className="text-xs font-mono-dm">No tracks yet</p>
                </div>
              ) : (
                songs.map((song, index) => (
                  <div
                    key={index}
                    onClick={() => { playSong(index); setShowPlaylist(false); }}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all mb-0.5 border ${
                      index === currentIndex && currentSong
                        ? "bg-green-500/8 border-green-500/20"
                        : "border-transparent hover:bg-white/4"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img src={song.cover} alt={song.name} className="w-full h-full object-cover" />
                      {index === currentIndex && currentSong && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="material-symbols-rounded text-green-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>equalizer</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-syne font-bold truncate mb-0.5 ${index === currentIndex && currentSong ? "text-green-400" : "text-white"}`}>
                        {song.name}
                      </p>
                      <p className="text-[10px] font-mono-dm text-white/30 tracking-wide">Local Track</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSong(index); }}
                      className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <span className="material-symbols-rounded text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={currentSong?.url} onEnded={handleEnd} />
    </div>
  );
};

export default LocalPlayer;