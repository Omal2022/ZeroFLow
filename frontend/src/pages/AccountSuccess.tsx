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

  const handleGoToDashboard = () => {
    navigate("/dashboard", { state: { accountData: state?.accountData } });
  };

  const handleDownloadDetails = () => {
    const details = JSON.stringify(state?.accountData, null, 2);
    const blob = new Blob([details], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `account-${state?.accountData?.accountNumber}.json`;
    a.click();
  };

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

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className={`text-sm font-semibold ${
                    state?.accountData?.accountStatus === "active" ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {state?.accountData?.accountStatus === "active" ? "✓ Active" : "⏳ Pending Review"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Trust Score</p>
                  <p className="text-sm font-semibold text-purple-400">
                    {((state?.accountData?.trustScore || 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Setup Time</p>
                  <p className="text-sm font-semibold text-green-400">&lt; 60s</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Holder Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-white font-medium">
                  {state?.accountData?.user?.firstName} {state?.accountData?.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white font-medium">{state?.accountData?.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="text-white font-medium">{state?.accountData?.user?.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Identity Type</p>
                <p className="text-white font-medium">{state?.accountData?.user?.identityType}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGoToDashboard}
              className="py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Dashboard
              </span>
            </button>

            <button
              onClick={handleDownloadDetails}
              className="py-4 bg-white/10 border-2 border-white/20 text-white font-semibold text-lg rounded-xl hover:bg-white/20 hover:scale-[1.02] transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Details
              </span>
            </button>
          </div>

          {/* What's Next */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              What's Next?
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fund your account via bank transfer or card</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Set up your security PIN and transaction limits</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Request a physical debit card (delivered in 3-5 days)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
