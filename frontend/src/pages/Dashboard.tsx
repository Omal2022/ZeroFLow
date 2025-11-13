import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountData = location.state?.accountData;

  const [activeTab, setActiveTab] = useState("overview");

  if (!accountData) {
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

  const transactions = [
    { id: 1, type: "credit", description: "Account Opening Bonus", amount: 1000, date: new Date().toISOString(), status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ZeroFlow</h1>
                <p className="text-xs text-gray-400">Digital Banking</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {accountData.user?.firstName?.charAt(0)}{accountData.user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium">
                    {accountData.user?.firstName} {accountData.user?.lastName}
                  </p>
                  <p className="text-gray-400 text-xs">{accountData.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Welcome, {accountData.user?.firstName}! 👋
              </h2>
              <p className="text-gray-300">
                Your account is {accountData.accountStatus === "active" ? "active and ready" : "under review"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">Account Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-purple-200 text-sm mb-1">Available Balance</p>
                <h3 className="text-4xl md:text-5xl font-bold text-white">₦1,000.00</h3>
                <p className="text-purple-200 text-sm mt-2">Opening Bonus Credited</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <p className="text-white text-xs font-medium">NGN</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-purple-200 text-xs mb-1">Account Number</p>
                <p className="text-white font-mono font-semibold">{accountData.accountNumber}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-purple-200 text-xs mb-1">Trust Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{(accountData.trustScore * 100).toFixed(0)}%</p>
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl transition-all text-sm font-medium">
                Send
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl transition-all text-sm font-medium">
                Request
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl transition-all text-sm font-medium">
                Add Funds
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h4>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Request Card</p>
                    <p className="text-gray-400 text-xs">Physical & Virtual</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Set PIN</p>
                    <p className="text-gray-400 text-xs">Transaction Security</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Invite Friends</p>
                    <p className="text-gray-400 text-xs">Earn Rewards</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="border-b border-white/10">
            <div className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "text-white border-b-2 border-purple-500 bg-white/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "transactions"
                    ? "text-white border-b-2 border-purple-500 bg-white/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "profile"
                    ? "text-white border-b-2 border-purple-500 bg-white/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Profile
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "credit" ? "bg-green-500/20" : "bg-red-500/20"
                        }`}>
                          <svg className={`w-5 h-5 ${tx.type === "credit" ? "text-green-400" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.type === "credit" ? "M12 4v16m8-8H4" : "M20 12H4"} />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{tx.description}</p>
                          <p className="text-gray-400 text-xs">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${tx.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">Start using your account to see transactions here</p>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Full Name</p>
                    <p className="text-white font-medium">{accountData.user?.firstName} {accountData.user?.lastName}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{accountData.user?.email}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Phone</p>
                    <p className="text-white font-medium">{accountData.user?.phone}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Date of Birth</p>
                    <p className="text-white font-medium">{accountData.user?.dob}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Identity Type</p>
                    <p className="text-white font-medium">{accountData.user?.identityType}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Account Status</p>
                    <p className="text-green-400 font-medium">✓ Verified</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
