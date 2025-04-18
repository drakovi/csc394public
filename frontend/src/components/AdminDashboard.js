import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Delete User</h3>
        <input type="text" value={deleteUsername} onChange={(e) => setDeleteUsername(e.target.value)} placeholder="Enter username" className="border p-2 mr-2" />
        <button onClick={handleDeleteUser} className="bg-red-500 text-white px-4 py-2 rounded">Delete User</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Add New Law</h3>
        <input type="text" placeholder="Title" value={newLaw.title} onChange={(e) => setNewLaw({ ...newLaw, title: e.target.value })} className="border p-2 block mb-2" />
        <textarea placeholder="Description" value={newLaw.description} onChange={(e) => setNewLaw({ ...newLaw, description: e.target.value })} className="border p-2 block mb-2"></textarea>
        <textarea placeholder="Citation" value={newLaw.citation} onChange={(e) => setNewLaw({ ...newLaw, citation: e.target.value })} className="border p-2 block mb-2"></textarea>
        <input type="text" placeholder="URL" value={newLaw.url} onChange={(e) => setNewLaw({ ...newLaw, url: e.target.value })} className="border p-2 block mb-2" />
        <select value={newLaw.category} onChange={(e) => setNewLaw({ ...newLaw, category: e.target.value })} className="border p-2 block mb-2">
          <option value="">Select Category</option>
          <option value="Compliance">Compliance</option>
          <option value="Data Privacy">Data Privacy</option>
          <option value="Cybercrime Consequences">Cybercrime Consequences</option>
        </select>
        <button onClick={handleAddLaw} className="bg-green-500 text-white px-4 py-2 rounded">Add Law</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Delete Law</h3>
        <input type="text" placeholder="Full Title" value={deleteLawTitle} onChange={(e) => setDeleteLawTitle(e.target.value)} className="border p-2 mr-2" />
        <button onClick={handleDeleteLaw} className="bg-red-500 text-white px-4 py-2 rounded">Delete Law</button>
      </div>

      <div>
        <h3 className="text-xl mb-2">Search Laws</h3>
        <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="border p-2 mr-2" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2">
          <option value="">All Categories</option>
          <option value="Compliance">Compliance</option>
          <option value="Data Privacy">Data Privacy</option>
          <option value="Cybercrime Consequences">Cybercrime Consequences</option>
        </select>
        <div className="mt-4">
          {laws.length === 0 ? (
            <p>No laws found.</p>
          ) : (
            laws.map((law) => (
              <div key={law.id} className="border p-4 mb-2 rounded">
                <h4 className="font-bold">{law.title}</h4>
                <p>{law.description}</p>
                <p><a href={law.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{law.url}</a></p>
                <p className="italic text-sm">{law.citation}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

