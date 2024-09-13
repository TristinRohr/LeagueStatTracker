import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import Search from './components/Search';
import UserStats from './components/UserStats';
import MatchHistory from './components/matchHistory';
import axios from 'axios';
import AboutDonation from './components/AboutDonation';
import './App.css';  // Importing the CSS file
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import FavoriteFeed from './components/FavoriteFeed'; // Combined component
import NavBar from './components/NavBar'; // NavBar component

const App = () => {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isHeader, setIsHeader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleSearch = (name, tag) => {
    setSummonerName(name);
    setTagLine(tag);
    setIsHeader(true);  // Trigger the animation when the search is performed
  };

  const handleLogout = async () => {
    try {
      await axios.post('/graphql', {
        query: `mutation logout { logout }`
      }, { withCredentials: true });

      setIsLoggedIn(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  return (
    <div>
      <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} handleSearch={handleSearch} isHeader={isHeader} />
        <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/match-history" /> : <LoginRegister />}
        />
        <Route
          path="/match-history"
          element={
            isLoggedIn && summonerName && tagLine ? (
              <div>
                <UserStats riotId={`${summonerName}#${tagLine}`} />
                <MatchHistory riotId={`${summonerName}#${tagLine}`} />
              </div>
            ) : (
              <Navigate to="/Search" />
            )
          }
        />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/" />} />
        <Route path="/favorite-feed" element={isLoggedIn ? <FavoriteFeed /> : <Navigate to="/" />} />
        <Route path="/about-donation" element={<AboutDonation />} />
      </Routes>
    </div>
  );
};

export default App;
