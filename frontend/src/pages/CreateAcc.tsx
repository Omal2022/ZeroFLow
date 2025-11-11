import { useState, useEffect } from "react";
import type { User, Language, UserIdentity, OnboardingFormState } from "../types/register"

interface Props {
  onNext: (user: User) => void;
}

export default function OnboardingForm({ onNext }: Props) {
  const [form, setForm] = useState<OnboardingFormState>({
    name: "",
    email: "",
    phone: "",
    userIdentity: "NIN",
    identityNumber: "",
    language: "en",
  });

  const [aiMessage, setAiMessage] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const languages: Record<Language, string> = {
    en: "English",
    yo: "Yoruba",
    ig: "Igbo",
    ha: "Hausa",
    pidgin: "Pidgin",
  };

  // Get welcome message when component loads
  useEffect(() => {
    fetchWelcomeMessage();
  }, [form.language]);

  const fetchWelcomeMessage = async () => {
    try {
      const res = await fetch(`http://localhost:5000/onboarding/welcome/:lang${form.language}`);
      const data = await res.json();
      setAiMessage(data.message);
    } catch (err) {
      console.error("Failed to fetch welcome message:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Auto-lookup when identity number reaches 11 digits (NIN/BVN)
  const handleIdentityNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, identityNumber: value }));

    // Auto-lookup for NIN/BVN (11 digits)
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
        body: JSON.stringify({ 
          idValue,
          lang: form.language 
        }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        console.log(data.data)
        // Auto-fill form with found data
        setForm(prev => ({
          ...prev,
          name: data.data.name || prev.name,
          email: data.data.email || prev.email,
          phone: data.data.phone || prev.phone,
        }));
        setAiMessage(data.message);
      } else {
        // User not found
        setAiMessage(data.message);
      }
    } catch (err) {
      console.error("Lookup failed:", err);
      setAiMessage("Network error. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        onNext(data.user);
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      {/* AI Assistant Message */}
      {aiMessage && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#f0f9ff",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{aiMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Language Selection (at top for better UX) */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Preferred Language
          </label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            {Object.entries(languages).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Identity Type */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Identity Type
          </label>
          <select
            name="userIdentity"
            value={form.userIdentity}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          >
            <option value="NIN">NIN</option>
            <option value="BVN">BVN</option>
            <option value="Drivers License">Drivers License</option>
          </select>
        </div>

        {/* Identity Number with Auto-lookup */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            {form.userIdentity} Number
          </label>
          <input
            name="identityNumber"
            placeholder={`Enter your ${form.userIdentity} number`}
            value={form.identityNumber}
            onChange={handleIdentityNumberChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
          {isLookingUp && (
            <small style={{ color: "#3b82f6", marginTop: "0.25rem", display: "block" }}>
              Searching...
            </small>
          )}
        </div>

        {/* Name */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Full Name
          </label>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Phone Number
          </label>
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <button 
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Next
        </button>
      </form>
    </div>
  );
}