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
  const { loading: downloading, error: downloadError, downloadAudio } = useYoutubeDownload();

  const playerRef = useRef<any>(null);

  //  Search
  const search = async () => {
    if (!query.trim()) return;

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${API_KEY}`
    );

    const data = await res.json();
    setResults(data.items || []);
    setShowDropdown(true);
  };

  //  Play
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

  //  History
  const deleteHistory = (i: number) => {
    setHistory((prev) => prev.filter((_, index) => index !== i));
  };

  const clearHistory = () => setHistory([]);

  //  Play / Pause
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();

    setIsPlaying(!isPlaying);
  };

  //  Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);

    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo((value / 100) * duration);
  };

  //  Volume
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

  //  Progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const duration = playerRef.current.getDuration();
        const current = playerRef.current.getCurrentTime();

        if (duration) {
          setProgress((current / duration) * 100);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleHomeClick = () => navigate("/");
  // Download Song
 
  return (
    <div className="h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Left slide */}
      <div className="w-64 bg-black/60 p-5 hidden md:flex flex-col">
        <h1 className="text-2xl text-green-500 font-bold mb-6">
          YouTube Player 🎧
        </h1>

        <button onClick={handleHomeClick} className="hover:text-green-400">
          🏠 Home
        </button>
      </div>

      {/* Main Content */}
<div className="flex-1 flex flex-col items-center justify-center">

  {/* Wrapper */}
  <div className="w-full max-w-md flex flex-col items-center">

    {/* Search */}
    <div className="relative w-full">

      <div className="flex overflow-hidden rounded-lg shadow-lg">
        <input
          className="flex-1 px-4 py-2 bg-white text-black outline-none"
          placeholder="Search Music Here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />

        <button
          onClick={search}
          className="bg-red-500 text-black px-5"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white text-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((item, i) => (
            <div
              key={i}
              onClick={() => play(i)}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer truncate"
            >
              {item.snippet.title}
            </div>
          ))}
        </div>
      )}
    </div>

    {/*  Player */}
    {videoId && (
      <div className="mt-6 w-full bg-white/10 p-4 rounded-xl">

        {/* Hidden Player */}
        <YouTube
          videoId={videoId}
          opts={{
            height: "0",
            width: "0",
            playerVars: { autoplay: 1 },
          }}
          onReady={(e) => {
            playerRef.current = e.target;
            e.target.playVideo();
            e.target.setVolume(volume);
          }}
        />

        {/* Play + slider */}
        <div className="flex items-center gap-4">

          <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center text-xl hover:scale-110 transition"
          >
          {isPlaying ? "⏸" : "▶"}
        </button>


          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 self-center accent-green-400 drop-shadow-[0_0_10px_#22c55e] hover:scale-[1.02] transition"
          />
        </div>

        {/* Volume */}
        <div className="flex items-center gap-4 mt-3">
          <button
          onClick={toggleMute}
          className="w-10 h-10 flex items-center justify-center text-xl hover:scale-110 transition"
          >
          {isMuted ? "🔇" : "🔊"}
          </button>

          <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolume}
          className="flex-1 h-2 self-center accent-blue-500 drop-shadow-[0_0_8px_#3b82f6] hover:scale-[1.02] transition"
          />
        </div>

        {/* Download button */}
        <div className="w-full flex flex-col items-center mt-4 gap-1">
          <button
          onClick={() => videoId && downloadAudio(videoId, currentTitle)}
          disabled={downloading}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-xl shadow-[0_0_15px_#22c55e] hover:shadow-[0_0_25px_#22c55e] hover:scale-105 active:scale-95 transition-all duration-200"
          >
          {downloading ? "⏳ Downloading..." : " Download "}
          </button>

          {/* Shows error message if download fails */}
          {downloadError && (
            <p className="text-red-400 text-xs mt-1">{downloadError}</p>
          )}
      </div>

      </div>
    )}

  </div>
</div>


      {/* Right side History */}
      <div className="w-72 bg-black/60 p-4 overflow-y-auto hidden md:block">
        <div className="flex justify-between mb-4">
          <h2 className="text-green-400 font-bold">History</h2>
          <button onClick={clearHistory} className="text-red-400 text-sm">
            Clear
          </button>
        </div>

        {history.length === 0 && (
          <p className="text-gray-400 text-sm">No history yet</p>
        )}

        {history.map((item, i) => (
          <div
            key={i}
            className="bg-white/10 p-2 mb-2 rounded flex justify-between"
          >
            <p
              onClick={() => setVideoId(item.id.videoId)}
              className="cursor-pointer text-sm truncate w-40"
            >
              {item.snippet.title}
            </p>

            <button
              onClick={() => deleteHistory(i)}
              className="text-red-400"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default YouTubePlayer;
