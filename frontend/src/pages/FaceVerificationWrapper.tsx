import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Verification from "./Verification";

interface LocationState {
  identityType: "NIN" | "BVN";
  identityNumber: string;
  verificationData: any;
  formData: any;
  gpsData: any;
}

export default function FaceVerificationWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleVerified = async (user: any) => {
    setVerificationComplete(true);

    // Create account with all collected data
    try {
      const response = await fetch("http://localhost:5000/kyc/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityType: state.identityType,
          identityNumber: state.identityNumber,
          firstName: state.formData.firstName,
          lastName: state.formData.lastName,
          dob: state.formData.dob,
          email: state.formData.email,
          phone: state.formData.phone,
          address: state.formData.address,
          latitude: state.gpsData?.latitude,
          longitude: state.gpsData?.longitude,
          faceVerified: true,
          documentsUploaded: true
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to success page
        setTimeout(() => {
          navigate("/success", {
            state: { accountData: data.data }
          });
        }, 1000);
      } else {
        // Handle duplicate account error (409 Conflict)
        if (response.status === 409 && data.existingAccountInfo) {
          const existingInfo = data.existingAccountInfo;
          const confirmMessage = `${data.message}\n\nExisting Account Details:\n` +
            `Account Number: ${existingInfo.accountNumber}\n` +
            `Email: ${existingInfo.email}\n` +
            `Phone: ${existingInfo.phone}\n` +
            `Created: ${new Date(existingInfo.createdAt).toLocaleString()}\n\n` +
            `Click OK to return to the start.`;

          alert(confirmMessage);
          navigate("/");
        } else {
          alert("Account creation failed: " + data.message);
        }
      }
    } catch (error) {
      console.error("Account creation error:", error);
      alert("Network error. Please try again.");
    }
  };

  if (!state) {
    navigate("/identity");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Step 3 of 5</span>
            <span className="text-sm text-red-500">60% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r bg-red-700 h-2 rounded-full transition-all duration-500" style={{ width: "60%" }}></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Face Verification
          </h2>
          <p className="text-gray-300 text-lg">
            Complete the liveness check to verify your identity
          </p>
        </div>
      </div>

      {/* Verification Component */}
      <Verification onVerified={handleVerified} />

      {verificationComplete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Verification Complete!</h3>
            <p className="text-gray-300">Creating your account...</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-700 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
