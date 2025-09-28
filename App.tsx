
import React, { useState, useEffect, useRef } from 'react';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import CameraFeed from './components/CameraFeed';
import AvatarCanvas from './components/AvatarCanvas';
import Loader from './components/Loader';
import { usePoseEstimation } from './hooks/usePoseEstimation';
import { GithubIcon, InfoIcon } from './components/Icons';

const App: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { 
    videoRef, 
    landmarks, 
    isLoading, 
    error, 
    startPoseEstimation, 
    stopPoseEstimation 
  } = usePoseEstimation();

  const handleStartCamera = async () => {
    const success = await startPoseEstimation();
    if (success) {
      setIsCameraActive(true);
    }
  };

  const handleStopCamera = () => {
    stopPoseEstimation();
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          3D AI Avatar Mirror
        </h1>
        <a 
          href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/ai-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <GithubIcon className="w-6 h-6" />
        </a>
      </header>
      
      <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col items-center justify-center p-4">
        {isLoading && <Loader />}

        {!isCameraActive && !isLoading && (
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-4">Bring Your Avatar to Life</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              Allow camera access to mirror your movements onto a 3D avatar in real-time. Your camera feed stays on your device.
            </p>
            <button
              onClick={handleStartCamera}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
            >
              Start Camera
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        )}

        {isCameraActive && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="w-full aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-2xl border-2 border-cyan-500/50">
                  <CameraFeed videoRef={videoRef} landmarks={landmarks} />
              </div>
              <div className="w-full aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-2xl border-2 border-purple-500/50">
                  <AvatarCanvas landmarks={landmarks} />
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleStopCamera}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transform transition-all duration-200"
              >
                Stop Camera
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="w-full max-w-7xl mx-auto p-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center bg-gray-800/50 p-3 rounded-lg max-w-fit mx-auto mb-4">
          <InfoIcon className="w-5 h-5 mr-2 text-cyan-400" />
          <span>For best results, ensure your full body is visible to the camera.</span>
        </div>
        <p>&copy; {new Date().getFullYear()} AI Avatar Mirror. Powered by MediaPipe & Three.js.</p>
      </footer>
    </div>
  );
};

export default App;
