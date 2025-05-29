import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard({ user, setUser, setLogoutMessage }) {
  const [query, setQuery] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteUsername, setDeleteUsername] = useState('');
  const [changeUser, setChangeUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user !== 'admin') navigate('/search');
  }, [user, navigate]);

  const handleLogout = () => {
    setUser(null);
    setLogoutMessage('Successfully logged out');
    navigate('/');
  };

  const handleSearch = async () => {
    setLoading(true);
    setAiResults([]);
    setDbResults([]);

    try {
      const res = await axios.post('/api/combined-search', { query });
      setAiResults(res.data.aiResults || []);
      setDbResults(res.data.dbResults || []);
    } catch {
      alert('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (citation) => {
    navigator.clipboard.writeText(citation).then(() => {
      alert('MLA Citation copied to clipboard!');
    });
  };

  const handleDeleteUser = async () => {
    if (deleteUsername === 'admin') return alert("Can't delete admin.");
    try {
      await axios.delete(`/api/users/${deleteUsername}`);
      alert('User deleted successfully');
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) return alert('Passwords do not match.');
    try {
      await axios.put('/api/users/admin-change-password', {
        username: changeUser,
        newPassword: newPass,
      });
      alert('Password updated successfully');
    } catch {
      alert('Failed to update password');
    }
  };

  return (
    <div className="cyber-bg">
      <div className="cyber-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="cyber-title">Admin Dashboard</div>
          <button
            onClick={handleLogout}
            className="cyber-btn-red"
            style={{ width: 120, marginLeft: 12 }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="cyber-section-title">Delete User</div>
          <input
            type="text"
            placeholder="Username to delete"
            className="cyber-input"
            value={deleteUsername}
            onChange={(e) => setDeleteUsername(e.target.value)}
          />
          <button
            onClick={handleDeleteUser}
            className="cyber-btn-red"
          >
            Delete User
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="cyber-section-title">Change User Password</div>
          <input
            type="text"
            placeholder="Username"
            className="cyber-input"
            value={changeUser}
            onChange={(e) => setChangeUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            className="cyber-input"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="cyber-input"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <button
            onClick={handleChangePassword}
            className="cyber-btn"
          >
            Change Password
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="cyber-section-title">Search Laws</div>
          <input
            type="text"
            placeholder="Ask a legal question..."
            className="cyber-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="cyber-btn"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {loading && (
          <p className="cyber-loading">Loading results...</p>
        )}

        {aiResults.length > 0 && (
          <div className="cyber-results-panel">
            <div className="cyber-section-title">OpenAI Suggestions</div>
            {aiResults.map((law, index) => (
              <div key={index} style={{ marginBottom: '1.2rem' }}>
                <div className="cyber-law-title">{law.title}</div>
                <p style={{ color: '#b2fefa' }}>{law.description}</p>
                <p className="mt-2">
                  <a
                    href={law.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-law-link"
                  >
                    Original document here
                  </a>
                </p>
                <button
                  onClick={() => handleCopy(law.citation)}
                  className="cyber-citation-btn"
                >
                  Copy MLA Citation
                </button>
              </div>
            ))}
          </div>
        )}

        {dbResults.length > 0 && (
          <div className="cyber-results-panel">
            <div className="cyber-section-title">Database Matches</div>
            {dbResults.map((law) => (
              <div key={law.id} style={{ marginBottom: '1.2rem' }}>
                <div className="cyber-law-title">{law.title}</div>
                <p style={{ color: '#b2fefa' }}>{law.description}</p>
                <p className="mt-2">
                  <a
                    href={law.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-law-link"
                  >
                    Original document here
                  </a>
                </p>
                <button
                  onClick={() => handleCopy(law.citation)}
                  className="cyber-citation-btn"
                >
                  Copy MLA Citation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;