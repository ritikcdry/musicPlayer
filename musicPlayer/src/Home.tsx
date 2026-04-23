import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="bg-[#080808] min-h-screen text-white overflow-x-hidden"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24; }

        /* Fade + slide up on mount */
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.show {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.35s; }
        .delay-4 { transition-delay: 0.5s; }

        /* Card hover */
        .player-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s;
        }
        .player-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .player-card:active { transform: translateY(0) scale(0.98); }

        /* Icon ring */
        .icon-ring {
          transition: background 0.25s, box-shadow 0.25s;
        }
        .player-card:hover .icon-ring {
          box-shadow: 0 0 0 6px rgba(255,255,255,0.04);
        }

        /* Arrow */
        .arrow-icon {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .player-card:hover .arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }

        /* Subtle noise texture overlay */
        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* Glow orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }

        /* Nav link */
        .nav-link {
          position: relative;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }
        .nav-link.active { color: #fff; }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 1.5px;
          background: white;
          border-radius: 99px;
        }

        /* Mobile nav active dot */
        .mob-active { color: white; }
        .mob-active .mob-dot {
          width: 4px; height: 4px;
          background: white;
          border-radius: 50%;
          margin: 2px auto 0;
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-white/[0.03] top-[-100px] left-[-100px]" />
      <div className="orb w-80 h-80 bg-white/[0.02] bottom-[-80px] right-[-80px]" />

      {/* ── Navigation ── */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-5 sm:px-8 h-14">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>music_note</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Aura Music</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a className="nav-link active cursor-pointer">Home</a>
            <a className="nav-link cursor-pointer">Explore</a>
            <a className="nav-link cursor-pointer">Library</a>
          </nav>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-1">
            {["search", "account_circle", "settings"].map((icon) => (
              <button key={icon}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
                <span className="material-symbols-outlined text-base">{icon}</span>
              </button>
            ))}
          </div>

          {/* Mobile — search icon only */}
          <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white">
            <span className="material-symbols-outlined text-base">search</span>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-20 pb-28 md:pb-16">

        {/* Badge */}
        <div className={`fade-up delay-1 ${mounted ? "show" : ""} mb-6`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/6 border border-white/10 text-white/50 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Now streaming
          </span>
        </div>

        {/* Headline */}
        <div className={`fade-up delay-2 ${mounted ? "show" : ""} text-center mb-4`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Your music,<br />
            <span className="text-white/40">your way.</span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className={`fade-up delay-3 ${mounted ? "show" : ""} text-center mb-12`}>
          <p className="text-sm sm:text-base text-white/35 max-w-sm mx-auto leading-relaxed">
            Play local files or stream from YouTube — seamlessly, beautifully.
          </p>
        </div>

        {/* ── Cards ── */}
        <div className={`fade-up delay-4 ${mounted ? "show" : ""} w-full max-w-2xl`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Local Player */}
            <div
              onClick={() => navigate("/local")}
              className="player-card rounded-2xl p-6 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="icon-ring w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-white/70"
                    style={{ fontVariationSettings: "'FILL' 1" }}>headphones</span>
                </div>
                <span className="arrow-icon material-symbols-outlined text-white/40 text-base mt-1">arrow_outward</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Local Player</h3>
                <p className="text-xs text-white/35 leading-relaxed">Play your downloaded songs from device storage.</p>
              </div>
              <div className="mt-5 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Upload & play</span>
                <span className="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
              </div>
            </div>

            {/* YouTube Player */}
            <div
              onClick={() => navigate("/youtube")}
              className="player-card rounded-2xl p-6 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="icon-ring w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-white/70"
                    style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                </div>
                <span className="arrow-icon material-symbols-outlined text-white/40 text-base mt-1">arrow_outward</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">YouTube Player</h3>
                <p className="text-xs text-white/35 leading-relaxed">Search and stream any song directly from YouTube.</p>
              </div>
              <div className="mt-5 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Start streaming</span>
                <span className="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
              </div>
            </div>

          </div>

          {/* Bottom hint */}
          <p className="text-center text-white/20 text-xs mt-6 tracking-wide">
            Tap a card to get started
          </p>
        </div>

      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-black/90 backdrop-blur-2xl border-t border-white/[0.06]">

        <div className="mob-active flex flex-col items-center justify-center py-2 px-4">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <div className="mob-dot" />
        </div>

        <div className="flex flex-col items-center justify-center py-2 px-4 text-white/30">
          <span className="material-symbols-outlined text-xl">search</span>
          <div className="w-1 h-1 mt-1 opacity-0" />
        </div>

        <div
          onClick={() => navigate("/local")}
          className="flex flex-col items-center justify-center py-2 px-4 text-white/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">headphones</span>
          <div className="w-1 h-1 mt-1 opacity-0" />
        </div>

        <div
          onClick={() => navigate("/youtube")}
          className="flex flex-col items-center justify-center py-2 px-4 text-white/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">play_circle</span>
          <div className="w-1 h-1 mt-1 opacity-0" />
        </div>

      </nav>

    </div>
  );
};

export default Home;