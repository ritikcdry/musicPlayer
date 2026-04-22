import { useState } from "react";

// Stores the download status per video to track loading/error per song
interface DownloadState {
  loading: boolean;
  error: string | null;
}

const useYoutubeDownload = () => {
  const [state, setState] = useState<DownloadState>({
    loading: false,
    error: null,
  });

  // Fetches the MP3 download link from RapidAPI and triggers browser download
  const downloadAudio = async (videoId: string, title: string) => {
    setState({ loading: true, error: null });

    try {
      const response = await fetch(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY, // 🔑 Add this to your .env
          },
        }
      );

      const data = await response.json();

      if (data.status === "ok" && data.link) {
        // Fetches the MP3 as a blob first, then triggers download
        const audioRes = await fetch(data.link);
        const blob = await audioRes.blob();
        const blobUrl = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = `${title}.mp3`;  // Forces direct download, no new tab
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        // Frees up memory after download is triggered
        URL.revokeObjectURL(blobUrl);

        setState({ loading: false, error: null });
      } else {
        setState({ loading: false, error: "Download failed. Try again." });
      }
    } catch {
      setState({ loading: false, error: "Network error." });
    }
  };

  return { ...state, downloadAudio };
};

export default useYoutubeDownload;