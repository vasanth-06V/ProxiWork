// client/src/router/index.jsx

import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* We will add more routes like /register here later */}
    </Routes>
  );
}