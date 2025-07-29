// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import ManagePage from './pages/ManagePage';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';

function App() {
  return (
      <Router>
        <Header />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<SearchPage />} />
            <Route
                path="/manage"
                element={
                    <PrivateRoute>
                        <ManagePage />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
  );
}

export default App;
