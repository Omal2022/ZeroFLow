import { useState, useEffect } from "react";
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
  const [aiMessage, setAiMessage] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  const [step, setStep] = useState<"form" | "verify">("form");

  const languages: Record<Language, string> = {
    en: "English",
    yo: "Yoruba",
    ig: "Igbo",
    ha: "Hausa",
    pidgin: "Pidgin",
  };

  // ------------------- FETCH AI WELCOME MESSAGE -------------------
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      console.log("🔵 Fetching welcome message for:", form.language);
      try {
        const res = await fetch(`http://localhost:5000/onboarding/welcome/${form.language}`);
        const data = await res.json();
        setAiMessage(data.message);
      } catch (err) {
        console.error("🔴 Error:", err);
      }
    };
    fetchWelcomeMessage();
  }, [form.language]);

  // ------------------- HANDLE FIELD CHANGES -------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- AUTO LOOKUP USER (NIN/BVN) -------------------
  const handleIdentityNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, identityNumber: value }));

    if ((form.userIdentity === "NIN" || form.userIdentity === "BVN") && value.length === 11) {
      await lookupUser(value);
    }
  };

  const lookupUser = async (idValue: string) => {
    setIsLookingUp(true);
    try {
      const res = await fetch("http://localhost:5000/onboarding/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idValue, lang: form.language }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        setForm((prev) => ({
          ...prev,
          name: data.data.name || prev.name,
          email: data.data.email || prev.email,
          phone: data.data.phone || prev.phone,
        }));
        setAiMessage(data.message);
      } else {
        setAiMessage(data.message || "User not found.");
      }
    } catch (err) {
      console.error("Lookup failed:", err);
      setAiMessage("Network error. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // ------------------- IMAGE UPLOAD + OCR -------------------
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

        // Convert to grayscale for better OCR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg;
          imageData.data[i + 1] = avg;
          imageData.data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };
    });
  }

  const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
    await runOcr(file);
  };

  const runOcr = async (file: File) => {
    setLoading(true);
    try {
      const processedImage = await preprocessImage(file);
      const result = await Tesseract.recognize(processedImage, "eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      setOcrText(text);
      autoFillForm(text);
    } catch (error) {
      console.error(error);
      alert("OCR failed. Try uploading a clearer ID image.");
    } finally {
      setLoading(false);
    }
  };

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

  // ------------------- SUBMIT HANDLER -------------------
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

  // ------------------- HANDLE VERIFIED USER -------------------
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

  // ------------------- STEP CONTROL -------------------
  if (step === "verify" && verifiedUser) {
    return <Verification user={verifiedUser} onVerified={handleVerified} />;
  }

  // ------------------- MAIN FORM UI -------------------
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      {aiMessage && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#00121fff",
            color: "white",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{aiMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Create Account</h2>

        {/* Language */}
        <label>Preferred Language</label>
        <select name="language" value={form.language} onChange={handleChange}>
          {Object.entries(languages).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* ID Type */}
        <label>Identity Type</label>
        <select name="userIdentity" value={form.userIdentity} onChange={handleChange}>
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

        {/* Auto Lookup ID Field */}
        <label>{form.userIdentity} Number</label>
        <input
          name="identityNumber"
          placeholder={`Enter your ${form.userIdentity} number`}
          value={form.identityNumber}
          onChange={handleIdentityNumberChange}
          required
        />
        {isLookingUp && <small style={{ color: "#3b82f6" }}>Searching...</small>}

        {/* Other Fields */}
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
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Next
        </button>
      </form>
    </div>
  );
}
