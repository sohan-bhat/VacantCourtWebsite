import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <h1>Court Availability</h1>
        <nav className="main-nav">
          <Link to="/">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;