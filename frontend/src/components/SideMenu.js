// src/components/SideMenu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Nav } from 'react-bootstrap';
import { FaUser, FaQuestion, FaSignOutAlt } from 'react-icons/fa';
import './SideMenu.css';
import { triggerModalOpen } from '../modalState'; 

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const SideMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="side-menu">
      <div className="app-name">
        <h4>PEERPREP</h4>
      </div>
      <Button className="start-session-button" onClick={triggerModalOpen}>
        Start Session
      </Button>
      <Nav className="flex-column">
        <Nav.Link className="menu-item" onClick={() => navigate('/profile')}>
          <FaUser className="icon" /> Profile
        </Nav.Link>
        <Nav.Link className="menu-item" onClick={() => navigate('/questions')}>
          <FaQuestion className="icon" /> Questions
        </Nav.Link>
        <Nav.Link className="menu-item" onClick={() => {
          navigate('/login');
          deleteCookie('token')
          deleteCookie('user_id')
        }}>
          <FaSignOutAlt className="icon" /> Logout
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default SideMenu;
