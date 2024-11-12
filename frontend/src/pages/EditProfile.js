import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import './EditProfile.css';
import profileImage from '../img/default_profile.jpg';
import { fetchUserProfile, updateUserProfile} from '../models/userModel'

function EditProfile() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState({
        name: '',
        bio: '',
        gender: '',
        location: '',
        proficiency: '',
        linkedin: '',
        github: ''
    })
    const [profileExists, setProfileExists] = useState(false)
    const handleSubmit = async (event) => {
        try {
            event.preventDefault();
            const cookie = document.cookie.split(';');
            const cookiesObject = cookie.reduce((acc, curr) => {
                const [key, value] = curr.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});
            const id = cookiesObject['user_id'] || '';
        
            const response = await updateUserProfile(profileExists, id, profile);
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                navigate('/profile')
            } else {
                alert(data.message)
                throw new Error
                    (`Error updating profile: ${response.status} ${response.statusText} - ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }
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
                const response = await fetchUserProfile(id, token)
                const data = await response.json();
                if (response.ok) {
                    setProfile(data.data);
                    setProfileExists(true);
                    console.log(profile)
                } else if (response.status == 404) {
                    setProfileExists(false);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchProfile();
    }, []);
    return (
        <Container className='edit-profile-page'>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                    <Col md={3} className="d-flex justify-content-center align-items-center">
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="img-fluid rounded-circle"
                            style={{ height: '100px', width: 'auto' }}
                        />
                    </Col>
                    <Col md={9}>
                        <Row>
                            <Form.Group controlId="username">
                                <Form.Label>Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group controlId="bio">
                                <Form.Label>Bio <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Row>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col>
                        <Form.Group controlId="gender">
                            <Form.Label>Gender <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                required
                                value={profile.gender}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Others">Others</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="location">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col>
                        <Form.Group controlId="linkedin">
                            <Form.Label>Linkedin</Form.Label>
                            <Form.Control
                                type="text"
                                value={profile.linkedin}
                                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="proficiency">
                            <Form.Label>Proficiency <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={profile.proficiency}
                                required
                                onChange={(e) => setProfile({ ...profile, proficiency: e.target.value })}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group controlId="github">
                            <Form.Label>Github</Form.Label>
                            <Form.Control
                                type="text"
                                value={profile.github}
                                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex justify-content-center align-items-center">
                        <Button
                            type="submit"
                            variant="secondary"
                            className="me-2 custom-save"
                            onClick={() => navigate('/editprofile')}
                        >
                            Save
                        </Button>
                    </Col>
                    <Col md={3} className="d-flex justify-content-center align-items-center">
                        <Button
                            variant="secondary"
                            className="me-2 custom-cancel"
                            onClick={() => navigate('/profile')}
                        >
                            Cancel
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default EditProfile