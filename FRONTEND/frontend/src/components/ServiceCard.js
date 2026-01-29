import React from 'react';

function ServiceCard({ service }) {
  const cardStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    margin: '10px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  };

  const buttonStyle = {
    padding: '5px 10px',
    backgroundColor: '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
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

export default ServiceCard;
