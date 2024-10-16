import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Layout from './components/Layout';
import AppRoutes from './routes'; // Import the centralized routes
import Login from './pages/Login';
import Signup from './pages/Signup';
import 'bootstrap/dist/css/bootstrap.min.css'
import ProtectedRoutes from './utils/ProtectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        {/* All routes wrapped in Layout */}
        <Route element={<ProtectedRoutes/>}>
          <Route path="/*" element={<Layout />}>
            <Route path="*" element={<AppRoutes />} /> {/* Centralized routing under Layout */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
