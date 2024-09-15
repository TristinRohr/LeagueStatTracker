import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';  // Importing the CSS file
import NavBar from './components/NavBar';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import FavoriteFeed from './components/FavoriteList';
import LandingSearch from './components/LandingSearch';
import MatchHistoryWrapper from './components/MatchHistoryWrapper';
import AboutDonation1 from './components/AboutDonation';

const App = () => {
  const [summonerName, setSummonerName] = useState(localStorage.getItem('summonerName') || '');  // Load from localStorage initially
  const [tagLine, setTagLine] = useState(localStorage.getItem('tagLine') || '');  // Load from localStorage initially
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isHeader, setIsHeader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const searchHandler = (gameName, tag) => {
    const summoner = `${gameName}#${tag}`;
  
    // Load and update the recently searched summoners in localStorage
    let recentSearches = JSON.parse(localStorage.getItem('recentSummoners')) || [];
    recentSearches = [summoner, ...recentSearches.filter(s => s !== summoner)].slice(0, 5);
    localStorage.setItem('recentSummoners', JSON.stringify(recentSearches));
  
    // Continue with the search
    setSummonerName(gameName);
    setTagLine(tag);
    localStorage.setItem('summonerName', gameName);
    localStorage.setItem('tagLine', tag);
    setIsHeader(true);
    navigate(`/match-history/${gameName}/${tag}`);
  };
  

  const handleLogout = async () => {
    try {
      await axios.post('/graphql', {
        query: `mutation logout { logout }`
      }, { withCredentials: true });

      // Clear stored data upon logout
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      localStorage.removeItem('summonerName');
      localStorage.removeItem('tagLine');
      navigate('/');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  return (
    <div>
      <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} handleSearch={searchHandler} isHeader={isHeader} />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingSearch onSearch={searchHandler} />} />
        <Route path="/LandingSearch" element={<LandingSearch onSearch={searchHandler} />} />

        {/* Match History */}
        <Route
          path="/match-history/:summonerName/:tagLine"
          element={<MatchHistoryWrapper summonerName={summonerName} tagLine={tagLine} />}
        />

        {/* Profile Route (protected) */}
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Favorite Feed Route (protected) */}
        <Route
          path="/favorite-feed"
          element={isLoggedIn ? <FavoriteFeed /> : <Navigate to="/login" />}
        />

        {/* Login/Register */}
        <Route
          path="/login"
          element={<LoginRegister />}
        />

        {/* Catch-all: Redirect to LandingSearch if no route matches */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/about" element={<AboutDonation1 />} />
      </Routes>
    </div>
  );
};

export default App;