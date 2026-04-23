import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#000000] bg-gradient-to-b from-[#000000] via-[#111827] to-[#000000] min-h-screen text-white overflow-x-hidden"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
      `}</style>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-bold tracking-tight text-white">Aura Music</div>

        <div className="hidden md:flex gap-8 items-center">
          <nav className="flex gap-6">
            <a className="text-white border-b-2 border-white font-medium py-1 transition-all duration-300" href="#">Home</a>
            <a className="text-white/60 hover:bg-white/10 font-medium py-1 rounded transition-all duration-300 px-2" href="#">Explore</a>
            <a className="text-white/60 hover:bg-white/10 font-medium py-1 rounded transition-all duration-300 px-2" href="#">Library</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-white cursor-pointer hover:bg-white/10 p-2 rounded-full transition-all">search</span>
            <span className="material-symbols-outlined text-white cursor-pointer hover:bg-white/10 p-2 rounded-full transition-all">account_circle</span>
            <span className="material-symbols-outlined text-white cursor-pointer hover:bg-white/10 p-2 rounded-full transition-all">settings</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-8 py-20">

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-4">🎵 Aura Music</h1>
          <p className="text-sm font-medium text-gray-400 max-w-md mx-auto">
            Elevate your auditory experience with seamless local playback and global streaming.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-4xl">

          {/* Local Player Card */}
          <div
            onClick={() => navigate("/local")}
            className="glass-card group w-full md:w-64 p-8 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 flex flex-col items-center text-center"
          >
            <div className="mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
              <span className="material-symbols-outlined text-4xl text-white">headphones</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Local Player</h3>
            <p className="text-sm text-gray-400">Play your downloaded songs</p>
            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Navigates to local player on click */}
              <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-widest">
                Upload songs
              </button>
            </div>
          </div>

          {/* YouTube Player Card */}
          <div
            onClick={() => navigate("/youtube")}
            className="glass-card group w-full md:w-64 p-8 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 flex flex-col items-center text-center"
          >
            <div className="mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
              <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">YouTube Player</h3>
            <p className="text-sm text-gray-400">Search &amp; stream music from YouTube </p>
            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Navigates to YouTube player on click */}
              <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-widest">
                Start Streaming
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 bg-zinc-950/80 backdrop-blur-[30px] border-t border-white/10 shadow-[0_-4px_20px_rgba(255,255,255,0.05)] h-20">

        {/* Home tab — active */}
        <div className="flex flex-col items-center justify-center text-white font-bold py-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[12px] uppercase tracking-widest mt-1">Home</span>
        </div>

        {/* Search tab */}
        <div className="flex flex-col items-center justify-center text-white/40 py-2 hover:text-white/80 transition-colors">
          <span className="material-symbols-outlined">search</span>
          <span className="text-[12px] uppercase tracking-widest mt-1">Search</span>
        </div>

        {/* Library tab — navigates to local player */}
        <div
          onClick={() => navigate("/local")}
          className="flex flex-col items-center justify-center text-white/40 py-2 hover:text-white/80 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">library_music</span>
          <span className="text-[12px] uppercase tracking-widest mt-1">Library</span>
        </div>

        {/* YouTube tab — navigates to YouTube player */}
        <div
          onClick={() => navigate("/youtube")}
          className="flex flex-col items-center justify-center text-white/40 py-2 hover:text-white/80 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">play_circle</span>
          <span className="text-[12px] uppercase tracking-widest mt-1">YouTube</span>
        </div>

      </nav>

    </div>
  );
};

export default Home;