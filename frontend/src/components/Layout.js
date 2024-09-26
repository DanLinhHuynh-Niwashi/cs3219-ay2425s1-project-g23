import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';
import './Layout.css';

const Layout = () => {
  return (
    <Container fluid className="layout-container">
      <Row className="h-100">
        {/* SideMenu column */}
        <Col xs={2} className="side-menu-col">
          <SideMenu />
        </Col>

        {/* Main content column */}
        <Col xs={10} className="main-content-col">
          <div className="main-content">
            <Outlet /> {/* Render pages like Questions here */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
