import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaCar } from 'react-icons/fa';
import api from '../services/api';

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const addDemoCars = async () => {
    try {
      const countToAdd = Math.max(0, 20 - cars.length);
      if (!countToAdd) return toast.info('Already has 20 or more cars');
      await api.post('/items/cars/seed', { count: countToAdd });
      toast.success(`${countToAdd} cars added`);
      loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add demo cars');
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaCar /> Car Booking</h1>
        <p>Ola/Uber style car selection and ride booking</p>
      </div>
      <div className="container">
        <div style={{ marginBottom: 16 }}>
          <button className="btn-secondary" onClick={addDemoCars}>Add Demo Cars Up To 20</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading cars...</p></div>
        ) : cars.length ? (
          <div className="list-cards">
            {cars.map((car) => (
              <div key={car._id} className="list-card">
                <h3>{car.carModel}</h3>
                <p>{car.carType} | Seats {car.seatingCapacity} | Rs {car.minimumFare} base fare</p>
                <button className="btn-primary" onClick={() => navigate(`/cars/${car._id}`)}>Book Ride</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"><p>No cars available</p></div>
        )}
      </div>
    </div>
  );
}

export default Cars;
