import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  accountData: {
    accountNumber: string;
    accountStatus: string;
    trustScore: number;
    user: any;
  };
}

export default function AccountSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [showConfetti, setShowConfetti] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    setShowConfetti(true);

    // Animate account number reveal
    if (state?.accountData?.accountNumber) {
      const number = state.accountData.accountNumber;
      let index = 0;
      const interval = setInterval(() => {
        if (index <= number.length) {
          setAccountNumber(number.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 100);
    }

    setTimeout(() => setShowConfetti(false), 5000);
  }, [state]);


  if (!state?.accountData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No account data found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {showConfetti && (
          <>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </>
        )}
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                <svg className="w-20 h-20 text-white animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute inset-0 w-32 h-32 bg-green-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Congratulations Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in-up">
              🎉 Account Created!
            </h1>
            <p className="text-xl text-gray-300 animate-fade-in-up animation-delay-200">
              Welcome to the future of banking
            </p>
          </div>

          {/* Account Number Display */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 rounded-2xl text-center animate-fade-in-up animation-delay-400">
            <p className="text-gray-300 text-sm mb-2">Your Account Number</p>
            <p className="text-4xl md:text-5xl font-bold text-white tracking-wider font-mono">
              {accountNumber}
              {accountNumber.length < (state?.accountData?.accountNumber?.length || 0) && (
                <span className="inline-block w-1 h-10 bg-purple-500 ml-1 animate-pulse"></span>
              )}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(state?.accountData?.accountNumber)}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
