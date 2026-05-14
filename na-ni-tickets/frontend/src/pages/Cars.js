import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaCarSide, FaMapMarkerAlt, FaUsers, FaGasPump, FaCogs } from 'react-icons/fa';
import { IMAGE_FALLBACKS } from '../utils/imageFallbacks';

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const loadCars = async () => {
    try {
      setLoading(true);
      const res = await itemsAPI.getCars();
      setCars(res.data.cars || []);
    } catch (error) {
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const manufacturers = [...new Set(cars.map(c => c.manufacturer).filter(Boolean))].sort();

  const filteredCars = cars.filter(c => {
    const matchCompany = selectedCompany === 'All' || c.manufacturer === selectedCompany;
    const matchType = selectedType === 'All' || c.carType === selectedType;     
    return matchCompany && matchType;
  });

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',        
        color: 'white',
        padding: '50px 20px',
        textAlign: 'center',
        paddingBottom: '80px'
       }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <FaCarSide /> Professional Car Rentals
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Self-Drive & Hourly Rentals - Premium Ola Style Booking</p>
      </div>

      <div className="container" style={{ marginTop: '-40px', maxWidth: '1200px', margin: '-40px auto 0' }}>

        {/* Filters */}
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '30px',
            justifyContent: 'center',
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
          }}>
           <div style={{ flex: '2', minWidth: '250px' }}>
             <label style={{ display: 'block', fontSize: '12px', color: '#777', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Select Company</label>
             <select
               value={selectedCompany}
               onChange={e => setSelectedCompany(e.target.value)}
               style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fbfbfb' }}
             >
               <option value="All">All Companies</option>
               {manufacturers.map(m => (
                 <option key={m} value={m}>{m}</option>
               ))}
             </select>
           </div>

           <div style={{ flex: '1', minWidth: '150px' }}>
             <label style={{ display: 'block', fontSize: '12px', color: '#777', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Car Class</label>
             <select
               value={selectedType}
               onChange={e => setSelectedType(e.target.value)}
               style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fbfbfb' }}
             >
               <option value="All">All Types</option>
               <option value="Economy">Economy (Hatchbacks)</option>
               <option value="Comfort">Comfort (Sedans)</option>
               <option value="XL">XL (SUVs)</option>
               <option value="Premium">Premium (Luxury)</option>
             </select>
           </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', margin:'50px 0' }}><div className="spinner" style={{ margin: '0 auto 20px', borderColor: '#000', borderTopColor: 'transparent' }}></div><p>Finding cars...</p></div>
        ) : filteredCars.length ? (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filteredCars.map((car) => (
              <div key={car._id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', background: '#f5f5f5', backgroundImage: `url(${car.images && car.images.length ? car.images[0] : IMAGE_FALLBACKS.premiumCar})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                     {car.carType}
                   </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: '0 0 5px', fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>{car.manufacturer}</p>   
                      <h3 style={{ margin: '0 0 15px', color: '#222', fontSize: '18px' }}>{car.carModel}</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '13px', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUsers/> {car.seatingCapacity} Seats</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCogs/> {car.transmissionType}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaGasPump/> {car.fuelType}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt/> AC: {car.airconditioned ? 'Yes' : 'No'}</span>        
                  </div>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>Estimated Fare</p>
                       <h2 style={{ margin: 0, fontSize: '20px', color: '#000' }}>₹{car.pricePerKm} <span style={{ fontSize: '14px', color: '#999', fontWeight: 'normal' }}>/hr</span></h2>
                     </div>
                     <button
                       onClick={() => navigate(`/cars/${car._id}`)}
                       style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' }}
                       onMouseOver={e => e.target.style.background = '#333'}    
                       onMouseOut={e => e.target.style.background = '#000'}     
                     >
                       Select Vehicle
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#555' }}>No matching cars found</h2>
            <p style={{ color: '#888' }}>Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cars;
