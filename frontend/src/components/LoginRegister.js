import React, { useState } from 'react';
import axios from 'axios';
import './LoginRegister.css';

function LoginRegister({ setUser, logoutMessage, setLogoutMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';

    try {
      const res = await axios.post(endpoint, { username, password });
      setUser(res.data.username);
      setLogoutMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-bg">
      <div className="cyber-container">
        <h2 className="cyber-title">{mode === 'login' ? 'Login' : 'Register'}</h2>
        {logoutMessage && <p className="cyber-success">{logoutMessage}</p>}
        <form onSubmit={handleSubmit} className="cyber-form">
          <div className="cyber-input-group">
            <input
              type="text"
              placeholder="Username"
              className="cyber-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="cyber-input-group">
            <input
              type="password"
              placeholder="Password"
              className="cyber-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="cyber-btn" type="submit" disabled={loading}>
            {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
          </button>
          <div className="cyber-switch">
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="cyber-link">
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="cyber-link">
                  Login
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;