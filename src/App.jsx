import { Routes, Route, Link } from 'react-router'
import Home from './pages/home.jsx'

function App() {
  return (
    <div className="p-6">
      <nav className="mb-4 flex gap-4">
        <Link to="/" className="text-blue-500 underline">Home</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
    </div>
  )
}

export default App