import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IdentityInput() {
  const navigate = useNavigate();
  const [identityType, setIdentityType] = useState<"NIN" | "BVN">("NIN");
  const [identityNumber, setIdentityNumber] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleIdentityTypeChange = (type: "NIN" | "BVN") => {
    setIdentityType(type);
    setIdentityNumber("");
    setError("");
  };

  const validateInput = (value: string) => {
    // Only allow numbers
    const cleaned = value.replace(/\D/g, "");
    setIdentityNumber(cleaned);

    if (cleaned.length > 0 && cleaned.length !== 11) {
      setError(`${identityType} must be exactly 11 digits`);
    } else {
      setError("");
    }
  };

  const handleContinue = async () => {
    if (identityNumber.length !== 11) {
      setError(`Please enter a valid 11-digit ${identityType}`);
      return;
    }

    setIsValidating(true);

    // Navigate to loading page with identity data
    setTimeout(() => {
      navigate("/loading", {
        state: {
          identityType,
          identityNumber
        }
      });
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && identityNumber.length === 11) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" style={{ backgroundColor: '#ac0509' }}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Step 1 of 5</span>
              <span className="text-sm" style={{ color: '#ac0509' }}>20% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: "20%", backgroundColor: '#ac0509' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Verify Your Identity
            </h2>
            <p className="text-gray-300 text-lg">
              Choose your preferred identification method
            </p>
          </div>

          {/* Identity type selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleIdentityTypeChange("NIN")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                identityType === "NIN"
                  ? "bg-white/5 hover:bg-white/10"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
              style={identityType === "NIN" ? { borderColor: '#ac0509', boxShadow: '0 10px 30px rgba(172, 5, 9, 0.5)' } : {}}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  identityType === "NIN" ? "" : "bg-gray-600"
                }`}
                  style={identityType === "NIN" ? { backgroundColor: '#ac0509' } : {}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">NIN</p>
                  <p className="text-gray-400 text-sm">National ID</p>
                </div>
                {identityType === "NIN" && (
                  <div className="flex items-center gap-1 text-sm" style={{ color: '#ac0509' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => handleIdentityTypeChange("BVN")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                identityType === "BVN"
                  ? "bg-white/5 hover:bg-white/10"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
              style={identityType === "BVN" ? { borderColor: '#ac0509', boxShadow: '0 10px 30px rgba(172, 5, 9, 0.5)' } : {}}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  identityType === "BVN" ? "" : "bg-gray-600"
                }`}
                  style={identityType === "BVN" ? { backgroundColor: '#ac0509' } : {}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">BVN</p>
                  <p className="text-gray-400 text-sm">Bank Verification</p>
                </div>
                {identityType === "BVN" && (
                  <div className="flex items-center gap-1 text-sm" style={{ color: '#ac0509' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Input field */}
          <div className="mb-8">
            <label className="block text-white font-medium mb-3 text-lg">
              Enter your {identityType}
            </label>
            <div className="relative">
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => validateInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter 11 digits"
                maxLength={11}
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white text-xl tracking-widest placeholder-gray-500 focus:outline-none focus:bg-white/15 transition-all"
                style={{ outlineColor: '#ac0509' }}
                onFocus={(e) => e.target.style.borderColor = '#ac0509'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
              {identityNumber.length === 11 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {identityNumber.length > 0 && (
              <p className="mt-2 text-gray-400 text-sm">
                {identityNumber.length}/11 digits entered
              </p>
            )}
          </div>

          {/* Info box */}
          <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: 'rgba(172, 5, 9, 0.1)', border: '1px solid rgba(172, 5, 9, 0.3)' }}>
            <div className="flex gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#ac0509' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-1" style={{ color: '#ac0509' }}>Secure & Private</p>
                <p>Your {identityType} is encrypted and will only be used for identity verification. We comply with NDPR regulations.</p>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={identityNumber.length !== 11 || isValidating}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              identityNumber.length === 11 && !isValidating
                ? "text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            style={identityNumber.length === 11 && !isValidating ? { backgroundColor: '#ac0509', boxShadow: '0 10px 30px rgba(172, 5, 9, 0.5)' } : {}}
          >
            {isValidating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have a {identityType}?{" "}
          <button
            onClick={() => handleIdentityTypeChange(identityType === "NIN" ? "BVN" : "NIN")}
            className="underline"
            style={{ color: '#ac0509' }}
          >
            Try {identityType === "NIN" ? "BVN" : "NIN"} instead
          </button>
        </p>
      </div>
    </div>
  );
}
