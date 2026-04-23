import React, { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { useNavigate } from "react-router-dom";
import useYoutubeDownload from "./hooks/useYoutubeDownload";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const getRandomCover = () => `https://picsum.photos/200?random=${Math.floor(Math.random() * 1000)}`;

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const YouTubePlayer: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const { loading: downloading, error: downloadError, downloadAudio } = useYoutubeDownload();
  const playerRef = useRef<any>(null);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  // Detect landscape mode
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Show mini player when main player scrolls out of view
  useEffect(() => {
    if (!videoId) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowMiniPlayer(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (playerSectionRef.current) observer.observe(playerSectionRef.current);
    return () => observer.disconnect();
  }, [videoId]);

  const search = async () => {
    if (!query.trim()) return;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=6&key=${API_KEY}`
    );
    const data = await res.json();
    setResults(data.items || []);
    setShowDropdown(true);
  };

  const play = (item: any) => {
    const id = item?.id?.videoId;
    const title = item?.snippet?.title ?? "";
    const thumb = item?.snippet?.thumbnails?.medium?.url || getRandomCover();
    setVideoId(id);
    setCurrentTitle(title);
    setCurrentThumbnail(thumb);
    setHistory((prev) => [item, ...prev.filter((h) => h.id.videoId !== id)]);
    setShowDropdown(false);
    setIsPlaying(true);
    setQuery("");
    setResults([]);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const deleteHistory = (i: number) => setHistory((prev) => prev.filter((_, idx) => idx !== i));
  const clearHistory = () => setHistory([]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    const dur = playerRef.current?.getDuration();
    if (dur) playerRef.current.seekTo((value / 100) * dur);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    playerRef.current?.setVolume(value);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    isMuted ? playerRef.current.unMute() : playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  const scrollToPlayer = () => {
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const dur = playerRef.current.getDuration();
        const cur = playerRef.current.getCurrentTime();
        if (dur) {
          setProgress((cur / dur) * 100);
          setCurrentTime(cur);
          setDuration(dur);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex h-screen w-full overflow-hidden text-white"
      style={{ fontFamily: "'Spline Sans', sans-serif", backgroundColor: "#0a0a0a" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .glass-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-dark {
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .glow-green { box-shadow: 0 0 24px rgba(34,197,94,0.4); }
        .glow-red   { box-shadow: 0 0 16px rgba(239,68,68,0.35); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }

        /* Custom range sliders */
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 99px; background: rgba(255,255,255,0.1); }
        input[type=range].green-track::-webkit-slider-runnable-track { background: linear-gradient(to right, #22c55e var(--val,0%), rgba(255,255,255,0.1) var(--val,0%)); }
        input[type=range].blue-track::-webkit-slider-runnable-track  { background: linear-gradient(to right, #3b82f6 var(--val,0%), rgba(255,255,255,0.1) var(--val,0%)); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; margin-top: -6px; cursor: pointer; transition: transform .15s; }
        input[type=range].green-track::-webkit-slider-thumb { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.7); }
        input[type=range].blue-track::-webkit-slider-thumb  { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.7); }
        input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.3); }
        input[type=range]:disabled { opacity: 0.3; pointer-events: none; }

        /* Mobile touch — bigger thumb */
        @media (max-width: 768px) {
          input[type=range]::-webkit-slider-thumb { width: 20px; height: 20px; margin-top: -8px; }
          input[type=range]::-webkit-slider-runnable-track { height: 5px; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.2); border-radius: 10px; }

        .history-row:hover .delete-btn { opacity: 1; }
        .nav-link { transition: all .2s; }
        .nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; }

        /* Mini player slide-up */
        .mini-player-enter { animation: slideUp .25s ease forwards; }
        @keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }

        /* Landscape mobile adjustments */
        @media (max-height: 500px) and (orientation: landscape) {
          .landscape-compact { flex-direction: row !important; gap: 1rem !important; }
          .landscape-art { width: 100px !important; height: 100px !important; }
          .landscape-hide { display: none !important; }
        }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full flex-col p-5 bg-gray-950 w-64 border-r border-white/5 hidden lg:flex z-40">
        <div className="mb-10 px-3">
          <span className="text-lg font-black text-green-500 tracking-tight">YouTube Player 🎧</span>
          <p className="text-xs text-white/30 mt-1">Your Collection</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-green-400 bg-green-500/10 font-semibold text-[13px] w-full text-left transition-all hover:text-white hover:bg-white/8"
          >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          Home
          </button>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-pointer">
            <span className="material-symbols-outlined">explore</span><span>Explore</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-pointer">
            <span className="material-symbols-outlined">library_music</span><span>Library</span>
          </a>
        </nav>
        <div className="px-3 py-3 border-t border-white/5">
          <p className="text-[10px] text-white/20 text-center">Powered by YouTube API</p>
        </div>
      </aside>

      {/* ── Main scroll area ── */}
      <main className="flex-1 lg:ml-64 flex flex-col bg-gradient-to-b from-gray-950 to-black overflow-y-auto">

        {/* ── Search Header ── */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 w-full bg-black/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
          {/* Mobile logo — hidden on desktop */}
          <span className="text-green-500 font-black text-sm whitespace-nowrap lg:hidden">YT 🎧</span>

          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-white/30 text-base pointer-events-none">music_note</span>
              <input
                className="w-full bg-white/8 border border-white/10 text-white placeholder-white/30 pl-10 pr-12 py-2.5 rounded-xl text-sm focus:outline-none focus:border-green-500/60 focus:bg-white/10 transition-all"
                placeholder="Search songs, artists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => { e.stopPropagation(); search(); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 glow-red"
              >
                <span className="material-symbols-outlined text-sm">search</span>
              </button>

              {/* Search dropdown */}
              {showDropdown && results.length > 0 && (
                <div
                  className="absolute left-0 top-full mt-2 w-full bg-gray-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {results.map((item, i) => (
                    <div key={i} onClick={() => play(item)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/8 active:bg-white/12 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                      <img src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                        className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.snippet.title}</p>
                        <p className="text-xs text-white/35 truncate">{item.snippet.channelTitle}</p>
                      </div>
                      <span className="material-symbols-outlined text-white/20 text-base shrink-0">play_circle</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <div className="p-3 sm:p-5 md:p-8 space-y-4 pb-24 lg:pb-10 flex flex-col items-center">

          {/* ── Player Card ── */}
          <section ref={playerSectionRef} className="w-full max-w-4xl">
            <div className={`glass-card rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl flex gap-5 md:gap-8
              ${isLandscape ? "flex-row items-center landscape-compact" : "flex-col sm:flex-row items-center"}`}>

              {/* Album Art */}
              <div className={`shrink-0 ${isLandscape ? "landscape-art" : ""}`}>
                {currentThumbnail ? (
                  <img src={currentThumbnail}
                    className={`rounded-2xl object-cover shadow-2xl ring-1 ring-white/10
                      ${isLandscape ? "w-28 h-28" : "w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"}`}
                  />
                ) : (
                  <div className={`rounded-2xl bg-white/4 border border-white/8 flex flex-col items-center justify-center gap-2
                    ${isLandscape ? "w-28 h-28" : "w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"}`}>
                    <span className="material-symbols-outlined text-4xl text-white/15">music_note</span>
                    <p className="text-white/20 text-[10px] text-center px-4">Search to start</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 min-w-0 w-full flex flex-col gap-3 sm:gap-4">

                {/* Title */}
                <div className={isLandscape ? "" : ""}>
                  <span className="text-green-400 font-bold tracking-widest text-[9px] uppercase mb-1 block">Now Playing</span>
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-white truncate w-full leading-tight">
                    {currentTitle || "No song selected"}
                  </h1>
                  <p className="text-white/35 text-xs mt-0.5">{videoId ? "YouTube Stream" : "Search above to play"}</p>
                </div>

                {videoId && (
                  <YouTube videoId={videoId}
                    opts={{ height: "0", width: "0", playerVars: { autoplay: 1 } }}
                    onReady={(e) => { playerRef.current = e.target; e.target.playVideo(); e.target.setVolume(volume); }}
                  />
                )}

                {/* Progress */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[10px] text-white/35 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input type="range" min="0" max="100" value={progress}
                    onChange={handleSeek} disabled={!videoId}
                    className="w-full green-track"
                    style={{ "--val": `${progress}%` } as any}
                  />
                </div>

                {/* Prev / Play / Next — bigger tap targets on mobile */}
                <div className="flex items-center gap-4 sm:gap-5 justify-center py-1">
                  <button disabled={!videoId}
                    className="w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 active:bg-white/15 transition-all active:scale-90 disabled:opacity-25">
                    <span className="material-symbols-outlined text-2xl">skip_previous</span>
                  </button>
                  <button onClick={togglePlay} disabled={!videoId}
                    className="w-16 h-16 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl glow-green active:scale-90 transition-all disabled:opacity-30">
                    <span className="material-symbols-outlined text-black text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  <button disabled={!videoId}
                    className="w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 active:bg-white/15 transition-all active:scale-90 disabled:opacity-25">
                    <span className="material-symbols-outlined text-2xl">skip_next</span>
                  </button>
                </div>

                {/* Volume — hidden in landscape to save space */}
                <div className={`flex items-center gap-3 w-full ${isLandscape ? "landscape-hide" : ""}`}>
                  <button onClick={toggleMute} disabled={!videoId}
                    className="shrink-0 disabled:opacity-30 text-white/50 hover:text-white transition-colors w-8 h-8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">
                      {isMuted ? "volume_off" : volume > 50 ? "volume_up" : "volume_down"}
                    </span>
                  </button>
                  <input type="range" min="0" max="100" value={volume}
                    onChange={handleVolume} disabled={!videoId}
                    className="flex-1 blue-track"
                    style={{ "--val": `${volume}%` } as any}
                  />
                  <span className="text-[10px] text-white/30 font-mono w-6 text-right">{volume}</span>
                </div>

                {/* Download */}
                <button
                  onClick={() => videoId && downloadAudio(videoId, currentTitle)}
                  disabled={downloading || !videoId}
                  className="mx-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold rounded-xl active:scale-95 transition-all shadow-lg glow-green disabled:opacity-30 text-sm max-w-xs w-full"
                >
                  <span className="material-symbols-outlined text-sm">{downloading ? "hourglass_top" : "download"}</span>
                  <span>{downloading ? "Downloading..." : "Download MP3"}</span>
                </button>

                {downloadError && <p className="text-red-400 text-xs">{downloadError}</p>}
              </div>
            </div>
          </section>

          {/* ── History ── */}
          <section className="w-full max-w-4xl">
            <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col max-h-72 sm:max-h-80">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">history</span>
                  <h2 className="text-sm sm:text-base font-bold text-white">History</h2>
                  {history.length > 0 && (
                    <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full font-mono">{history.length}</span>
                  )}
                </div>
                {history.length > 0 && (
                  <button onClick={clearHistory}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-all">
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
                {history.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <span className="material-symbols-outlined text-3xl text-white/15">queue_music</span>
                    <p className="text-white/25 text-sm">No history yet — search a song!</p>
                  </div>
                )}
                {history.map((item, i) => (
                  <div key={i}
                    className="history-row flex items-center gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl hover:bg-white/6 active:bg-white/10 transition-colors cursor-pointer group">
                    <span className="text-[10px] text-white/20 font-mono w-4 shrink-0 hidden sm:block">{i + 1}</span>
                    <img onClick={() => play(item)}
                      src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0" onClick={() => play(item)}>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{item.snippet.title}</p>
                      <p className="text-[10px] text-white/35 truncate">{item.snippet.channelTitle}</p>
                    </div>
                    <button onClick={() => deleteHistory(i)}
                      className="delete-btn opacity-100 sm:opacity-0 p-2 text-white/25 hover:text-red-400 active:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Mini Player (mobile, appears when main player out of view) ── */}
      {showMiniPlayer && videoId && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-3 lg:hidden mini-player-enter">
          <div className="glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <img src={currentThumbnail || getRandomCover()}
              onClick={scrollToPlayer}
              className="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer" />
            <div className="flex-1 min-w-0 cursor-pointer" onClick={scrollToPlayer}>
              <p className="text-xs font-semibold text-white truncate">{currentTitle}</p>
              {/* Mini progress bar */}
              <div className="w-full h-0.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button onClick={togglePlay}
              className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all">
              <span className="material-symbols-outlined text-black text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-14 lg:hidden px-2 bg-black/95 backdrop-blur-2xl border-t border-white/8 z-50">
        <a onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center gap-0.5 text-green-400 px-5 py-2 cursor-pointer">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[9px] font-semibold">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-0.5 text-white/30 px-5 py-2 cursor-pointer"
          onClick={() => document.querySelector("input")?.focus()}>
          <span className="material-symbols-outlined text-xl">search</span>
          <span className="text-[9px] font-semibold">Search</span>
        </a>
        <a onClick={() => setShowHistory(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-white/30 px-5 py-2 cursor-pointer relative">
          <span className="material-symbols-outlined text-xl">history</span>
          <span className="text-[9px] font-semibold">History</span>
          {history.length > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-green-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
              {history.length > 9 ? "9+" : history.length}
            </span>
          )}
        </a>
      </nav>

      {/* ── Mobile History Drawer ── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex flex-col justify-end"
          onClick={() => setShowHistory(false)}>
          <div className="bg-gray-950 rounded-t-3xl p-4 sm:p-5 max-h-[78vh] flex flex-col border-t border-white/10"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold">History</h3>
                {history.length > 0 && (
                  <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">{history.length}</span>
                )}
              </div>
              <div className="flex gap-3 items-center">
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-red-400 text-xs font-semibold">Clear all</button>
                )}
                <button onClick={() => setShowHistory(false)}
                  className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-white/60">close</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto space-y-0.5 custom-scrollbar flex-1">
              {history.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <span className="material-symbols-outlined text-3xl text-white/15">queue_music</span>
                  <p className="text-white/25 text-sm">No history yet</p>
                </div>
              )}
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-xl active:bg-white/8 transition-colors">
                  <img onClick={() => { play(item); setShowHistory(false); }}
                    src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 cursor-pointer" />
                  <div className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { play(item); setShowHistory(false); }}>
                    <p className="text-sm font-semibold text-white truncate">{item.snippet.title}</p>
                    <p className="text-[10px] text-white/35 truncate">{item.snippet.channelTitle}</p>
                  </div>
                  <button onClick={() => deleteHistory(i)}
                    className="p-2.5 text-white/25 hover:text-red-400 active:text-red-400 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default YouTubePlayer;