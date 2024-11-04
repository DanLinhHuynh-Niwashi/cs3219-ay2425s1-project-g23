import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Container, Row, Col } from 'react-bootstrap';
import ProfileField from '../components/ProfileField';
import profileImage from '../img/default_profile.jpg';
import SetUpProfile from '../components/SetUpProfile';

import './Profile.css'

function Profile() {
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';
  const navigate = useNavigate()
  const [profileExists, setProfileExists] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    gender: '',
    location: '',
    proficiency: '',
    linkedin: '',
    github: ''
  })
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cookie = document.cookie.split(';');
        const cookiesObject = cookie.reduce((acc, curr) => {
          const [key, value] = curr.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        const token = cookiesObject['token'] || '';
        const id = cookiesObject['user_id'] || '';
        if (token.length == 0 || id.length == 0) {
          throw new Error(`Did not retreive cookies invalid authentication`)
        }
        const response = await fetch(`${baseUrl}/users/${id}/user-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data.data);
          setProfileExists(true);
        } else if (response.status == 404) {
          setProfileExists(false);
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchProfile();
  }, [baseUrl]);
  return (
    <Card className="mb-4 mx-auto profile-container" >
      {profileExists ? (
      <Card.Body style={{ padding: '30px' }}>
        <Row className="mb-5">
          <Col md={3} className="d-flex justify-content-center">
            <img
              src={profileImage}
              alt="Profile"
              className="img-fluid rounded-circle"
              style={{ height: '100px', width: 'auto' }}
            />
          </Col>
          <Col md={7}>
            <Row>
              <Card.Title className="mb-4" style={{ color: '#4A4A4A', fontWeight: 'bold' }}>
                {profile.name.toUpperCase()}
              </Card.Title>
            </Row>
            <Row>
              <Card.Text className="mb-4" style={{ color: '#4A4A4A' }}>
                {profile.bio}
              </Card.Text>
            </Row>
          </Col>
          <Col md={2}>
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate('/editprofile')}
            >
              Edit
            </Button>
          </Col>
        </Row>
        <ProfileField fieldLeft="Gender:" fieldRight="Location:" valueLeft={profile.gender} valueRight={profile.location} />
        <ProfileField fieldLeft="Linkedin:" fieldRight="Proficiency:" valueLeft={profile.linkedin} valueRight={profile.proficiency} />
        <ProfileField fieldLeft="Github:" fieldRight="" valueLeft={profile.github} valueRight="" />
      </Card.Body> ) : <SetUpProfile/>}
    </Card>
  );
}

export default Profile