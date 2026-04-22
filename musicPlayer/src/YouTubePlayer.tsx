import React, { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { useNavigate } from "react-router-dom";
import useYoutubeDownload from "./hooks/useYoutubeDownload";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const YouTubePlayer: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>("");

  // Controls mobile history drawer visibility
  const [showHistory, setShowHistory] = useState(false);

  const { loading: downloading, error: downloadError, downloadAudio } = useYoutubeDownload();
  const playerRef = useRef<any>(null);

  // Search YouTube videos using the API
  const search = async () => {
    if (!query.trim()) return;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${API_KEY}`
    );
    const data = await res.json();
    setResults(data.items || []);
    setShowDropdown(true);
  };

  // Plays the selected video and saves it to history
  const play = (i: number) => {
    const selected = results[i];
    setVideoId(selected?.id?.videoId);
    setCurrentTitle(selected?.snippet?.title ?? "");
    setHistory((prev) => [selected, ...prev]);
    setShowDropdown(false);
    setIsPlaying(true);
    setQuery("");
    setResults([]);
  };

  // Removes a single history item by index
  const deleteHistory = (i: number) => {
    setHistory((prev) => prev.filter((_, index) => index !== i));
  };

  const clearHistory = () => setHistory([]);

  // Toggles between play and pause state
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  // Seeks to the position based on slider value
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo((value / 100) * duration);
  };

  // Updates the player volume from the slider
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    playerRef.current?.setVolume(value);
  };

  // Toggles mute/unmute on the player
  const toggleMute = () => {
    if (!playerRef.current) return;
    isMuted ? playerRef.current.unMute() : playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  // Tracks playback progress every 500ms for the seek slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const duration = playerRef.current.getDuration();
        const current = playerRef.current.getCurrentTime();
        if (duration) setProgress((current / duration) * 100);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleHomeClick = () => navigate("/");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">

      {/* Left sidebar — hidden on mobile */}
      <div className="w-64 bg-black/60 p-5 hidden md:flex flex-col shrink-0">
        <h1 className="text-2xl text-green-500 font-bold mb-6">
          YouTube Player 🎧
        </h1>
        <button onClick={handleHomeClick} className="hover:text-green-400 text-left">
          🏠 Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">

        {/* Mobile top bar */}
        <div className="w-full flex justify-between items-center mb-4 md:hidden">
          <button onClick={handleHomeClick} className="text-green-400 text-sm">
            🏠 Home
          </button>
          <h1 className="text-base text-green-500 font-bold">YouTube Player 🎧</h1>
          {/* Toggle history drawer on mobile */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-green-400 text-sm"
          >
            🕓 History
          </button>
        </div>

        {/* Wrapper */}
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Search bar */}
          <div className="relative w-full">
            <div className="flex overflow-hidden rounded-lg shadow-lg">
              <input
                className="flex-1 px-3 py-2 bg-white text-black outline-none text-sm"
                placeholder="Search Music Here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
              <button onClick={search} className="bg-red-500 text-black px-4 text-sm font-bold">
                Search
              </button>
            </div>

            {/* Search results dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white text-black rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                {results.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => play(i)}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer truncate text-sm"
                  >
                    {item.snippet.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Player controls */}
          {videoId && (
            <div className="mt-5 w-full bg-white/10 p-4 rounded-xl">

              {/* Hidden YouTube iframe */}
              <YouTube
                videoId={videoId}
                opts={{ height: "0", width: "0", playerVars: { autoplay: 1 } }}
                onReady={(e) => {
                  playerRef.current = e.target;
                  e.target.playVideo();
                  e.target.setVolume(volume);
                }}
              />

              {/* Currently playing title */}
              <p className="text-xs text-gray-300 truncate mb-3 text-center">
                🎵 {currentTitle}
              </p>

              {/* Play/pause + seek slider */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 flex items-center justify-center text-lg hover:scale-110 transition shrink-0"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 accent-green-400 drop-shadow-[0_0_10px_#22c55e]"
                />
              </div>

              {/* Mute + volume slider */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 flex items-center justify-center text-lg hover:scale-110 transition shrink-0"
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolume}
                  className="flex-1 h-2 accent-blue-500 drop-shadow-[0_0_8px_#3b82f6]"
                />
              </div>

              {/* Download button */}
              <button
                onClick={() => videoId && downloadAudio(videoId, currentTitle)}
                disabled={downloading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 rounded-xl shadow-[0_0_15px_#22c55e] hover:shadow-[0_0_25px_#22c55e] hover:scale-105 active:scale-95 transition-all duration-200 text-sm"
              >
                {downloading ? "⏳ Downloading..." : "⬇️ Download MP3"}
              </button>

              {/* Download error message */}
              {downloadError && (
                <p className="text-red-400 text-xs mt-1 text-center">{downloadError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar — desktop only */}
      <div className="w-72 bg-black/60 p-4 overflow-y-auto hidden md:block shrink-0">
        <div className="flex justify-between mb-4">
          <h2 className="text-green-400 font-bold">History</h2>
          <button onClick={clearHistory} className="text-red-400 text-sm">Clear</button>
        </div>

        {history.length === 0 && (
          <p className="text-gray-400 text-sm">No history yet</p>
        )}

        {history.map((item, i) => (
          <div key={i} className="bg-white/10 p-2 mb-2 rounded flex justify-between items-center">
            <p
              onClick={() => { setVideoId(item.id.videoId); setCurrentTitle(item.snippet.title); }}
              className="cursor-pointer text-sm truncate w-40"
            >
              {item.snippet.title}
            </p>
            <div className="flex gap-1">
              <button onClick={() => downloadAudio(item.id.videoId, item.snippet.title)} className="text-green-400 text-sm">⬇️</button>
              <button onClick={() => deleteHistory(i)} className="text-red-400">❌</button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile history drawer — slides up from bottom */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 md:hidden flex flex-col justify-end">
          <div className="bg-gray-900 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">

            <div className="flex justify-between mb-4">
              <h2 className="text-green-400 font-bold">History</h2>
              <div className="flex gap-3">
                <button onClick={clearHistory} className="text-red-400 text-sm">Clear</button>
                {/* Closes the mobile history drawer */}
                <button onClick={() => setShowHistory(false)} className="text-gray-400 text-sm">✕ Close</button>
              </div>
            </div>

            {history.length === 0 && (
              <p className="text-gray-400 text-sm">No history yet</p>
            )}

            {history.map((item, i) => (
              <div key={i} className="bg-white/10 p-2 mb-2 rounded flex justify-between items-center">
                <p
                  onClick={() => { setVideoId(item.id.videoId); setCurrentTitle(item.snippet.title); setShowHistory(false); }}
                  className="cursor-pointer text-sm truncate w-48"
                >
                  {item.snippet.title}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => downloadAudio(item.id.videoId, item.snippet.title)} className="text-green-400 text-sm">⬇️</button>
                  <button onClick={() => deleteHistory(i)} className="text-red-400">❌</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default YouTubePlayer;