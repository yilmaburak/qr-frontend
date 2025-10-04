import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Route, Routes } from 'react-router-dom';
import Providers from './context/Providers';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Providers>
    <App />
  </Providers>
);