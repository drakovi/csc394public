import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded mb-6">Logout</button>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Delete User</h3>
        <input
          type="text"
          placeholder="Username to delete"
          className="w-full mb-2"
          value={deleteUsername}
          onChange={(e) => setDeleteUsername(e.target.value)}
        />
        <button onClick={handleDeleteUser} className="bg-red-500 text-white w-full">Delete User</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Change User Password</h3>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-2"
          value={changeUser}
          onChange={(e) => setChangeUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="New password"
          className="w-full mb-2"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full mb-2"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />
        <button onClick={handleChangePassword} className="bg-blue-600 text-white w-full">Change Password</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Search Laws</h3>
        <input
          type="text"
          placeholder="Ask a legal question..."
          className="w-full mb-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading} className={`w-full py-2 ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && <p className="text-center text-xl mb-4">Loading results...</p>}

      {aiResults.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">OpenAI Suggestions</h3>
          {aiResults.map((law, index) => (
            <div key={index} className="mb-5">
              <h4 className="text-xl font-bold mb-1">{law.title}</h4>
              <p>{law.description}</p>
              <p className="mt-2">
                <a href={law.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Original document here
                </a>
              </p>
              <button
                onClick={() => handleCopy(law.citation)}
                className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Copy MLA Citation
              </button>
            </div>
          ))}
        </div>
      )}

      {dbResults.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Database Matches</h3>
          {dbResults.map((law) => (
            <div key={law.id} className="mb-5">
              <h4 className="text-xl font-bold mb-1">{law.title}</h4>
              <p>{law.description}</p>
              <p className="mt-2">
                <a href={law.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Original document here
                </a>
              </p>
              <button
                onClick={() => handleCopy(law.citation)}
                className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Copy MLA Citation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

