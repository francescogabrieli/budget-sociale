import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import "./Auth.css";
import { BsPerson } from 'react-icons/bs';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('Username and password are required.');
      setShow(true);
      return;
    }
  
    const credentials = { username, password };
    props.login(credentials)
      .then(() => navigate("/"))
      .catch((err) => {
        if (err.message === "Unauthorized") {
          setErrorMessage("Username e/o password errati. Riprova.");
        }
        else
          setErrorMessage(err.message)
        setShow(true);
      });
  };
  

  const handleUtentiAnonimi = () => {
    navigate('/utenti/anonimi');
  }

  return (
    <Row className="mt-5 justify-content-center">
      <Col md={6}>
        <div className="login-card shadow-sm">
          <div className="card-body">
            <div className="user-icon-container">
              <BsPerson className="user-icon" />
            </div>
            <h1 className="text-center pb-3">Login</h1>
            <Form onSubmit={handleSubmit}>
              {show && <Alert variant="danger" onClose={() => setShow(false)} dismissible>{errorMessage}</Alert>}
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  placeholder="Enter your username"
                  onChange={(ev) => setUsername(ev.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="primary" size="lg" type="submit">
                  Login
                </Button>
                <Button variant="outline-info" size="lg" onClick={handleUtentiAnonimi}>
                  Visualizza Stato Processo
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

LoginForm.propTypes = {
  login: PropTypes.func,
}

function LogoutButton(props) {
  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

LogoutButton.propTypes = {
  logout: PropTypes.func
}

function LoginButton() {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={() => navigate('/login')}>Login</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };
