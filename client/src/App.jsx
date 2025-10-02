// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage'; // Import our new page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This tells the app: when the URL is /register, show the RegisterPage component */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;