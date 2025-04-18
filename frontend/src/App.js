import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import AdminDashboard from './components/AdminDashboard';
import LawSearchResults from './components/LawSearchResults';

function App() {
  const [user, setUser] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');

  return (
    <Router>
      <Routes>
	<Route
  	  path="/search"
  	  element={
    	    user === 'admin' ? (
      	      <Navigate to="/admin" />
    	    ) : user ? (
      	      <LawSearchResults user={user} setUser={setUser} setLogoutMessage={setLogoutMessage} />
    	    ) : (
      	      <Navigate to="/" />
    	    )
  	  }
	/>
	<Route
  	  path="/admin"
  	  element={
    	    user === 'admin' ? (
      	      <AdminDashboard user={user} setUser={setUser} setLogoutMessage={setLogoutMessage} />
    	    ) : (
      	      <Navigate to="/" />
    	    )
  	  }
	/>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/search" />
            ) : (
              <LoginRegister setUser={setUser} logoutMessage={logoutMessage} setLogoutMessage={setLogoutMessage} />
            )
          }
        />
        <Route
          path="/search"
          element={
            user ? (
              <LawSearchResults user={user} setUser={setUser} setLogoutMessage={setLogoutMessage} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

