import './App.css'
import { useState } from 'react'
import TestSystem from './components/TestSystem'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './components/page/Home';
import CreateCall from './components/page/CreateCall';
import JoinCall from './components/page/JoinCall';

function App() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} index />
        <Route path="/createCall" element={<CreateCall />} />
        <Route path="/joinCall" element={<JoinCall />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
