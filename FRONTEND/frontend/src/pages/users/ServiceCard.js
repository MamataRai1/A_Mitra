import React from 'react';

export default function ServiceCard({ service }) {
  const cardStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    margin: '10px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    width: '250px'
  };

  const buttonStyle = {
    padding: '5px 10px',
    backgroundColor: '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <div style={cardStyle}>
      <h3>{service.name}</h3>
      <p>Provider: {service.provider}</p>
      <p>Price: ${service.price}</p>
      <button style={buttonStyle}>Book Now</button>
    </div>
  );
}
