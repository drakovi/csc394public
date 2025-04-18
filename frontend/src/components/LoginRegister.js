import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="p-4 border rounded max-w-md mx-auto mt-10 shadow">
      <h2 className="text-xl font-bold mb-4">{formType === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {formType === 'login' ? 'Log In' : 'Register'}
        </button>
      </form>
      <p className="mt-3 text-sm text-center">
        {formType === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
        <button onClick={() => setFormType(formType === 'login' ? 'register' : 'login')} className="text-blue-500 underline">
          {formType === 'login' ? 'Register here' : 'Login here'}
        </button>
      </p>
      {message && <p className="mt-2 text-green-600 text-center">{message}</p>}
    </div>
  );
};

export default LoginRegister;

