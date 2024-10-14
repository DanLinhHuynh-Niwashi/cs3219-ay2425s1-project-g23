import React from 'react'
import { Button, Card, Badge, Container, Row, Col } from 'react-bootstrap';
import ProfileField from '../components/ProfileField';
import profileImage from '../img/default_profile.jpg';

function Profile() {
  return (
      <Container className='profile-container' style={{ marginTop: '20px' }}>
        <Card className="mb-4 mx-auto" style={{ width:'60%', borderColor: '#D6BCFA', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'}}>
          <Card.Body style={{ padding: '30px'}}>
            <Row className="mb-4">
              <Col md={3} className="d-flex justify-content-center">
                <img
                src={profileImage}  
                alt="Profile"
                className="img-fluid rounded-circle" 
                style={{ height: '100px', width: 'auto' }} 
                />
              </Col>
              <Col md={9}>
                <Row>
                  <Card.Title className="mb-4" style={{ color: '#4A4A4A', fontWeight: 'bold' }}>
                    SONG IVAN
                  </Card.Title>
                </Row>
                <Row>
                  <Card.Text className="mb-4" style={{ color: '#4A4A4A' }}>
                    BIO
                  </Card.Text>
                </Row>
              </Col>
            </Row>
            <ProfileField fieldLeft="Email:" fieldRight="Github:" valueLeft="" valueRight=""/>
            <ProfileField fieldLeft="Location:" fieldRight="Proficiency:" valueLeft="" valueRight=""/>
            <ProfileField fieldLeft="Specialisation:" fieldRight="Preferred Language:" valueLeft="" valueRight=""/>
            <ProfileField fieldLeft="Linkedin:" fieldRight="Skill Rating:" valueLeft="" valueRight=""/>
          </Card.Body>
        </Card>
      </Container>
  );
}

export default Profile