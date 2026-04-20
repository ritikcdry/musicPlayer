
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <h1 className="text-4xl font-bold mb-10">🎵 Music App</h1>

      <div className="flex gap-8">

        <div
          onClick={() => navigate("/local")}
          className="cursor-pointer bg-white/10 hover:bg-white/20 transition p-8 rounded-xl w-64 text-center"
        >
          <h2 className="text-xl mb-2">🎧 Local Player</h2>
          <p className="text-gray-400">Play your downloaded songs</p>
        </div>

        <div
          onClick={() => navigate("/youtube")}
          className="cursor-pointer bg-white/10 hover:bg-white/20 transition p-8 rounded-xl w-64 text-center"
        >
          <h2 className="text-xl mb-2">▶ YouTube Player</h2>
          <p className="text-gray-400">Search & stream music</p>
        </div>

      </div>
    </div>
  );
};


export default Home;
