import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Song = {
  name: string;
  url: string;
  cover: string;
};

const getRandomCover = () =>
  `https://picsum.photos/200?random=${Math.random()}`;

// Formats seconds into mm:ss display format
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

  // Tracks current time and total duration for the timer display
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Stores the currently playing song independently from the playlist
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Controls mobile playlist drawer visibility
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Handles uploading multiple audio files and assigning random covers
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newSongs: Song[] = files.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""), // strips file extension from name
      url: URL.createObjectURL(file),
      cover: getRandomCover(),
    }));
    setSongs((prev) => [...prev, ...newSongs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Stops any current playback before starting new audio to prevent overlap
  const safePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setTimeout(() => {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }, 30);
  };

  // Sets the audio source to the selected song and starts playback
  const playSong = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !songs.length) return;
    setCurrentIndex(index);
    setCurrentSong(songs[index]);
    setTimeout(() => {
      audio.src = songs[index].url;
      audio.currentTime = 0;
      safePlay();
    }, 50);
  };

  // Toggles between play and pause states
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) safePlay();
    else { audio.pause(); setIsPlaying(false); }
  };

  // Plays next song or a random one if shuffle is enabled
  const nextSong = () => {
    if (!songs.length) return;
    if (isShuffle) playSong(Math.floor(Math.random() * songs.length));
    else playSong((currentIndex + 1) % songs.length);
  };

  // Plays the previous song in the playlist
  const prevSong = () => {
    if (!songs.length) return;
    playSong((currentIndex - 1 + songs.length) % songs.length);
  };

  // Removes song from playlist only — does not affect currently playing audio
  const deleteSong = (index: number) => {
    const updated = songs.filter((_, i) => i !== index);
    setSongs(updated);

    if (!updated.length) {
      setCurrentIndex(0);
      return;
    }

    if (index < currentIndex) {
      setCurrentIndex((p) => p - 1);
    } else if (index === currentIndex) {
      setCurrentIndex(0);
    }
  };

  // Updates progress slider and timer display as audio plays
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
    audio.addEventListener("loadedmetadata", update); // captures duration on load
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [isSeeking]);

  // Seeks the audio to the position matching the slider value
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const value = Number(e.target.value);
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
    setCurrentTime(audio.currentTime);
  };

  // Updates the audio volume from the slider input
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v); setPrevVolume(v); setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  // Toggles mute and restores previous volume when unmuting
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

  // Repeats current song or moves to next when song ends
  const handleEnd = () => {
    if (isRepeat) safePlay();
    else nextSong();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-black to-[#091009] text-white"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-green { box-shadow: 0 0 15px rgba(75, 226, 119, 0.4); }
        .glow-blue { box-shadow: 0 0 15px rgba(173, 198, 255, 0.4); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* Left Sidebar — hidden on mobile */}
      <aside className="fixed left-0 top-0 h-full flex-col p-6 w-[280px] bg-black/40 backdrop-blur-xl border-r border-white/10 hidden md:flex z-40">
        <div className="mb-12">
          <h1 className="text-xl font-bold text-white tracking-tight">Music Player 🎧</h1>
          <p className="text-sm text-gray-400">Local Collection</p>
        </div>
        <nav className="flex-1 space-y-4">
          {/* Navigates back to the home page */}
          <a onClick={() => navigate("/")} className="flex items-center gap-4 py-2 text-green-500 font-bold cursor-pointer text-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Home
          </a>
          <a className="flex items-center gap-4 py-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 p-2 rounded-lg cursor-pointer text-sm">
            <span className="material-symbols-outlined">search</span>
            Search
          </a>
          <a className="flex items-center gap-4 py-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 p-2 rounded-lg cursor-pointer text-sm">
            <span className="material-symbols-outlined">library_music</span>
            Library
          </a>
        </nav>
      </aside>

      {/* Main Player Area */}
      <main className="flex-1 md:ml-[280px] md:mr-[320px] relative flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-transparent to-black/20">

        {/* Upload button */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center">
          <div />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/mp3"
              multiple
              onChange={handleUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-2 rounded-full font-bold text-sm hover:bg-green-500/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              Upload Music
            </div>
          </label>
        </div>

        {/* Player card — always visible */}
        <div className="max-w-sm w-full glass-panel rounded-[2rem] p-6 md:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden group">

          <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />

          {/* Album art — placeholder until a song is played */}
          <div className="relative w-52 h-52 md:w-64 md:h-64 mb-6">
          {currentSong ? (
            <img
            src={currentSong.cover}
            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 transform transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
          <div className="w-full h-full rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-5xl text-gray-500">library_music</span>
            <p className="text-gray-400 text-sm text-center px-4">Upload songs to start 🎧</p>
          </div>
          )}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
          </div>

          {/* Song title — persists from currentSong even after playlist deletion */}
          <div className="text-center mb-6 w-full">
            <h2 className="text-lg font-bold text-white mb-1 truncate px-2">
            {currentSong ? currentSong.name : "No song selected"}
            </h2>
            <p className="text-green-400 text-sm font-medium tracking-wide">
            {currentSong ? "Local Track" : "—"}
            </p>
          </div>

  {/* Progress slider with timer */}
  <div className="w-full space-y-2 mb-6">
    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
    <input
      type="range"
      value={progress}
      onChange={handleSeek}
      onMouseDown={() => setIsSeeking(true)}
      onMouseUp={() => setIsSeeking(false)}
      onTouchStart={() => setIsSeeking(true)}
      onTouchEnd={() => setIsSeeking(false)}
      disabled={!currentSong}
      className="w-full h-1.5 accent-green-400 drop-shadow-[0_0_10px_#22c55e] cursor-pointer disabled:opacity-40"
    />
  </div>

  {/* Playback controls */}
  <div className="flex items-center justify-between w-full mb-6">
    <button
      onClick={() => setIsShuffle(!isShuffle)}
      disabled={!currentSong}
      className={`transition-colors disabled:opacity-40 ${isShuffle ? "text-green-400" : "text-gray-400 hover:text-white"}`}
    >
      <span className="material-symbols-outlined text-2xl">shuffle</span>
    </button>
    <button onClick={prevSong} disabled={!currentSong} className="text-white hover:scale-110 transition-transform disabled:opacity-40">
      <span className="material-symbols-outlined text-3xl">skip_previous</span>
    </button>
    <button
      onClick={togglePlayPause}
      disabled={!currentSong}
      className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all glow-green disabled:opacity-40"
    >
      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {isPlaying ? "pause" : "play_arrow"}
      </span>
    </button>
    <button onClick={nextSong} disabled={!currentSong} className="text-white hover:scale-110 transition-transform disabled:opacity-40">
      <span className="material-symbols-outlined text-3xl">skip_next</span>
    </button>
    <button
      onClick={() => setIsRepeat(!isRepeat)}
      disabled={!currentSong}
      className={`transition-colors disabled:opacity-40 ${isRepeat ? "text-green-400" : "text-gray-400 hover:text-white"}`}
    >
      <span className="material-symbols-outlined text-2xl">repeat</span>
    </button>
  </div>

  {/* Volume control */}
  <div className="w-full flex items-center gap-3 px-2">
    <button onClick={toggleMute} disabled={!currentSong} className="disabled:opacity-40">
      <span className="material-symbols-outlined text-gray-400 text-sm">
        {isMuted ? "volume_off" : "volume_down"}
      </span>
    </button>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      onChange={changeVolume}
      disabled={!currentSong}
      className="flex-1 h-1 accent-blue-400 drop-shadow-[0_0_8px_#3b82f6] cursor-pointer disabled:opacity-40"
    />
    <span className="material-symbols-outlined text-gray-400 text-sm">volume_up</span>
  </div>
</div>

        {/* Audio uses currentSong.url — independent from playlist */}
        <audio ref={audioRef} src={currentSong?.url} onEnded={handleEnd} />
      </main>

      {/* Right Playlist Panel — desktop only */}
      <aside className="fixed right-0 top-0 h-full w-[320px] bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 flex-col z-40 hidden md:flex">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-green-400">Playlist 🎧</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2">
          {songs.length === 0 && (
            <p className="text-gray-500 text-sm">No songs yet</p>
          )}
          {songs.map((song, index) => (
            <div
              key={index}
              onClick={() => playSong(index)}
              className={`flex items-center gap-3 p-3 rounded-2xl group cursor-pointer transition-all ${
                index === currentIndex
                  ? "bg-green-500/10 border border-green-500/20"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                <img src={song.cover} className="w-full h-full object-cover" />
                {/* Shows equalizer icon on the active/playing track */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>equalizer</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${index === currentIndex ? "text-green-400" : "text-white"}`}>
                  {song.name}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tight">Local Track</p>
              </div>
              {/* Delete button — stops propagation so it doesn't trigger playSong */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteSong(index); }}
                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 md:hidden bg-black/60 backdrop-blur-2xl border-t border-white/10">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center text-green-500 text-[10px] font-bold"
        >
          <span className="material-symbols-outlined">home</span>
          Home
        </button>
        <button className="flex flex-col items-center justify-center text-gray-500 text-[10px] font-bold hover:text-white">
          <span className="material-symbols-outlined">search</span>
          Search
        </button>
        {/* Opens mobile playlist drawer */}
        <button
          onClick={() => setShowPlaylist(true)}
          className="flex flex-col items-center justify-center text-gray-500 text-[10px] font-bold hover:text-white"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>library_music</span>
          Playlist
        </button>
        <button className="flex flex-col items-center justify-center text-gray-500 text-[10px] font-bold hover:text-white">
          <span className="material-symbols-outlined">library_music</span>
          Library
        </button>
      </nav>

      {/* Mobile playlist drawer — slides up from bottom */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 md:hidden flex flex-col justify-end">
          <div className="bg-gray-900 rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-bold">Playlist 🎧</h3>
              {/* Closes the mobile playlist drawer */}
              <button onClick={() => setShowPlaylist(false)} className="text-gray-400 text-sm">✕ Close</button>
            </div>
            {songs.length === 0 && <p className="text-gray-500 text-sm">No songs yet</p>}
            {songs.map((song, index) => (
              <div
                key={index}
                onClick={() => { playSong(index); setShowPlaylist(false); }}
                className={`flex items-center gap-3 p-3 rounded-2xl group cursor-pointer transition-all mb-1 ${
                  index === currentIndex ? "bg-green-500/10 border border-green-500/20" : "hover:bg-white/5"
                }`}
              >
                <img src={song.cover} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${index === currentIndex ? "text-green-400" : "text-white"}`}>
                    {song.name}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSong(index); }}
                  className="text-red-400 p-2"
                >
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

export default LocalPlayer;