import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LawSearchResults.css';

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
    <div className="law-bg">
      <div className="law-container">
        <div className="law-header">
          <h2 className="law-title">Search U.S. Cybersecurity Laws</h2>
          <button
            onClick={handleLogout}
            className="law-logout-btn"
          >
            Logout
          </button>
        </div>

        <div className="law-search-box">
          <input
            type="text"
            placeholder="Ask a legal question..."
            className="law-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="law-search-btn"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {loading && (
          <p className="law-loading">Loading results...</p>
        )}

        <div className="law-columns">
          {/* Left Column: History */}
          <div className="law-panel" style={{ flex: 1 }}>
            <h3>Search History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No search history yet.</p>
            ) : (
              <ul>
                {history.map((item, i) => (
                  <li key={i}>{item.query}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Center Column: Results */}
          <div className="law-panel" style={{ flex: 2 }}>
            {aiResults.length > 0 && (
              <div className="mb-6">
                <h3>OpenAI Suggestions</h3>
                {aiResults.map((law, index) => (
                  <div key={index} className="mb-5">
                    <h4 className="law-result-title">{law.title}</h4>
                    <p>{law.description}</p>
                    <p className="mt-2">
                      <a
                        href={law.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="law-result-link"
                      >
                        Original document here
                      </a>
                    </p>
                    <button
                      onClick={() => handleCopy(law.citation)}
                      className="law-btn law-btn-copy"
                    >
                      Copy MLA Citation
                    </button>
                    <button
                      onClick={() => handleBookmark(law.citation)}
                      className="law-btn law-btn-bookmark"
                    >
                      Bookmark Citation
                    </button>
                  </div>
                ))}
              </div>
            )}

            {dbResults.length > 0 && (
              <div>
                <h3>Database Matches</h3>
                {dbResults.map((law) => (
                  <div key={law.id} className="mb-5">
                    <h4 className="law-result-title">{law.title}</h4>
                    <p>{law.description}</p>
                    <p className="mt-2">
                      <a
                        href={law.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="law-result-link"
                      >
                        Original document here
                      </a>
                    </p>
                    <button
                      onClick={() => handleCopy(law.citation)}
                      className="law-btn law-btn-copy"
                    >
                      Copy MLA Citation
                    </button>
                    <button
                      onClick={() => handleBookmark(law.citation)}
                      className="law-btn law-btn-bookmark"
                    >
                      Bookmark Citation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="law-panel" style={{ flex: 1 }}>
            <h3>
              Bookmarks ({bookmarks.length}/5)
            </h3>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-gray-500">No bookmarks yet.</p>
            ) : (
              <ul>
                {bookmarks.map((b, i) => (
                  <li key={i} className="mb-1">
                    {b}{' '}
                    <button
                      onClick={() => handleRemoveBookmark(b)}
                      className="law-btn-remove"
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
    </div>
  );
}

export default LawSearchResults;