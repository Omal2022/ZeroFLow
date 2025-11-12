import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateAcc from "./pages/CreateAcc.tsx";
import Verification from "./pages/Verification.tsx";
import type { User } from "./types/register.ts";
import "./app.css";

const App = () => {
  const handleNext = (user: User) => {
    // TODO: implement navigation or logic after account creation
    console.log("User created:", user);
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CreateAcc onNext={handleNext} />} />
          <Route path="/verify" element={<Verification />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
