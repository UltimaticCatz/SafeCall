import './App.css'
import { useState } from 'react'
import TestSystem from './components/TestSystem'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './components/page/Home';
import CreateCall from './components/page/CreateCall';
import JoinCall from './components/page/JoinCall';
import TestRTC from './components/page/TestRTC';
import { RoomProvider } from './components/RoomContext';

function App() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <RoomProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} index />
          <Route path="/createCall" element={<CreateCall />} />
          <Route path="/joinCall" element={<JoinCall />} />
          <Route path="testRTC" element={<TestRTC />} />
          <Route path="testSystem" element={<TestSystem />} />
        </Routes>
      </BrowserRouter>
    </RoomProvider>
  )
}

export default App
