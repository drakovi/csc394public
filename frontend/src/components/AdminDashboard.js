import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard({ user, setUser, setLogoutMessage }) {
  const [deleteUsername, setDeleteUsername] = useState('');
  const [newLaw, setNewLaw] = useState({ title: '', description: '', citation: '', url: '', category: '' });
  const [deleteLawTitle, setDeleteLawTitle] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [laws, setLaws] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== 'admin') navigate('/search');
  }, [user, navigate]);

  const handleLogout = () => {
    setUser(null);
    setLogoutMessage('Successfully logged out');
    navigate('/');
  };

  const handleDeleteUser = async () => {
    if (deleteUsername === 'admin') {
      alert("Cannot delete the default admin user.");
      return;
    }
    try {
      await axios.delete(`/api/users/${deleteUsername}`);
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleAddLaw = async () => {
    try {
      await axios.post('/api/laws', newLaw);
      alert('Law added successfully');
      setNewLaw({ title: '', description: '', citation: '', url: '', category: '' });
    } catch (err) {
      alert('Failed to add law');
    }
  };

  const handleDeleteLaw = async () => {
    try {
      await axios.delete(`/api/laws/title/${encodeURIComponent(deleteLawTitle)}`);
      alert('Law deleted successfully');
    } catch (err) {
      alert('Failed to delete law');
    }
  };

  const fetchLaws = useCallback(async () => {
    try {
      const response = await axios.get(`/api/laws?query=${query}&filter=${filter}`);
      setLaws(response.data);
    } catch (err) {
      alert('Failed to fetch laws');
    }
  }, [query, filter]);

  useEffect(() => {
    fetchLaws();
  }, [fetchLaws]);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="admin-dashboard-logout">
          Logout
        </button>
      </div>

      <div className="admin-section">
        <h3>Delete User</h3>
        <input
          type="text"
          value={deleteUsername}
          onChange={(e) => setDeleteUsername(e.target.value)}
          placeholder="Enter username"
        />
        <button onClick={handleDeleteUser}>Delete User</button>
      </div>

      <div className="admin-section">
        <h3>Add New Law</h3>
        <input
          type="text"
          placeholder="Title"
          value={newLaw.title}
          onChange={(e) => setNewLaw({ ...newLaw, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newLaw.description}
          onChange={(e) => setNewLaw({ ...newLaw, description: e.target.value })}
        ></textarea>
        <textarea
          placeholder="Citation"
          value={newLaw.citation}
          onChange={(e) => setNewLaw({ ...newLaw, citation: e.target.value })}
        ></textarea>
        <input
          type="text"
          placeholder="URL"
          value={newLaw.url}
          onChange={(e) => setNewLaw({ ...newLaw, url: e.target.value })}
        />
        <select
          value={newLaw.category}
          onChange={(e) => setNewLaw({ ...newLaw, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="Compliance">Compliance</option>
          <option value="Data Privacy">Data Privacy</option>
          <option value="Cybercrime Consequences">Cybercrime Consequences</option>
        </select>
        <button onClick={handleAddLaw}>Add Law</button>
      </div>

      <div className="admin-section">
        <h3>Delete Law</h3>
        <input
          type="text"
          placeholder="Full Title"
          value={deleteLawTitle}
          onChange={(e) => setDeleteLawTitle(e.target.value)}
        />
        <button onClick={handleDeleteLaw}>Delete Law</button>
      </div>

      <div className="admin-section">
        <h3>Search Laws</h3>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Compliance">Compliance</option>
          <option value="Data Privacy">Data Privacy</option>
          <option value="Cybercrime Consequences">Cybercrime Consequences</option>
        </select>
        <div className="law-list">
          {laws.length === 0 ? (
            <p>No laws found.</p>
          ) : (
            laws.map((law) => (
              <div key={law.id} className="law-card">
                <h4>{law.title}</h4>
                <p>{law.description}</p>
                <p>
                  <a href={law.url} target="_blank" rel="noopener noreferrer">
                    {law.url}
                  </a>
                </p>
                <p className="italic">{law.citation}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;