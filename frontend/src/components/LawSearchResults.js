import React, { useState, useEffect } from 'react';
import './LawSearchResults.css';

const LawSearchResults = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [submittedFilter, setSubmittedFilter] = useState('');
  const [laws, setLaws] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(query);
    setSubmittedFilter(filter);
  };

  useEffect(() => {
    fetch(`/api/laws?query=${submittedQuery || ''}&filter=${submittedFilter || ''}`)
      .then(res => res.json())
      .then(data => setLaws(data))
      .catch(err => console.error('Error fetching laws:', err));
  }, [submittedQuery, submittedFilter]);

  const handleCopy = (citation) => {
    navigator.clipboard.writeText(citation).then(() => {
      alert('MLA Citation copied to clipboard!');
    });
  };

  return (
    <div className="law-search-results-container">
      <h1 className="law-search-header">Search US Cybersecurity Laws</h1>

      {/* Search Bar + Filter */}
      <form onSubmit={handleSearch} className="law-search-bar">
        <input
          type="text"
          placeholder="Search by keyword..."
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
        <button type="submit">
          Search
        </button>
      </form>

      {/* Results */}
      <div className="law-list">
        {laws.length === 0 ? (
          <p className="no-results">No laws found.</p>
        ) : (
          laws.map((law) => (
            <div key={law.id} className="law-card">
              <h4>{law.title}</h4>
              <p>{law.description}</p>
              <p><strong>Category:</strong> {law.category}</p>
              <a href={law.url} target="_blank" rel="noopener noreferrer">
                View Full Law
              </a>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={() => handleCopy(law.citation)}
                >
                  Copy MLA Citation
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LawSearchResults;