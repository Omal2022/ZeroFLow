import CreateAcc  from "./pages/CreateAcc.tsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./app.css";
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CreateAcc />} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;
