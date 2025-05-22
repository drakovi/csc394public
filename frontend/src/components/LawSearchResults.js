import React, { useState, useEffect } from 'react';

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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search US Cybersecurity Laws</h1>

      {/* Search Bar + Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by keyword..."
          className="flex-1 border p-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Compliance">Compliance</option>
          <option value="Data Privacy">Data Privacy</option>
          <option value="Cybercrime Consequences">Cybercrime Consequences</option>
        </select>
	<button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div className="space-y-4">
        {laws.length === 0 ? (
          <p>No laws found.</p>
        ) : (
          laws.map((law) => (
            <div key={law.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{law.title}</h2>
              <p className="text-gray-700">{law.description}</p>
              <p className="text-sm mt-2"><strong>Category:</strong> {law.category}</p>
              <a href={law.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View Full Law
              </a>
              <div className="mt-3">
                <button
                  onClick={() => handleCopy(law.citation)}
                  className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
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
