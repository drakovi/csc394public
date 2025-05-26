import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LawSearchResults({ user, setUser, setLogoutMessage }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const resBookmarks = await axios.get(`/api/bookmarks/${user}`);
        const resHistory = await axios.get(`/api/search-history/${user}`);
        setBookmarks(resBookmarks.data || []);
        setHistory(resHistory.data || []);
      }
    };
    fetchData();
  }, [user]);

  const handleSearch = async () => {
    setLoading(true);
    setAiResults([]);
    setDbResults([]);

    try {
      const response = await axios.post('/api/combined-search', {
        query,
        username: user,
      });
      setAiResults(response.data.aiResults || []);
      setDbResults(response.data.dbResults || []);

      const resHistory = await axios.get(`/api/search-history/${user}`);
      setHistory(resHistory.data || []);
    } catch (err) {
      alert('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLogoutMessage('Successfully logged out');
  };

  const handleCopy = (citation) => {
    navigator.clipboard.writeText(citation).then(() => {
      alert('MLA Citation copied to clipboard!');
    });
  };

  const handleBookmark = async (citation) => {
    if (bookmarks.includes(citation)) return;
    if (bookmarks.length >= 5) {
      alert('You can only bookmark up to 5 citations.');
      return;
    }
    try {
      await axios.post('/api/bookmarks', { username: user, citation });
      const res = await axios.get(`/api/bookmarks/${user}`);
      setBookmarks(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save bookmark.');
    }
  };

  const handleRemoveBookmark = async (citation) => {
    try {
      await axios.delete('/api/bookmarks', {
        data: { username: user, citation },
      });
      const res = await axios.get(`/api/bookmarks/${user}`);
      setBookmarks(res.data || []);
    } catch (err) {
      alert('Failed to remove bookmark.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Search U.S. Cybersecurity Laws</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Ask a legal question..."
          className="w-full p-2 border rounded mb-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && (
        <p className="text-center text-xl mb-4">Loading results...</p>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: History */}
        <div className="lg:w-1/4 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Search History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No search history yet.</p>
          ) : (
            <ul className="list-disc list-inside text-sm">
              {history.map((item, i) => (
                <li key={i}>{item.query}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Center Column: Results */}
        <div className="lg:w-2/4">
          {aiResults.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">OpenAI Suggestions</h3>
              {aiResults.map((law, index) => (
                <div key={index} className="mb-5">
                  <h4 className="text-xl font-bold mb-1">{law.title}</h4>
                  <p>{law.description}</p>
                  <p className="mt-2">
                    <a
                      href={law.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Original document here
                    </a>
                  </p>
                  <button
                    onClick={() => handleCopy(law.citation)}
                    className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy MLA Citation
                  </button>
                  <button
                    onClick={() => handleBookmark(law.citation)}
                    className="mt-1 ml-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Bookmark Citation
                  </button>
                </div>
              ))}
            </div>
          )}

          {dbResults.length > 0 && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">
                Database Matches
              </h3>
              {dbResults.map((law) => (
                <div key={law.id} className="mb-5">
                  <h4 className="text-xl font-bold mb-1">{law.title}</h4>
                  <p>{law.description}</p>
                  <p className="mt-2">
                    <a
                      href={law.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Original document here
                    </a>
                  </p>
                  <button
                    onClick={() => handleCopy(law.citation)}
                    className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy MLA Citation
                  </button>
                  <button
                    onClick={() => handleBookmark(law.citation)}
                    className="mt-1 ml-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Bookmark Citation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Bookmarks */}
        <div className="lg:w-1/4 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">
            Bookmarks ({bookmarks.length}/5)
          </h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-gray-500">No bookmarks yet.</p>
          ) : (
            <ul className="list-disc list-inside text-sm">
              {bookmarks.map((b, i) => (
                <li key={i} className="mb-1">
                  {b}{' '}
                  <button
                    onClick={() => handleRemoveBookmark(b)}
                    className="text-red-600 ml-2 text-xs underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default LawSearchResults;

