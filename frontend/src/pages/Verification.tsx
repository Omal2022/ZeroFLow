import { useEffect, useRef, useState } from "react";

export default function Verification({ user = { id: "1", name: "Test User" }, onVerified = () => {} }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [error, setError] = useState(null);
  const [movements, setMovements] = useState({
    faceVisible: false,
    blink: false,
    moveLeft: false,
    moveRight: false,
    nod: false,
  });
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const timeoutsRef = useRef([]);

  // Initialize webcam
  useEffect(() => {
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

        setStatus("Camera ready! Just stay in frame, checks will complete automatically...");
        setError(null);

        // Start simulated liveness checks
        const timer = setTimeout(() => {
          if (mounted) startLivenessChecks();
        }, 1500);
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
      timeoutsRef.current.forEach(timer => clearTimeout(timer));
      timeoutsRef.current = [];
    };
  }, []);

  const startLivenessChecks = () => {
    // Simulate face detection immediately
    setMovements(prev => ({ ...prev, faceVisible: true }));
    setStatus("✅ Face detected! Verifying liveness...");

    // Auto-complete movements INSTANTLY for super easy demo! (~1.5 seconds total)
    const checks = [
      { key: "blink", delay: 300, message: "✅ Blink detected! Checking head movement..." },
      { key: "moveLeft", delay: 600, message: "✅ Left turn detected! Continuing..." },
      { key: "moveRight", delay: 900, message: "✅ Right turn detected! Almost done..." },
      { key: "nod", delay: 1200, message: "🎉 Perfect! All checks complete." },
    ];

    checks.forEach(({ key, delay, message }) => {
      const timer = setTimeout(() => {
        setMovements(prev => ({ ...prev, [key]: true }));
        setStatus(message);

        // Check if this was the last one
        if (key === "nod") {
          const captureTimer = setTimeout(() => {
            startCountdownCapture();
          }, 1000);
          timeoutsRef.current.push(captureTimer);
        }
      }, delay);
      timeoutsRef.current.push(timer);
    });
  };

  const startCountdownCapture = () => {
    setStatus("✅ Liveness verified! Capturing your photo...");

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

    // Set canvas dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageSrc = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedSelfie(imageSrc);
    setStatus("✅ Photo captured successfully!");

    // Convert to blob and call callback
    canvas.toBlob((blob) => {
      if (blob) {
        setTimeout(() => {
          onVerified(user, blob);
        }, 1500);
      }
    }, "image/jpeg", 0.9);
  };

  const handleRetry = () => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timer => clearTimeout(timer));
    timeoutsRef.current = [];

    // Reset state
    setMovements({
      faceVisible: false,
      blink: false,
      moveLeft: false,
      moveRight: false,
      nod: false,
    });
    setCapturedSelfie(null);
    setCountdown(null);
    setStatus("Camera ready! Just stay in frame...");

    // Restart checks
    const timer = setTimeout(() => startLivenessChecks(), 1000);
    timeoutsRef.current.push(timer);
  };

  const handleSkip = () => {
    // Skip verification and go directly to capture
    timeoutsRef.current.forEach(timer => clearTimeout(timer));
    timeoutsRef.current = [];

    setMovements({
      faceVisible: true,
      blink: true,
      moveLeft: true,
      moveRight: true,
      nod: true,
    });

    setStatus("⏩ Verification skipped! Capturing photo...");

    const timer = setTimeout(() => {
      startCountdownCapture();
    }, 500);
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
        backgroundColor: "#1a1a1a",
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
            backgroundColor: "#ac0509",
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
          backgroundColor: movements.faceVisible ? "#065f46" : "#ac0509",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontSize: "0.95rem",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {status}
      </div>

      {/* Progress Bar */}
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

      {/* Video Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto 1rem",
          borderRadius: "12px",
          overflow: "hidden",
          border: `4px solid ${movements.faceVisible ? "#10b981" : "#ac0509"}`,
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

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Countdown Overlay */}
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

        {/* Face Detection Indicator */}
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

      {/* Movement Checklist */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.25rem",
          borderRadius: "12px",
          marginBottom: "1rem",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.75rem" }}>
          Liveness Checks (Auto-completing):
        </strong>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {[
            { key: "faceVisible", icon: "😃", label: "Face Detected" },
            { key: "blink", icon: "👁️", label: "Blink Detected" },
            { key: "moveLeft", icon: "👈", label: "Head Movement Left" },
            { key: "moveRight", icon: "👉", label: "Head Movement Right" },
            { key: "nod", icon: "⬇️", label: "Nod Detected" },
          ].map(({ key, icon, label }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem",
                backgroundColor: movements[key]
                  ? "#065f46"
                  : "#1e293b",
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

      {/* Captured Selfie Preview */}
      {capturedSelfie && (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            marginBottom: "1rem",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.75rem" }}>
            📸 Captured Photo
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

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button
          onClick={handleRetry}
          style={{
            flex: 1,
            padding: "0.875rem",
            backgroundColor: "#ac0509",
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

        {!capturedSelfie && (
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: "0.875rem",
              backgroundColor: "#ac0509",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "600",
              fontSize: "0.95rem",
            }}
          >
            ⏩ Skip Checks
          </button>
        )}

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

      {/* Tips */}
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
            💡 Super Easy Demo Mode:
          </strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>✨ Checks complete automatically in ~1.5 seconds!</li>
            <li>⚡ Or click "Skip Checks" to go instantly to photo capture</li>
            <li>🎯 Verification is ultra-simplified for easy demo</li>
            <li>🚀 Perfect for quick testing and presentations!</li>
          </ul>
        </div>
      )}
    </div>
  );
}
