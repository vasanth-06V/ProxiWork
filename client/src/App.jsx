// client/src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <AppRouter />
      </main>
    </BrowserRouter>
  );
}

export default App;