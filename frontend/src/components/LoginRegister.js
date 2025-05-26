import React, { useState } from 'react';
import axios from 'axios';

function LoginRegister({ setUser, logoutMessage, setLogoutMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';

    try {
      const res = await axios.post(endpoint, { username, password });
      setUser(res.data.username);
      setLogoutMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold text-center mb-4">{mode === 'login' ? 'Login' : 'Register'}</h2>
      {logoutMessage && <p className="text-green-600 text-center mb-4">{logoutMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white w-full py-2 mb-2" type="submit">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
        <p className="text-center">
          {mode === 'login' ? (
            <span>Don't have an account? <button type="button" onClick={() => setMode('register')} className="text-blue-600 underline bg-transparent border-none">Register</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-blue-600 underline bg-transparent border-none">Login</button></span>
          )}
        </p>
      </form>
    </div>
  );
}

export default LoginRegister;

