import React, { StrictMode,useContext } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {AuthProvider} from '../components/Function/AuthProvider.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    grey: {
      200: "#eeeeee",
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
          <App />
      </Router>
    </AuthProvider>
  </StrictMode>
);
