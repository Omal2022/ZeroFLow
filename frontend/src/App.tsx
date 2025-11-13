import './App.css'
import VerificationSelection from './components/VerificationSelection'

function App() {
  return (
    <div className="app">
      {/* Header with ZeroFlow Logo */}
      <header className="header">
        <h1 className="logo">ZeroFlow</h1>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <VerificationSelection />
      </main>
    </div>
  )
}

export default App
