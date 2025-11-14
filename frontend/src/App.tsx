import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./pages/Welcome.tsx";
import TokenVerification from "./pages/TokenVerification.tsx";
import IdentityInput from "./pages/IdentityInput.tsx";
import LoadingVerification from "./pages/LoadingVerification.tsx";
import AutoFillForm from "./pages/AutoFillForm.tsx";
import FaceVerificationWrapper from "./pages/FaceVerificationWrapper.tsx";
import AccountSuccess from "./pages/AccountSuccess.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Settings from "./pages/Settings.tsx";
import CreateAcc from "./pages/CreateAcc.tsx";
import Verification from "./pages/Verification.tsx";
import { useNavigate } from "react-router-dom";

// Token Verification Wrapper to handle navigation (after form)
function TokenVerificationPage() {
  const navigate = useNavigate();

  return (
    <TokenVerification
      onVerified={(type, contact) => {
        // Store verification info in sessionStorage
        sessionStorage.setItem('verifiedContact', contact);
        sessionStorage.setItem('verificationType', type);
        navigate('/face-verification');
      }}
    />
  );
}

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* New KYC Flow */}
          <Route path="/" element={<Welcome />} />
          <Route path="/identity" element={<IdentityInput />} />
          <Route path="/loading" element={<LoadingVerification />} />
          <Route path="/form" element={<AutoFillForm />} />
          <Route path="/verify-contact" element={<TokenVerificationPage />} />
          <Route path="/face-verification" element={<FaceVerificationWrapper />} />
          <Route path="/success" element={<AccountSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Legacy Routes */}
          <Route path="/old" element={<CreateAcc />} />
          <Route path="/verify" element={<Verification />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
