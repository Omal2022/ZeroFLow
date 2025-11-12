import { useEffect, useRef, useState } from "react";

export default function Verification({ user = { id: "1", name: "Test User" }, onVerified = () => {} }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [error, setError] = useState(null);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [movements, setMovements] = useState({
    faceVisible: false,
    blink: false,
    moveLeft: false,
    moveRight: false,
    nod: false,
  });
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [scannerY, setScannerY] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const timeoutsRef = useRef([]);
  const detectionIntervalRef = useRef(null);
  const faceApiRef = useRef(null);
  const previousLandmarksRef = useRef(null);
  const blinkCounterRef = useRef({ leftEye: 0, rightEye: 0, lastBlink: 0 });
  const headPositionRef = useRef({ left: false, right: false, center: true });
  const nodPositionRef = useRef({ up: false, down: false, center: true });

  // Load face-api.js
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        setStatus("Loading face detection models...");
        
        // Load face-api.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js';
        script.async = true;
        
        script.onload = async () => {
          const faceapi = window.faceapi;
          faceApiRef.current = faceapi;
          
          // Load models from CDN
          const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
          
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          ]);
          
          setFaceApiLoaded(true);
          setStatus("Face detection ready!");
        };
        
        script.onerror = () => {
          setError("Failed to load face detection library");
        };
        
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        console.error("Face API load error:", err);
        setError("Failed to initialize face detection");
      }
    };

    loadFaceApi();
  }, []);

  // Initialize webcam
  useEffect(() => {
    if (!faceApiLoaded) return;
    
    let mounted = true;

    const initCamera = async () => {
      try {
        setStatus("Requesting camera access...");
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera not supported in this browser");
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        setStatus("Position your face in the frame...");
        setError(null);

        // Start face detection
        const timer = setTimeout(() => {
          if (mounted) startFaceDetection();
        }, 1000);
        timeoutsRef.current.push(timer);

      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please grant permissions and reload.");
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      timeoutsRef.current.forEach(timer => clearTimeout(timer));
      timeoutsRef.current = [];
    };
  }, [faceApiLoaded]);

  const startFaceDetection = () => {
    if (!faceApiRef.current || !videoRef.current) return;

    setIsScanning(true);
    
    detectionIntervalRef.current = setInterval(async () => {
      await detectFace();
    }, 100);
  };

  const detectFace = async () => {
    const faceapi = faceApiRef.current;
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!video || !faceapi || video.paused || video.ended || !overlayCanvas) return;

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      overlayCanvas.width = displaySize.width;
      overlayCanvas.height = displaySize.height;

      const ctx = overlayCanvas.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      if (detections) {
        // Face detected!
        if (!movements.faceVisible) {
          setMovements(prev => ({ ...prev, faceVisible: true }));
          setStatus("Face detected! Now blink naturally...");
        }

        // Draw face box
        const box = detections.detection.box;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Draw landmarks
        const landmarks = detections.landmarks;
        ctx.fillStyle = '#10b981';
        landmarks.positions.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Scanner effect
        animateScanner(box);

        // Detect movements
        detectBlink(landmarks);
        detectHeadMovement(landmarks);
        detectNod(landmarks);

      } else {
        // No face detected
        if (movements.faceVisible) {
          setMovements(prev => ({ ...prev, faceVisible: false }));
          setStatus("Please position your face in the frame...");
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  };

  const animateScanner = (box) => {
    setScannerY(prev => {
      const newY = prev + 5;
      return newY > box.height ? 0 : newY;
    });
  };

  const detectBlink = (landmarks) => {
    if (movements.blink) return;

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);

    const avgEAR = (leftEAR + rightEAR) / 2;

    // Blink detected when EAR drops below threshold (more lenient)
    if (avgEAR < 0.25) {
      const now = Date.now();
      if (now - blinkCounterRef.current.lastBlink > 300) {
        blinkCounterRef.current.leftEye++;
        blinkCounterRef.current.lastBlink = now;

        // Only need 1 blink now (faster!)
        if (blinkCounterRef.current.leftEye >= 1) {
          setMovements(prev => ({ ...prev, blink: true }));
          setStatus("Great! Now turn your head slightly left...");
        }
      }
    }
  };

  const calculateEAR = (eye) => {
    // Eye Aspect Ratio calculation
    const points = eye.map(p => [p.x, p.y]);
    
    const vertical1 = distance(points[1], points[5]);
    const vertical2 = distance(points[2], points[4]);
    const horizontal = distance(points[0], points[3]);

    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  };

  const detectHeadMovement = (landmarks) => {
    const nose = landmarks.getNose();
    const jawline = landmarks.getJawOutline();
    
    const noseX = nose[3].x;
    const leftJaw = jawline[0].x;
    const rightJaw = jawline[16].x;
    const jawWidth = rightJaw - leftJaw;
    const nosePosition = (noseX - leftJaw) / jawWidth;

    // More lenient thresholds - easier to trigger
    // Left turn
    if (!movements.moveLeft && nosePosition < 0.45) {
      headPositionRef.current = { left: true, right: false, center: false };
      setMovements(prev => ({ ...prev, moveLeft: true }));
      setStatus("Good! Now turn your head slightly right...");
    }

    // Right turn
    if (!movements.moveRight && nosePosition > 0.55) {
      if (movements.moveLeft) {
        headPositionRef.current = { left: false, right: true, center: false };
        setMovements(prev => ({ ...prev, moveRight: true }));
        setStatus("Nice! Now nod your head gently...");
      }
    }
  };

  const detectNod = (landmarks) => {
    if (movements.nod) return;

    const nose = landmarks.getNose();
    const noseTip = nose[3];

    if (previousLandmarksRef.current) {
      const prevNose = previousLandmarksRef.current.getNose()[3];
      const verticalMovement = noseTip.y - prevNose.y;

      // Easier thresholds - just need slight movement
      // Detect downward movement
      if (verticalMovement > 5 && !nodPositionRef.current.down) {
        nodPositionRef.current = { up: false, down: true, center: false };
      }

      // Detect upward movement (completing the nod)
      if (verticalMovement < -5 && nodPositionRef.current.down) {
        nodPositionRef.current = { up: true, down: false, center: true };
        
        if (movements.moveRight) {
          setMovements(prev => ({ ...prev, nod: true }));
          setStatus("Perfect! All checks complete.");
          
          // Stop detection and capture
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
          }
          setIsScanning(false);
          
          const timer = setTimeout(() => {
            startCountdownCapture();
          }, 500);
          timeoutsRef.current.push(timer);
        }
      }
    }

    previousLandmarksRef.current = landmarks;
  };

  const startCountdownCapture = () => {
    setStatus("✅ Liveness verified! Preparing to capture...");

    let count = 3;
    setCountdown(count);

    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countInterval);
        setCountdown(null);
        captureSelfie();
      }
    }, 1000);

    timeoutsRef.current.push(countInterval);
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedSelfie(imageSrc);
    setStatus("✅ Selfie captured successfully!");

    canvas.toBlob((blob) => {
      if (blob) {
        setTimeout(() => {
          onVerified(user, blob);
        }, 1500);
      }
    }, "image/jpeg", 0.9);
  };

  const handleRetry = () => {
    timeoutsRef.current.forEach(timer => clearTimeout(timer));
    timeoutsRef.current = [];

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    setMovements({
      faceVisible: false,
      blink: false,
      moveLeft: false,
      moveRight: false,
      nod: false,
    });
    setCapturedSelfie(null);
    setCountdown(null);
    setStatus("Position your face in the frame...");
    setScannerY(0);
    setIsScanning(true);

    blinkCounterRef.current = { leftEye: 0, rightEye: 0, lastBlink: 0 };
    headPositionRef.current = { left: false, right: false, center: true };
    nodPositionRef.current = { up: false, down: false, center: true };
    previousLandmarksRef.current = null;

    const timer = setTimeout(() => startFaceDetection(), 1000);
    timeoutsRef.current.push(timer);
  };

  const getProgressPercentage = () => {
    const completed = Object.entries(movements)
      .filter(([key]) => key !== "faceVisible")
      .filter(([_, done]) => done).length;
    return (completed / 4) * 100;
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#001529",
        borderRadius: "16px",
        color: "white",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>
          🔍 Liveness Verification
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
          {user.name}
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dc2626",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          padding: "1rem",
          backgroundColor: movements.faceVisible ? "#065f46" : "#1e3a8a",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontSize: "0.95rem",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {status}
      </div>

      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#1e293b",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: `${getProgressPercentage()}%`,
            height: "100%",
            backgroundColor: "#10b981",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto 1rem",
          borderRadius: "12px",
          overflow: "hidden",
          border: `4px solid ${movements.faceVisible ? "#10b981" : "#3b82f6"}`,
          backgroundColor: "#000",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transform: "scaleX(-1)",
          }}
        />

        <canvas
          ref={overlayCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)",
            pointerEvents: "none",
          }}
        />

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isScanning && movements.faceVisible && (
          <div
            style={{
              position: "absolute",
              top: `${scannerY}px`,
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: "#10b981",
              boxShadow: "0 0 10px #10b981, 0 0 20px #10b981",
              transition: "top 0.1s linear",
            }}
          />
        )}

        {countdown !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.7)",
              fontSize: "5rem",
              fontWeight: "bold",
              color: "#10b981",
            }}
          >
            {countdown}
          </div>
        )}

        {!capturedSelfie && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: movements.faceVisible
                ? "#10b981"
                : "rgba(0,0,0,0.7)",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            {movements.faceVisible ? "✅ Face Detected" : "⏳ Detecting..."}
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#0f172a",
          padding: "1.25rem",
          borderRadius: "12px",
          marginBottom: "1rem",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.75rem" }}>
          Complete These Actions:
        </strong>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {[
            { key: "faceVisible", icon: "😃", label: "Face Detected" },
            { key: "blink", icon: "👁️", label: "Blink Naturally" },
            { key: "moveLeft", icon: "👈", label: "Turn Head Left" },
            { key: "moveRight", icon: "👉", label: "Turn Head Right" },
            { key: "nod", icon: "⬇️", label: "Nod Head" },
          ].map(({ key, icon, label }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem",
                backgroundColor: movements[key] ? "#065f46" : "#1e293b",
                borderRadius: "6px",
                transition: "all 0.3s ease",
              }}
            >
              <span>
                {icon} {label}
              </span>
              <span style={{ fontSize: "1.25rem" }}>
                {movements[key] ? "✅" : "⏳"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {capturedSelfie && (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            marginBottom: "1rem",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.75rem" }}>
            📸 Captured Selfie
          </strong>
          <img
            src={capturedSelfie}
            alt="Captured Selfie"
            style={{
              width: "200px",
              borderRadius: "12px",
              border: "3px solid #10b981",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button
          onClick={handleRetry}
          style={{
            flex: 1,
            padding: "0.875rem",
            backgroundColor: "#ef4444",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "white",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          🔄 Retry
        </button>

        {capturedSelfie && (
          <button
            onClick={() => {
              if (capturedSelfie) {
                fetch(capturedSelfie)
                  .then(res => res.blob())
                  .then(blob => onVerified(user, blob));
              }
            }}
            style={{
              flex: 1,
              padding: "0.875rem",
              backgroundColor: "#10b981",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "600",
              fontSize: "0.95rem",
            }}
          >
            ✓ Continue
          </button>
        )}
      </div>

      {!capturedSelfie && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#94a3b8",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            💡 Tips for best results:
          </strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>Ensure good lighting on your face</li>
            <li>Keep your face centered in the frame</li>
            <li>Blink 1 time naturally to proceed</li>
            <li>Make small head movements (just a little turn)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// -----------------------

// import { useEffect, useRef, useState } from "react";

// export default function Verification({ user = { id: "1", name: "Test User" }, onVerified = () => {} }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [status, setStatus] = useState("Initializing camera...");
//   const [error, setError] = useState(null);
//   const [movements, setMovements] = useState({
//     faceVisible: false,
//     blink: false,
//     moveLeft: false,
//     moveRight: false,
//     nod: false,
//   });
//   const [capturedSelfie, setCapturedSelfie] = useState(null);
//   const [countdown, setCountdown] = useState(null);
//   const timeoutsRef = useRef([]);

//   // Initialize webcam
//   useEffect(() => {
//     let mounted = true;

//     const initCamera = async () => {
//       try {
//         setStatus("Requesting camera access...");
        
//         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//           setError("Camera not supported in this browser");
//           return;
//         }

//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: { ideal: 640 },
//             height: { ideal: 480 },
//             facingMode: "user",
//           },
//           audio: false,
//         });

//         if (!mounted) {
//           mediaStream.getTracks().forEach(track => track.stop());
//           return;
//         }

//         setStream(mediaStream);
        
//         if (videoRef.current) {
//           videoRef.current.srcObject = mediaStream;
//           await videoRef.current.play();
//         }

//         setStatus("Camera ready! Follow the instructions below.");
//         setError(null);

//         // Start simulated liveness checks
//         const timer = setTimeout(() => {
//           if (mounted) startLivenessChecks();
//         }, 2000);
//         timeoutsRef.current.push(timer);

//       } catch (err) {
//         console.error("Camera error:", err);
//         setError("Unable to access camera. Please grant permissions and reload.");
//       }
//     };

//     initCamera();

//     return () => {
//       mounted = false;
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//       timeoutsRef.current.forEach(timer => clearTimeout(timer));
//       timeoutsRef.current = [];
//     };
//   }, []);

//   const startLivenessChecks = () => {
//     // Simulate face detection immediately
//     setMovements(prev => ({ ...prev, faceVisible: true }));
//     setStatus("Please blink naturally...");

//     // Auto-complete movements with realistic timing
//     const checks = [
//       { key: "blink", delay: 3000, message: "Great! Now turn your head slightly left..." },
//       { key: "moveLeft", delay: 6000, message: "Good! Now turn your head slightly right..." },
//       { key: "moveRight", delay: 9000, message: "Nice! Now nod your head gently..." },
//       { key: "nod", delay: 12000, message: "Perfect! All checks complete." },
//     ];

//     checks.forEach(({ key, delay, message }) => {
//       const timer = setTimeout(() => {
//         setMovements(prev => ({ ...prev, [key]: true }));
//         setStatus(message);

//         // Check if this was the last one
//         if (key === "nod") {
//           const captureTimer = setTimeout(() => {
//             startCountdownCapture();
//           }, 1000);
//           timeoutsRef.current.push(captureTimer);
//         }
//       }, delay);
//       timeoutsRef.current.push(timer);
//     });
//   };

//   const startCountdownCapture = () => {
//     setStatus("✅ Liveness verified! Preparing to capture...");

//     let count = 3;
//     setCountdown(count);

//     const countInterval = setInterval(() => {
//       count--;
//       setCountdown(count);

//       if (count === 0) {
//         clearInterval(countInterval);
//         setCountdown(null);
//         captureSelfie();
//       }
//     }, 1000);

//     timeoutsRef.current.push(countInterval);
//   };

//   const captureSelfie = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     if (!context) return;

//     // Set canvas dimensions
//     canvas.width = video.videoWidth || 640;
//     canvas.height = video.videoHeight || 480;

//     // Draw video frame to canvas
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     // Convert to data URL
//     const imageSrc = canvas.toDataURL("image/jpeg", 0.9);
//     setCapturedSelfie(imageSrc);
//     setStatus("✅ Selfie captured successfully!");

//     // Convert to blob and call callback
//     canvas.toBlob((blob) => {
//       if (blob) {
//         setTimeout(() => {
//           onVerified(user, blob);
//         }, 1500);
//       }
//     }, "image/jpeg", 0.9);
//   };

//   const handleRetry = () => {
//     // Clear all timeouts
//     timeoutsRef.current.forEach(timer => clearTimeout(timer));
//     timeoutsRef.current = [];

//     // Reset state
//     setMovements({
//       faceVisible: false,
//       blink: false,
//       moveLeft: false,
//       moveRight: false,
//       nod: false,
//     });
//     setCapturedSelfie(null);
//     setCountdown(null);
//     setStatus("Camera ready! Follow the instructions below.");

//     // Restart checks
//     const timer = setTimeout(() => startLivenessChecks(), 1000);
//     timeoutsRef.current.push(timer);
//   };

//   const getProgressPercentage = () => {
//     const completed = Object.entries(movements)
//       .filter(([key]) => key !== "faceVisible")
//       .filter(([_, done]) => done).length;
//     return (completed / 4) * 100;
//   };

//   return (
//     <div
//       style={{
//         maxWidth: "600px",
//         margin: "2rem auto",
//         padding: "2rem",
//         backgroundColor: "#001529",
//         borderRadius: "16px",
//         color: "white",
//         boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
//         fontFamily: "system-ui, -apple-system, sans-serif",
//       }}
//     >
//       <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
//         <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>
//           🔍 Liveness Verification
//         </h2>
//         <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
//           {user.name}
//         </p>
//       </div>

//       {error && (
//         <div
//           style={{
//             padding: "1rem",
//             backgroundColor: "#dc2626",
//             borderRadius: "8px",
//             marginBottom: "1rem",
//             fontSize: "0.9rem",
//           }}
//         >
//           ⚠️ {error}
//         </div>
//       )}

//       <div
//         style={{
//           padding: "1rem",
//           backgroundColor: movements.faceVisible ? "#065f46" : "#1e3a8a",
//           borderRadius: "8px",
//           marginBottom: "1rem",
//           fontSize: "0.95rem",
//           textAlign: "center",
//           fontWeight: "500",
//         }}
//       >
//         {status}
//       </div>

//       {/* Progress Bar */}
//       <div
//         style={{
//           width: "100%",
//           height: "8px",
//           backgroundColor: "#1e293b",
//           borderRadius: "4px",
//           overflow: "hidden",
//           marginBottom: "1rem",
//         }}
//       >
//         <div
//           style={{
//             width: `${getProgressPercentage()}%`,
//             height: "100%",
//             backgroundColor: "#10b981",
//             transition: "width 0.3s ease",
//           }}
//         />
//       </div>

//       {/* Video Container */}
//       <div
//         style={{
//           position: "relative",
//           width: "100%",
//           maxWidth: "400px",
//           margin: "0 auto 1rem",
//           borderRadius: "12px",
//           overflow: "hidden",
//           border: `4px solid ${movements.faceVisible ? "#10b981" : "#3b82f6"}`,
//           backgroundColor: "#000",
//         }}
//       >
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           style={{
//             width: "100%",
//             height: "auto",
//             display: "block",
//             transform: "scaleX(-1)",
//           }}
//         />

//         {/* Hidden canvas for capture */}
//         <canvas ref={canvasRef} style={{ display: "none" }} />

//         {/* Countdown Overlay */}
//         {countdown !== null && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               backgroundColor: "rgba(0,0,0,0.7)",
//               fontSize: "5rem",
//               fontWeight: "bold",
//               color: "#10b981",
//             }}
//           >
//             {countdown}
//           </div>
//         )}

//         {/* Face Detection Indicator */}
//         {!capturedSelfie && (
//           <div
//             style={{
//               position: "absolute",
//               top: "1rem",
//               right: "1rem",
//               padding: "0.5rem 1rem",
//               backgroundColor: movements.faceVisible
//                 ? "#10b981"
//                 : "rgba(0,0,0,0.7)",
//               borderRadius: "20px",
//               fontSize: "0.85rem",
//               fontWeight: "600",
//             }}
//           >
//             {movements.faceVisible ? "✅ Face Detected" : "⏳ Detecting..."}
//           </div>
//         )}
//       </div>

//       {/* Movement Checklist */}
//       <div
//         style={{
//           backgroundColor: "#0f172a",
//           padding: "1.25rem",
//           borderRadius: "12px",
//           marginBottom: "1rem",
//         }}
//       >
//         <strong style={{ display: "block", marginBottom: "0.75rem" }}>
//           Complete These Actions:
//         </strong>
//         <div style={{ display: "grid", gap: "0.5rem" }}>
//           {[
//             { key: "faceVisible", icon: "😃", label: "Face Detected" },
//             { key: "blink", icon: "👁️", label: "Blink Naturally" },
//             { key: "moveLeft", icon: "👈", label: "Turn Head Left" },
//             { key: "moveRight", icon: "👉", label: "Turn Head Right" },
//             { key: "nod", icon: "⬇️", label: "Nod Head" },
//           ].map(({ key, icon, label }) => (
//             <div
//               key={key}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 padding: "0.5rem",
//                 backgroundColor: movements[key]
//                   ? "#065f46"
//                   : "#1e293b",
//                 borderRadius: "6px",
//                 transition: "all 0.3s ease",
//               }}
//             >
//               <span>
//                 {icon} {label}
//               </span>
//               <span style={{ fontSize: "1.25rem" }}>
//                 {movements[key] ? "✅" : "⏳"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Captured Selfie Preview */}
//       {capturedSelfie && (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "1rem",
//             backgroundColor: "#0f172a",
//             borderRadius: "12px",
//             marginBottom: "1rem",
//           }}
//         >
//           <strong style={{ display: "block", marginBottom: "0.75rem" }}>
//             📸 Captured Selfie
//           </strong>
//           <img
//             src={capturedSelfie}
//             alt="Captured Selfie"
//             style={{
//               width: "200px",
//               borderRadius: "12px",
//               border: "3px solid #10b981",
//               transform: "scaleX(-1)",
//             }}
//           />
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
//         <button
//           onClick={handleRetry}
//           style={{
//             flex: 1,
//             padding: "0.875rem",
//             backgroundColor: "#ef4444",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer",
//             color: "white",
//             fontWeight: "600",
//             fontSize: "0.95rem",
//           }}
//         >
//           🔄 Retry
//         </button>

//         {capturedSelfie && (
//           <button
//             onClick={() => {
//               if (capturedSelfie) {
//                 fetch(capturedSelfie)
//                   .then(res => res.blob())
//                   .then(blob => onVerified(user, blob));
//               }
//             }}
//             style={{
//               flex: 1,
//               padding: "0.875rem",
//               backgroundColor: "#10b981",
//               border: "none",
//               borderRadius: "8px",
//               cursor: "pointer",
//               color: "white",
//               fontWeight: "600",
//               fontSize: "0.95rem",
//             }}
//           >
//             ✓ Continue
//           </button>
//         )}
//       </div>

//       {/* Tips */}
//       {!capturedSelfie && (
//         <div
//           style={{
//             marginTop: "1rem",
//             padding: "1rem",
//             backgroundColor: "#1e293b",
//             borderRadius: "8px",
//             fontSize: "0.85rem",
//             color: "#94a3b8",
//           }}
//         >
//           <strong style={{ display: "block", marginBottom: "0.5rem" }}>
//             💡 Tips for best results:
//           </strong>
//           <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
//             <li>Ensure good lighting on your face</li>
//             <li>Keep your face centered in the frame</li>
//             <li>Follow instructions naturally</li>
//             <li>The verification completes automatically</li>
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }