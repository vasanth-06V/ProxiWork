// client/src/App.jsx

import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router'; // Correctly points to router/index.jsx

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* A Navbar could go here later */}
        <AppRouter />
        {/* A Footer could go here later */}
      </div>
    </BrowserRouter>
  );
}

export default App;