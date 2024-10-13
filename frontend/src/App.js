import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Layout from './components/Layout';
import AppRoutes from './routes'; // Import the centralized routes
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes wrapped in Layout */}
        <Route path="/*" element={<Layout />}>
          <Route path="*" element={<AppRoutes />} /> {/* Centralized routing under Layout */}
        </Route>
      </Routes>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
        <Route path='/profileEdit' element={<ProfileEdit/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
