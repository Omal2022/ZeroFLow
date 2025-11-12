import { useState } from "react";
import Tesseract from "tesseract.js";
import type { Language, OnboardingFormState, User } from "../types/register";
import Verification from "./Verification";

export default function CreateAcc() {
  const [form, setForm] = useState<OnboardingFormState>({
    userIdentity: "NIN",
    name: "",
    email: "",
    phone: "",
    identityNumber: "",
    language: "en",
  });

  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  const [step, setStep] = useState<"form" | "verify">("form");

  const languages: Record<Language, string> = {
    en: "English",
    yo: "Yoruba",
    ig: "Igbo",
    ha: "Hausa",
    pidgin: "Pidgin",
  };

  // Handle text/selection changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- IMAGE PREPROCESSING FOR CLEANER OCR ---
  async function preprocessImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg =
            (imageData.data[i] +
              imageData.data[i + 1] +
              imageData.data[i + 2]) /
            3;
          imageData.data[i] = avg;
          imageData.data[i + 1] = avg;
          imageData.data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);

        // Convert back to base64
        const processed = canvas.toDataURL("image/png");
        resolve(processed);
      };
    });
  }

  // --- RUN OCR AFTER IMAGE UPLOAD ---
  const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
    await runOcr(file);
  };

  // --- OCR PROCESSING FUNCTION ---
  const runOcr = async (file: File) => {
    setLoading(true);
    try {
      const processedImage = await preprocessImage(file);
      const result = await Tesseract.recognize(processedImage, "eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      console.log("OCR TEXT:", text);
      setOcrText(text);
      autoFillForm(text);
    } catch (error) {
      console.error(error);
      alert("OCR failed. Try uploading a clearer ID image.");
    } finally {
      setLoading(false);
    }
  };

  // --- AUTO-FILL FORM FIELDS FROM OCR TEXT ---
  const autoFillForm = (text: string) => {
    const nameMatch = text.match(/Name[:\s]*([A-Za-z\s]+)/i);
    const idMatch = text.match(/(NIN|BVN|DL)[^\d]*(\d{8,15})/i);
    const phoneMatch = text.match(/(\+234|0)[0-9]{10}/);

    setForm((prev) => ({
      ...prev,
      name: nameMatch ? nameMatch[1].trim() : prev.name,
      identityNumber: idMatch ? idMatch[2] : prev.identityNumber,
      phone: phoneMatch ? phoneMatch[0] : prev.phone,
    }));
  };

  // --- HANDLE FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      alert("Please upload an ID document first.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("idDocument", idFile);

      const res = await fetch("http://localhost:6000/api/onboarding/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration successful! Proceed to verification.");
        setVerifiedUser(data.user);
        setStep("verify");
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  // --- WHEN VERIFIED SUCCESSFULLY ---
  const handleVerified = (user: User) => {
    setVerifiedUser(user);
    setForm({
      userIdentity: user.userIdentity,
      name: user.name,
      email: user.email,
      phone: user.phone,
      identityNumber: user.identityNumber,
      language: user.language,
    });
    alert("Verification successful! User info auto-filled.");
    setStep("form");
  };

  // --- MOVE TO VERIFICATION SCREEN ---
  if (step === "verify" && verifiedUser) {
    return <Verification user={verifiedUser} onVerified={handleVerified} />;
  }

  // --- MAIN FORM UI ---
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "400px",
        margin: "auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Create Account</h2>

      {/* ID Type */}
      <select
        name="userIdentity"
        value={form.userIdentity}
        onChange={handleChange}
        required
      >
        <option value="NIN">NIN</option>
        <option value="BVN">BVN</option>
        <option value="Drivers License">Drivers License</option>
      </select>

      {/* Upload ID */}
      <label>Upload your ID Document:</label>
      <input type="file" accept="image/*,application/pdf" onChange={handleIdSelect} />
      {idPreview && (
        <img
          src={idPreview}
          alt="ID Preview"
          width={250}
          style={{ borderRadius: "8px", marginTop: "0.5rem" }}
        />
      )}

      {loading && <p>🔍 Scanning document for text...</p>}
      {ocrText && (
        <pre
          style={{
            background: "#f8f8f8",
            padding: "0.5rem",
            borderRadius: "6px",
            overflowX: "auto",
          }}
        >
          {ocrText}
        </pre>
      )}

      {/* Autofilled fields */}
      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
      />
      <input
        name="identityNumber"
        placeholder="Identity Number"
        value={form.identityNumber}
        onChange={handleChange}
        required
      />

      {/* Language */}
      <select name="language" value={form.language} onChange={handleChange}>
        {Object.entries(languages).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <button type="submit">Next</button>
    </form>
  );
}
