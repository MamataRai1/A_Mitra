import React from 'react';
import ServiceCard from '../components/ServiceCard';

function Home() {
  const dummyServices = [
    { name: 'Evening Companion', provider: 'Alice', price: 50 },
    { name: 'Travel Companion', provider: 'Bob', price: 80 },
  ];

  return (
    <div>
      <h1>Available Companions</h1>
      <div style={{ display: 'flex' }}>
        {dummyServices.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
}

export default Home;
