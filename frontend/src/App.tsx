import CreateAcc  from "./pages/CreateAcc.tsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./app.css";
import Verification from "./pages/Verification.tsx";
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CreateAcc />} />
          <Route path="verify" element={<Verification/>} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;
