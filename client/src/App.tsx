// client/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the registration page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Temporary route for the home page */}
        <Route path="/" element={
          <div style={{ fontFamily: 'sans-serif', padding: '50px' }}>
            <h1>Welcome to ProxiWork</h1>
            <p>Go to <a href="/register">/register</a> to sign up.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;