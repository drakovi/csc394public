import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const LoginRegister = ({ setUser, logoutMessage, setLogoutMessage }) => {
  const [formType, setFormType] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (logoutMessage) {
      setMessage(logoutMessage);
      setLogoutMessage('');
    }
  }, [logoutMessage, setLogoutMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formType === 'login' ? '/api/login' : '/api/register';
      const res = await axios.post(endpoint, { username, password });
      setMessage(res.data.message);
      if (formType === 'login') {
        setUser(res.data.username);
        navigate('/search');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="login-card">
      <h2>{formType === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {formType === 'login' ? 'Log In' : 'Register'}
        </button>
      </form>
      <p>
        {formType === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
        <button
          type="button"
          className="switch-link"
          onClick={() => setFormType(formType === 'login' ? 'register' : 'login')}
        >
          {formType === 'login' ? 'Register here' : 'Login here'}
        </button>
      </p>
      {message && (
        <p className={`message${message === 'Error occurred' ? ' error' : ''}`}>{message}</p>
      )}
    </div>
  );
};

export default LoginRegister;

