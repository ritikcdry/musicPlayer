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

  const { loading: downloading, error: downloadError, downloadAudio } = useYoutubeDownload();
  const playerRef = useRef<any>(null);

  const search = async () => {
    if (!query.trim()) return;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${API_KEY}`
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

  const deleteHistory = (i: number) => {
    setHistory((prev) => prev.filter((_, index) => index !== i));
  };

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
      style={{ fontFamily: "'Spline Sans', sans-serif", backgroundColor: "#000000" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-green { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
        .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        .glow-red { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 10px; }
      `}</style>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex-col p-4 bg-gray-950 w-64 border-r border-white/5 hidden md:flex z-40">
        <div className="mb-10 px-4">
          <span className="text-lg font-black text-green-500">YouTube Player 🎧</span>
          <p className="text-xs text-white/40 mt-1">YouTube Collection</p>
        </div>
        <nav className="flex-1 space-y-2">
          <a
            onClick={() => navigate("/")}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-green-500 font-bold border-r-2 border-green-500 bg-green-500/5 transition-colors duration-300 cursor-pointer"
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors duration-300 cursor-pointer">
            <span className="material-symbols-outlined">explore</span>
            <span>Explore</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors duration-300 cursor-pointer">
            <span className="material-symbols-outlined">library_music</span>
            <span>Library</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col bg-gradient-to-b from-black to-gray-900 overflow-y-auto">

        {/* Search Bar */}
        <header className="flex justify-between items-center px-6 py-3 w-full bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-lg">
          <div className="flex-1 max-w-2xl flex items-center gap-4">
            <div className="relative w-full flex items-center">
              <input
                className="w-full bg-white text-black px-6 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                placeholder="Search for tracks, artists, or albums..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
              <button
                onClick={search}
                className="absolute right-1.5 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all active:scale-95 shadow-md glow-red"
              >
                <span className="material-symbols-outlined text-sm">search</span>
              </button>

              {showDropdown && results.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-gray-900 border border-white/10 text-white rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {results.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => play(item)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer"
                    >
                      <img
                        src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <p className="text-sm truncate">{item.snippet.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 space-y-10 pb-32 flex flex-col items-center">

          {/* Player Card */}
          <section className="w-full max-w-5xl">
            <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-10 shadow-2xl overflow-hidden">

              {/* Album Art */}
              <div className="relative shrink-0">
                {currentThumbnail ? (
                  <img
                    src={currentThumbnail}
                    className="w-52 h-52 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-2xl object-cover shadow-2xl"
                  />
                ) : (
                  <div className="w-52 h-52 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-6xl text-gray-600">music_note</span>
                    <p className="text-gray-500 text-sm text-center px-4">Search a song to start</p>
                  </div>
                )}
              </div>

              {/* Controls — min-w-0 prevents overflow */}
              <div className="flex-1 min-w-0 w-full space-y-4">

                {/* Title */}
                <div>
                  <span className="text-green-400 font-bold tracking-widest text-xs uppercase mb-1 block">Now Playing</span>
                  <h1 className="text-xl md:text-2xl font-black text-white mb-1 truncate w-full">
                    {currentTitle || "No song selected"}
                  </h1>
                  <p className="text-white/60 text-sm">
                    {videoId ? "YouTube Stream" : "Search above to play music"}
                  </p>
                </div>

                {/* Hidden YouTube iframe */}
                {videoId && (
                  <YouTube
                    videoId={videoId}
                    opts={{ height: "0", width: "0", playerVars: { autoplay: 1 } }}
                    onReady={(e) => {
                      playerRef.current = e.target;
                      e.target.playVideo();
                      e.target.setVolume(volume);
                    }}
                  />
                )}

                {/* Progress Slider */}
                <div className="space-y-1 w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    disabled={!videoId}
                    className="w-full h-1.5 accent-green-400 drop-shadow-[0_0_10px_#22c55e] cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Prev / Play / Next */}
                <div className="flex items-center gap-4 justify-center">
                  <button
                    disabled={!videoId}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-2xl">skip_previous</span>
                  </button>

                  <button
                    onClick={togglePlay}
                    disabled={!videoId}
                    className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg glow-green active:scale-95 transition-all disabled:opacity-40"
                  >
                    <span
                      className="material-symbols-outlined text-black text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>

                  <button
                    disabled={!videoId}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-2xl">skip_next</span>
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={toggleMute}
                    disabled={!videoId}
                    className="shrink-0 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-white/60 text-sm">
                      {isMuted ? "volume_off" : "volume_up"}
                    </span>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolume}
                    disabled={!videoId}
                    className="flex-1 h-1 accent-blue-400 drop-shadow-[0_0_8px_#3b82f6] cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Download Button — full width */}
                <button
                  onClick={() => videoId && downloadAudio(videoId, currentTitle)}
                  disabled={downloading || !videoId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold rounded-xl active:scale-95 transition-all shadow-lg glow-green disabled:opacity-40 text-sm"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>{downloading ? "Downloading..." : "Download MP3"}</span>
                </button>

                {downloadError && (
                  <p className="text-red-400 text-xs">{downloadError}</p>
                )}
              </div>
            </div>
          </section>

          {/* History Panel */}
          <section className="w-full max-w-5xl">
            <div className="bg-black/60 rounded-3xl p-6 border border-white/5 flex flex-col max-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-green-500">History</h2>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  Clear All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {history.length === 0 && (
                  <p className="text-gray-500 text-sm">No history yet</p>
                )}
                {history.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <img
                      onClick={() => play(item)}
                      src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0" onClick={() => play(item)}>
                      <p className="text-sm font-bold text-white truncate">{item.snippet.title}</p>
                      <p className="text-[10px] text-white/40 truncate">{item.snippet.channelTitle}</p>
                    </div>
                    {/* Delete only — no download */}
                    <button
                      onClick={() => deleteHistory(i)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 md:hidden px-4 bg-black/80 backdrop-blur-2xl rounded-t-2xl border-t border-white/10 shadow-[0_-4px_20px_rgba(34,197,94,0.15)] z-50">
        <a
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] cursor-pointer"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-white/40 cursor-pointer">
          <span className="material-symbols-outlined">search</span>
          <span className="text-[10px] font-medium">Search</span>
        </a>
        <a
          onClick={() => setShowHistory(true)}
          className="flex flex-col items-center justify-center text-white/40 cursor-pointer"
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-medium">History</span>
        </a>
      </nav>

      {/* Mobile History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 md:hidden flex flex-col justify-end">
          <div className="bg-gray-900 rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-bold">History</h3>
              <div className="flex gap-3">
                <button onClick={clearHistory} className="text-red-400 text-sm">Clear</button>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 text-sm">✕ Close</button>
              </div>
            </div>
            {history.length === 0 && <p className="text-gray-500 text-sm">No history yet</p>}
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 mb-1">
                <img
                  onClick={() => { play(item); setShowHistory(false); }}
                  src={item.snippet?.thumbnails?.default?.url || getRandomCover()}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => { play(item); setShowHistory(false); }}
                >
                  <p className="text-sm font-bold text-white truncate">{item.snippet.title}</p>
                </div>
                {/* Delete only */}
                <button onClick={() => deleteHistory(i)} className="text-red-400 p-1.5">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default YouTubePlayer;