import { useState, useRef } from "react";
import Webcam from "react-webcam";
import type { User } from "../types/register";

interface Props {
  user: User;
  onVerified: (user: User) => void;
}

export default function Verification({ user, onVerified }: Props) {
  const webcamRef = useRef<Webcam>(null);

  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle ID file selection
  const handleIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  // Capture selfie from camera
  const captureSelfie = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setSelfie(imageSrc);
    }
  };

  // Convert base64 -> Blob for upload
  const toBlob = async (base64: string) => {
    const res = await fetch(base64);
    return await res.blob();
  };

  // Upload both files to backend
  const handleVerify = async () => {
    if (!idFile || !selfie) {
      setError("Please upload ID and take a selfie.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("id", user.id.toString());
      formData.append("idDocument", idFile);
      const selfieBlob = await toBlob(selfie);
      formData.append("selfie", selfieBlob, "selfie.png");

      const res = await fetch("http://localhost:5000/api/onboarding/verify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onVerified(data.user);
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "450px",
        margin: "auto",
      }}
    >
      <h2>Identity Verification</h2>

      {/* STEP 1: Upload ID Document */}
      <section>
        <h3>1️⃣ Upload ID Document</h3>
        <input type="file" accept="image/*,application/pdf" onChange={handleIdSelect} />
        {idPreview && (
          <img
            src={idPreview}
            alt="ID Preview"
            width={300}
            style={{ borderRadius: "8px", marginTop: "0.5rem" }}
          />
        )}
      </section>

      {/* STEP 2: Capture Selfie */}
      <section>
        <h3>2️⃣ Take a Selfie</h3>
        {!selfie ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            width={300}
            videoConstraints={{ facingMode: "user" }}
          />
        ) : (
          <img
            src={selfie}
            alt="Captured Selfie"
            width={300}
            style={{ borderRadius: "8px" }}
          />
        )}
        <button onClick={captureSelfie}>
          {selfie ? "Retake Selfie" : "Capture Selfie"}
        </button>
      </section>

      {/* STEP 3: Submit */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleVerify} disabled={loading || !idFile || !selfie}>
        {loading ? "Verifying..." : "Submit Verification"}
      </button>
    </div>
  );
}
