import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TrainBookingStart() {
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [trainNumbers, setTrainNumbers] = useState([]);
  const [selectedTrainNo, setSelectedTrainNo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/items/trains/stations").then(res => setStations(res.data.stations || []));
  }, []);

  useEffect(() => {
    if (fromStation && toStation) {
      // Extract the code from "Name (CODE)" Format for search, or just pass as-is
      let source = fromStation;
      let dest = toStation;
      
      const sMatch = fromStation.match(/\((.*?)\)$/);
      const dMatch = toStation.match(/\((.*?)\)$/);
      
      if (sMatch) source = sMatch[1];
      if (dMatch) dest = dMatch[1];

      axios.get(`/api/items/trains?source=${source}&destination=${dest}`)
        .then(res => setTrainNumbers(res.data.trains || []));
    } else {
      setTrainNumbers([]);
    }
  }, [fromStation, toStation]);

  const handleProceed = () => {
    if (fromStation && toStation && selectedTrainNo) {
      navigate(`/train/book/${selectedTrainNo}`, {
        state: { fromStation, toStation }
      });
    }
  };

  return (
    <div className="booking-page">
      <h2>Train Ticket Booking</h2>
      <div>
        <label>From:</label>
        <input 
          list="stations-list" 
          value={fromStation} 
          onChange={e => setFromStation(e.target.value)} 
          placeholder="Start typing to search stations..." 
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      <div>
        <label>To:</label>
        <input 
          list="stations-list" 
          value={toStation} 
          onChange={e => setToStation(e.target.value)} 
          placeholder="Start typing to search stations..." 
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      
      <datalist id="stations-list">
        {stations.map(st => <option key={st} value={st} />)}
      </datalist>
      <div>
        <label>Train Number:</label>
        <select value={selectedTrainNo} onChange={e => setSelectedTrainNo(e.target.value)}>
          <option value="">Select</option>
          {trainNumbers.map(tn => <option key={tn.trainNumber} value={tn.trainNumber}>{tn.trainNumber} - {tn.trainName}</option>)}
        </select>
      </div>
      <button disabled={!fromStation || !toStation || !selectedTrainNo} onClick={handleProceed}>
        Proceed to Book Tickets
      </button>
    </div>
  );
}

export default TrainBookingStart;
