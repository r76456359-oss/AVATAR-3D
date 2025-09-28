import { useState, useRef, useCallback, useEffect } from 'react';
import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

let poseLandmarker: PoseLandmarker | null = null;

export const usePoseEstimation = () => {
  const [landmarks, setLandmarks] = useState<PoseLandmarkerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // FIX: `useRef` requires an initial value. Changed to initialize with `null` to resolve the "Expected 1 arguments, but got 0" error.
  const animationFrameId = useRef<number | null>(null);

  const createPoseLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      setIsLoading(false);
    } catch (e) {
      console.error("Error creating PoseLandmarker:", e);
      setError("Failed to load AI model. Please check your network connection and try again.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    createPoseLandmarker();
  }, [createPoseLandmarker]);

  const predictWebcam = useCallback(() => {
    if (!poseLandmarker || !videoRef.current || videoRef.current.readyState < 3) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(videoRef.current, startTimeMs);
    setLandmarks(results);
    
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);

  const startPoseEstimation = async (): Promise<boolean> => {
    if (!poseLandmarker) {
      setError("Pose estimation model not loaded yet.");
      return false;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
                videoRef.current.play();
                predictWebcam();
            }
        };
      }
      return true;
    } catch (err) {
      console.error("getUserMedia error:", err);
      setError("Camera access denied. Please allow camera permissions in your browser settings.");
      return false;
    }
  };

  const stopPoseEstimation = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setLandmarks(null);
  };
  
  return { videoRef, landmarks, isLoading, error, startPoseEstimation, stopPoseEstimation };
};
