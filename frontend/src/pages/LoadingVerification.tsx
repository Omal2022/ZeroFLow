import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  identityType: "NIN" | "BVN";
  identityNumber: string;
}

export default function LoadingVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationData, setVerificationData] = useState<any>(null);

  const steps = [
    { label: "Connecting to verification service", duration: 800 },
    { label: "Validating identity number", duration: 1000 },
    { label: "Fetching your information", duration: 1200 },
    { label: "Verifying data integrity", duration: 900 },
    { label: "Preparing your profile", duration: 700 }
  ];

  useEffect(() => {
    if (!state?.identityType || !state?.identityNumber) {
      navigate("/identity");
      return;
    }

    // Fetch verification data
    const fetchData = async () => {
      try {
        const endpoint = state.identityType === "NIN" ? "/kyc/verify/nin" : "/kyc/verify/bvn";
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [state.identityType.toLowerCase()]: state.identityNumber
          })
        });

        const data = await response.json();
        setVerificationData(data);
      } catch (error) {
        console.error("Verification failed:", error);
      }
    };

    fetchData();
  }, [state, navigate]);

  useEffect(() => {
    // Animate through steps
    let currentStepIndex = 0;
    let totalProgress = 0;

    const animateStep = () => {
      if (currentStepIndex >= steps.length) {
        // All steps complete, navigate to form
        setTimeout(() => {
          navigate("/form", {
            state: {
              identityType: state.identityType,
              identityNumber: state.identityNumber,
              verificationData
            }
          });
        }, 500);
        return;
      }

      setCurrentStep(currentStepIndex);
      const step = steps[currentStepIndex];
      const stepProgress = 100 / steps.length;

      // Animate progress for this step
      const progressInterval = setInterval(() => {
        totalProgress += stepProgress / (step.duration / 50);
        setProgress(Math.min(totalProgress, (currentStepIndex + 1) * stepProgress));
      }, 50);

      setTimeout(() => {
        clearInterval(progressInterval);
        currentStepIndex++;
        animateStep();
      }, step.duration);
    };

    animateStep();
  }, [navigate, state, verificationData, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" style={{ backgroundColor: '#ac0509' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" style={{ backgroundColor: '#ac0509' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Animated icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 w-32 h-32 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(172, 5, 9, 0.3)' }}></div>
              <div className="absolute inset-2 w-28 h-28 border-4 rounded-full animate-spin-reverse" style={{ borderColor: 'rgba(172, 5, 9, 0.2)' }}></div>

              {/* Center icon */}
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #ac0509 0%, #7a0306 100%)' }}>
                <svg className="w-16 h-16 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              {/* Pulse effect */}
              <div className="absolute inset-0 w-32 h-32 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#ac0509' }}></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            Verifying Your Identity
          </h2>
          <p className="text-gray-300 text-center mb-8 text-lg">
            Please wait while we securely fetch your information
          </p>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-300">Progress</span>
              <span className="text-sm font-semibold" style={{ color: '#ac0509' }}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, backgroundColor: '#ac0509', boxShadow: '0 0 20px rgba(172, 5, 9, 0.5)' }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  index < currentStep
                    ? "bg-green-500/20 border border-green-500/30"
                    : index === currentStep
                    ? "bg-white/5 border shadow-lg"
                    : "bg-white/5 border border-white/10"
                }`}
                style={index === currentStep ? { borderColor: '#ac0509', boxShadow: '0 4px 20px rgba(172, 5, 9, 0.3)' } : {}}
              >
                {index < currentStep ? (
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : index === currentStep ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ac0509' }}>
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                )}
                <span
                  className={`text-sm md:text-base transition-colors ${
                    index < currentStep
                      ? "text-green-300 font-medium"
                      : index === currentStep
                      ? "text-white font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                  {index === currentStep && (
                    <span className="ml-2 inline-block">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse animation-delay-200">.</span>
                      <span className="animate-pulse animation-delay-400">.</span>
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Identity info */}
          <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: 'rgba(172, 5, 9, 0.1)', border: '1px solid rgba(172, 5, 9, 0.3)' }}>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#ac0509' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-1" style={{ color: '#ac0509' }}>Verifying {state?.identityType}</p>
                <p className="font-mono text-gray-400">
                  {state?.identityNumber?.slice(0, 3)}****{state?.identityNumber?.slice(-2)}
                </p>
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>NDPR Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
