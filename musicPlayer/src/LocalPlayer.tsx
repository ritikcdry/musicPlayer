import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Song = {
  name: string;
  url: string;
  cover: string;
};

const getRandomCover = () =>
  `https://picsum.photos/200?random=${Math.random()}`;

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  //  Upload songs
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const newSongs: Song[] = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      cover: getRandomCover(),
    }));

    setSongs((prev) => [...prev, ...newSongs]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  //  SAFE PLAY (prevents duplicate audio)
  const safePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause(); // stop previous instance

    setTimeout(() => {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }, 30);
  };

  //  Play song
  const playSong = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !songs.length) return;

    setCurrentIndex(index);

    setTimeout(() => {
      audio.src = songs[index].url;
      audio.currentTime = 0;
      safePlay();
    }, 50);
  };

  //  Play / Pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      safePlay();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  //  Next
  const nextSong = () => {
    if (!songs.length) return;

    if (isShuffle) {
      playSong(Math.floor(Math.random() * songs.length));
    } else {
      playSong((currentIndex + 1) % songs.length);
    }
  };

  //  Prev
  const prevSong = () => {
    if (!songs.length) return;
    playSong((currentIndex - 1 + songs.length) % songs.length);
  };

  //  Delete
  const deleteSong = (index: number) => {
    const updated = songs.filter((_, i) => i !== index);
    setSongs(updated);

    if (!updated.length) {
      setCurrentIndex(0);
      setIsPlaying(false);
      return;
    }

    if (index === currentIndex) {
      setCurrentIndex(0);
      setIsPlaying(false);
    } else if (index < currentIndex) {
      setCurrentIndex((p) => p - 1);
    }
  };

  //  Progress update 
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      if (!audio.duration) return;
      if (!isSeeking) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", update);

    return () => {
      audio.removeEventListener("timeupdate", update);
    };
  }, [isSeeking]);

  //  Seek 
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const value = Number(e.target.value);

    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

  //  Volume
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);

    setVolume(v);
    setPrevVolume(v);
    setIsMuted(v === 0);

    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  //  Mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = prevVolume;
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      audioRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  //  End song
  const handleEnd = () => {
    if (isRepeat) {
      safePlay();
    } else {
      nextSong();
    }
  };

  // Home navigation
  const handleHomeClick: React.MouseEventHandler<HTMLButtonElement> = () => {
  navigate("/");
};


  return (
    <div className="h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-black/60 p-5 flex flex-col">
        <h1 className="text-2xl text-green-500 font-bold mb-6">
          Music Player 🎧
        </h1>

        <button 
        onClick ={handleHomeClick}    
        className="mb-3 hover:text-green-400"
        >
          🏠 Home
        </button>
        <button className="mb-3 hover:text-green-400">🔍 Search</button>
        <button className="mb-6 hover:text-green-400">📚 Library</button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Upload */}
        <label className="cursor-pointer mb-6">
          <input
            type="file"
            accept="audio/mp3"
            multiple
            onChange={handleUpload}
            ref={fileInputRef}
            className="hidden"
          />

          <div className="px-6 py-3 bg-green-500 text-black font-semibold rounded-full hover:scale-105 transition">
            Upload Music
          </div>
        </label>

        {songs.length ? (
          <div className="bg-white/5 p-8 rounded-3xl w-[350px] text-center">

            {/* Cover */}
            <img
              src={songs[currentIndex].cover}
              className="w-64 h-64 mx-auto rounded-xl mb-4"
            />

            {/* Title */}
            <h2 className="truncate font-semibold">
              {songs[currentIndex].name}
            </h2>

            {/* Progress (NEON GREEN) */}
            <input
              type="range"
              value={progress}
              onChange={handleSeek}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={() => setIsSeeking(false)}
              className="w-full mt-4 accent-green-400 drop-shadow-[0_0_10px_#22c55e] hover:scale-[1.02] transition"
            />

            {/* Controls */}
            <div className="flex justify-center gap-5 mt-4">
              <button onClick={() => setIsShuffle(!isShuffle)}>🔀</button>
              <button onClick={prevSong}>⏮</button>

              <button
                onClick={togglePlayPause}
                className="bg-white text-black px-5 py-2 rounded-full"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button onClick={nextSong}>⏭</button>
              <button onClick={() => setIsRepeat(!isRepeat)}>🔁</button>
            </div>

            {/* Volume (BLUE) */}
            <div className="flex items-center gap-2 mt-4">
              <button onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={changeVolume}
                className="w-full accent-blue-500 drop-shadow-[0_0_8px_#3b82f6] hover:scale-[1.02] transition"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Upload songs to start 🎧</p>
        )}

        {/* Audio */}
        <audio
          ref={audioRef}
          src={songs[currentIndex]?.url}
          onEnded={handleEnd}
        />
      </div>

      {/* Playlist */}
      <div className="w-80 bg-black/40 p-4 overflow-y-auto hidden lg:block">
        <h2 className="mb-4 text-green-500 font-bold">Playlist 🎧</h2>

        {songs.map((song, index) => (
          <div
            key={index}
            onClick={() => playSong(index)}
            className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${
              index === currentIndex
                ? "bg-green-600/30"
                : "hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <img src={song.cover} className="w-10 h-10 rounded" />
              <p className="truncate w-32 text-sm">{song.name}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSong(index);
              }}
              className="text-red-400"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalPlayer;
