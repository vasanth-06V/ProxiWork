// client/src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ paddingTop: '80px' }}> {/* Add padding to prevent content from hiding behind the fixed navbar */}
        <AppRouter />
      </main>
    </BrowserRouter>
  );
}

export default App;
