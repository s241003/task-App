import React, { StrictMode,useContext } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {AuthProvider} from '../components/Function/AuthProvider.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <App />
        </LocalizationProvider>
      </Router>
    </AuthProvider>
  </StrictMode>
);
