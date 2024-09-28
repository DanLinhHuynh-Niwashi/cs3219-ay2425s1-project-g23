import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Layout from './components/Layout';
import AppRoutes from './routes'; // Import the centralized routes

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes wrapped in Layout */}
        <Route path="/*" element={<Layout />}>
          <Route path="*" element={<AppRoutes />} /> {/* Centralized routing under Layout */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
