
import React, { useRef, useEffect } from 'react';
import { PoseLandmarkerResult, PoseLandmarker } from '@mediapipe/tasks-vision';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: PoseLandmarkerResult | null;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, landmarks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !landmarks || landmarks.landmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { landmarks: landmarkData } = landmarks;

    // Draw connectors
    ctx.strokeStyle = '#00FFFF'; // Cyan
    ctx.lineWidth = 2;
    PoseLandmarker.POSE_CONNECTIONS.forEach((connection) => {
      const start = landmarkData[0][connection.start];
      const end = landmarkData[0][connection.end];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    ctx.fillStyle = '#FF00FF'; // Magenta
    landmarkData[0].forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [landmarks, videoRef]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover" />
    </div>
  );
};

export default CameraFeed;
