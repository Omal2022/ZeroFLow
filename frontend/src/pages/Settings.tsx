import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const KYC_TIERS = [
  {
    tier: 1,
    name: "Basic",
    requirements: ["Email verification", "NIN verification"],
    transactionLimit: 50000,
    description: "₦50,000/day limit"
  },
  {
    tier: 2,
    name: "Standard",
    requirements: ["Tier 1 requirements", "Utility bill", "ID card upload"],
    transactionLimit: 500000,
    description: "₦500,000/day limit"
  },
  {
    tier: 3,
    name: "Premium",
    requirements: ["Tier 2 requirements", "Proof of address", "Bank statement"],
    transactionLimit: Infinity,
    description: "Unlimited transactions"
  }
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountData = location.state?.accountData;

  const [currentTier, setCurrentTier] = useState(accountData?.kycTier?.current || 1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetTier, setTargetTier] = useState(2);
  const [documents, setDocuments] = useState({
    utilityBill: null as File | null,
    idCard: null as File | null,
    proofOfAddress: null as File | null,
    bankStatement: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleUpgrade = async () => {
    setIsUploading(true);

    // Validate required documents
    if (targetTier === 2 && (!documents.utilityBill || !documents.idCard)) {
      alert("Please upload both utility bill and ID card for Tier 2 upgrade");
      setIsUploading(false);
      return;
    }

    if (targetTier === 3 && (!documents.proofOfAddress || !documents.bankStatement)) {
      alert("Please upload both proof of address and bank statement for Tier 3 upgrade");
      setIsUploading(false);
      return;
    }

    // Simulate API call
    try {
      const response = await fetch("http://localhost:3000/kyc/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTier,
          targetTier,
          utilityBill: documents.utilityBill?.name,
          idCard: documents.idCard?.name,
          proofOfAddress: documents.proofOfAddress?.name,
          bankStatement: documents.bankStatement?.name
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully upgraded to ${data.data.tierName} tier!`);
        setCurrentTier(data.data.newTier);
        setShowUpgradeModal(false);
        setDocuments({
          utilityBill: null,
          idCard: null,
          proofOfAddress: null,
          bankStatement: null
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to upgrade tier. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const currentTierInfo = KYC_TIERS.find(t => t.tier === currentTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard", { state: { accountData } })}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-xs text-gray-400">Manage your account</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {accountData.user?.firstName?.charAt(0)}{accountData.user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Current KYC Tier */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-200 text-sm mb-2">Current KYC Tier</p>
              <h2 className="text-4xl font-bold text-white mb-2">
                Tier {currentTier} - {currentTierInfo?.name}
              </h2>
              <p className="text-purple-200 text-lg">{currentTierInfo?.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <p className="text-white text-2xl font-bold">🎯</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-200 text-sm mb-2">Transaction Limit</p>
            <p className="text-white text-2xl font-bold">
              {currentTierInfo?.transactionLimit === Infinity
                ? "Unlimited"
                : `₦${currentTierInfo?.transactionLimit.toLocaleString()}/day`}
            </p>
          </div>
        </div>

        {/* KYC Tiers Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8">
          <h3 className="text-white text-xl font-bold mb-4">Available KYC Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KYC_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`p-6 rounded-xl border-2 transition-all ${
                  tier.tier === currentTier
                    ? "border-green-500 bg-green-500/10"
                    : tier.tier < currentTier
                    ? "border-white/10 bg-white/5 opacity-50"
                    : "border-purple-500/30 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg">Tier {tier.tier}</h4>
                  {tier.tier === currentTier && (
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-medium">
                      Current
                    </span>
                  )}
                  {tier.tier < currentTier && (
                    <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-300 text-xs font-medium">
                      Completed
                    </span>
                  )}
                </div>

                <p className="text-white font-semibold mb-2">{tier.name}</p>
                <p className="text-gray-300 text-sm mb-4">{tier.description}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-400 text-xs font-semibold">Requirements:</p>
                  {tier.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-300 text-xs">{req}</p>
                    </div>
                  ))}
                </div>

                {tier.tier > currentTier && (
                  <button
                    onClick={() => {
                      setTargetTier(tier.tier);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    Upgrade to Tier {tier.tier}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-xl font-bold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Account Number</p>
              <p className="text-white font-mono font-semibold">{accountData.accountNumber}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Account Status</p>
              <p className="text-green-400 font-semibold">✓ Active</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Trust Score</p>
              <p className="text-white font-semibold">{(accountData.trustScore * 100).toFixed(0)}%</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Identity Type</p>
              <p className="text-white font-semibold">{accountData.user?.identityType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Upgrade to Tier {targetTier} - {KYC_TIERS.find(t => t.tier === targetTier)?.name}
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Tier 2 Requirements */}
              {targetTier === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Utility Bill <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange("utilityBill", e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                    {documents.utilityBill && (
                      <p className="text-green-400 text-xs mt-2">✓ {documents.utilityBill.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      ID Card <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange("idCard", e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                    {documents.idCard && (
                      <p className="text-green-400 text-xs mt-2">✓ {documents.idCard.name}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tier 3 Requirements */}
              {targetTier === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Proof of Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange("proofOfAddress", e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                    {documents.proofOfAddress && (
                      <p className="text-green-400 text-xs mt-2">✓ {documents.proofOfAddress.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Bank Statement <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange("bankStatement", e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                    {documents.bankStatement && (
                      <p className="text-green-400 text-xs mt-2">✓ {documents.bankStatement.name}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Your documents will be reviewed within 24-48 hours. You'll be notified once your tier upgrade is approved.
                </p>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isUploading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : `Submit Upgrade Request`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
