import { useState } from "react";
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

  const languages: Record<Language, string> = {
    en: "English",
    yo: "Yoruba",
    ig: "Igbo",
    ha: "Hausa",
    pidgin: "Pidgin",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/onboarding/register", {
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
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}
    >
      <input
        name="name"
        placeholder="Name"
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
        required
      />
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        required
      />
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
      <input
        name="identityNumber"
        placeholder="Enter your NIN/BVN/Driver's License number"
        value={form.identityNumber}
        onChange={handleChange}
        required
      />
      <select
        name="language"
        value={form.language}
        onChange={handleChange}
      >
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
