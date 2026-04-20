import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import LocalPlayer from './LocalPlayer';
import YouTubePlayer from './YouTubePlayer';

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/local" element={<LocalPlayer />} />
        <Route path="/youtube" element={<YouTubePlayer />} />
      </Routes>
    </BrowserRouter>
  )

  
}

export default App
