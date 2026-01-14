import React, { StrictMode,useContext } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {AuthProvider} from '../components/Function/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
          <App />
      </Router>
    </AuthProvider>
  </StrictMode>
);
