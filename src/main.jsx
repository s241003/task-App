import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import './index.css';     // Tailwind CSS読み込み


createRoot(document.getElementById('root')).render(
  <StrictMode className="bg-blue-500">
    <Router>
      <App />
    </Router>
  </StrictMode>
);
