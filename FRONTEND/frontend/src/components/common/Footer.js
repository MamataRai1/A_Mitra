import React from 'react';

export default function Footer() {
  const footerStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#E6E6FA',
    color: '#4B0082',
    marginTop: '20px'
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; 2026 Companion Rental. All rights reserved.</p>
    </footer>
  );
}
