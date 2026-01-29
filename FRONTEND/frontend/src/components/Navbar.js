import React from 'react';

// ---------------- Navbar ----------------
function Navbar() {
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#E6E6FA', // lavender
    color: '#4B0082',           // deep purple
    borderBottom: '2px solid #D8BFD8'
  };

  const ulStyle = {
    display: 'flex',
    listStyle: 'none',
    gap: '15px'
  };

  const liStyle = {
    cursor: 'pointer',
    fontWeight: 500
  };

  return (
    <nav style={navbarStyle}>
      <h2>Companion Rental</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>Home</li>
        <li style={liStyle}>Providers</li>
        <li style={liStyle}>Bookings</li>
        <li style={liStyle}>Profile</li>
      </ul>
    </nav>
  );
}

export default Navbar;
