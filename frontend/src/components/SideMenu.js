// src/components/SideMenu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Nav } from 'react-bootstrap';
import { FaUser, FaQuestion, FaSignOutAlt } from 'react-icons/fa';
import './SideMenu.css';

const SideMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="side-menu">
      <div className="app-name">
        <h4>PEERPREP</h4>
      </div>
      <Button className="start-session-button" onClick={() => alert('Start Session clicked!')}>
        Start Session
      </Button>
      <Nav className="flex-column">
        <Nav.Link className="menu-item" onClick={() => alert('Profile clicked!')}>
          <FaUser className="icon" /> Profile
        </Nav.Link>
        <Nav.Link className="menu-item" onClick={() => navigate('/questions')}>
          <FaQuestion className="icon" /> Questions
        </Nav.Link>
        <Nav.Link className="menu-item" onClick={() => alert('Logout clicked!')}>
          <FaSignOutAlt className="icon" /> Logout
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default SideMenu;
