import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { applyImageFallback, IMAGE_FALLBACKS } from '../utils/imageFallbacks';
import { FaTrain, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaExchangeAlt, FaHistory, FaClock, FaRoute, FaArrowRight } from 'react-icons/fa';

function Trains() {
  const navigate = useNavigate();
  const [allTrains, setAllTrains] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().slice(0, 10));
  const [stations, setStations] = useState([]);
  const [searchFromInput, setSearchFromInput] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [searchToInput, setSearchToInput] = useState('');
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [trainQuery, setTrainQuery] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('trainSearchHistory');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [trainsRes, stationsRes] = await Promise.all([
          itemsAPI.getTrains(),
          itemsAPI.getTrainStations()
        ]);
        setAllTrains(trainsRes.data.trains || []);
        setStations(stationsRes.data.stations || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load trains or stations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('.t-dropdown-wrapper')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (trainQuery && trainQuery.trim() !== '') {
      const q = trainQuery.trim().toLowerCase();
      const resultsByTrain = allTrains.filter((t) => {
        return (
          (t.trainNumber || '').toString().toLowerCase().includes(q) ||
          (t.trainName || '').toLowerCase().includes(q)
        );
      });

      try {
        const entry = { train: trainQuery.trim() };
        const next = [entry, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(entry))].slice(0,8);
        setHistory(next);
        localStorage.setItem('trainSearchHistory', JSON.stringify(next));       
      } catch (err) {}

      setSearchResults(resultsByTrain);
      setSearched(true);

      if (resultsByTrain.length > 0) {
        setFromStation(resultsByTrain[0].stationFrom || '');
        setToStation(resultsByTrain[0].stationTo || '');
        setSearchFromInput(resultsByTrain[0].stationFrom || '');
        setSearchToInput(resultsByTrain[0].stationTo || '');
      }

      if (resultsByTrain.length === 0) toast.info('No trains match the train number or name');
      return;
    }

    const fromInput = (fromStation || searchFromInput || '').trim();
    const toInput = (toStation || searchToInput || '').trim();

    if (!fromInput || !toInput) {
      toast.warn('Please select both departure and arrival stations');
      return;
    }

    if (fromInput.toLowerCase() === toInput.toLowerCase()) {
      toast.warn('Departure and arrival stations must be different');
      return;
    }

    const resolveStation = (input) => {
      const v = (input || '').trim();
      const low = v.toLowerCase();
      const exact = stations.find((s) => s.toLowerCase() === low);
      if (exact) return exact;
      const starts = stations.find((s) => s.toLowerCase().startsWith(low));     
      if (starts) return starts;
      const incl = stations.find((s) => s.toLowerCase().includes(low));
      if (incl) return incl;
      return v; 
    };

    const from = resolveStation(fromInput);
    const to = resolveStation(toInput);

    setFromStation(from);
    setToStation(to);
    setSearchFromInput(from);
    setSearchToInput(to);

    try {
      const entry = { from, to };
      const next = [entry, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(entry))].slice(0,8);
      setHistory(next);
      localStorage.setItem('trainSearchHistory', JSON.stringify(next));
    } catch (err) {}

    const extractCode = (str) => {
      const match = (str || '').match(/\((.*?)\)$/);
      return match ? match[1].toLowerCase().trim() : (str || '').toLowerCase().trim();
    };

    const fromCode = extractCode(fromInput);
    const toCode = extractCode(toInput);

    try {
      setLoading(true);
      const res = await itemsAPI.getTrains({ source: fromCode, destination: toCode });
      const results = res.data.trains || [];

      setSearchResults(results);
      setSearched(true);

      if (results.length === 0) {
        toast.info('No trains available for this route');
      }
    } catch (err) {
      toast.error("Failed to search trains");
      setSearchResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrain = (trainId) => {
    navigate(`/trains/${trainId}`, {
      state: { journeyDate, fromStation, toStation }
    });
  };

  const handleHistoryClick = (h) => {
    if (h.train) {
      setTrainQuery(h.train);
      const evt = { preventDefault: ()=>{} };
      handleSearch(evt);
      return;
    }
    if (h.from && h.to) {
      setSearchFromInput(h.from);
      setSearchToInput(h.to);
      setFromStation(h.from);
      setToStation(h.to);
      const evt = { preventDefault: ()=>{} };
      handleSearch(evt);
      return;
    }
  };

  const handleSwapStations = () => {
    const tempFrom = searchFromInput;
    const tempFromState = fromStation;
    setSearchFromInput(searchToInput);
    setFromStation(toStation);
    setSearchToInput(tempFrom);
    setToStation(tempFromState);
  };

  return (
    <div className="t-page-container">
      {/* Hero Banner */}
      <div className="t-hero">
        <div className="t-hero-overlay"></div>
        <div className="t-hero-content">
          <h1><FaTrain className="t-hero-icon" /> Book Your Next Journey</h1>
          <p>Seamlessly discover and book the fastest trains across the country.</p>
        </div>
      </div>

      <div className="t-main-content">
        <div className="t-search-wrapper">
          <form className="t-search-box" onSubmit={handleSearch}>
            {/* Route Inputs */}
            <div className="t-search-row">
              {/* FROM STATION */}
              <div className="t-input-group t-dropdown-wrapper">
                <label><FaMapMarkerAlt className="t-lbl-icon"/> From Station</label>
                <div className="t-input-box">
                  <input
                    type="text"
                    placeholder="Enter Departure City"
                    value={searchFromInput}
                    onChange={(e) => {
                      setSearchFromInput(e.target.value);
                      setShowFromDropdown(true);
                    }}
                    onFocus={() => setShowFromDropdown(true)}
                  />
                  {showFromDropdown && (
                    <div className="t-dropdown-menu">
                      {stations
                        .filter(s => s.toLowerCase().includes((searchFromInput || '').toLowerCase()))
                        .map(station => (
                          <div key={station} className="t-dropdown-item" onClick={() => {
                            setFromStation(station);
                            setSearchFromInput(station);
                            setShowFromDropdown(false);
                          }}>
                            <FaMapMarkerAlt className="t-drop-icon"/> {station}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div className="t-swap-wrapper">
                <button type="button" className="t-swap-btn" onClick={handleSwapStations} title="Swap Stations">
                  <FaExchangeAlt />
                </button>
              </div>

              {/* TO STATION */}
              <div className="t-input-group t-dropdown-wrapper">
                <label><FaMapMarkerAlt className="t-lbl-icon"/> To Station</label>
                <div className="t-input-box">
                  <input
                    type="text"
                    placeholder="Enter Arrival City"
                    value={searchToInput}
                    onChange={(e) => {
                      setSearchToInput(e.target.value);
                      setShowToDropdown(true);
                    }}
                    onFocus={() => setShowToDropdown(true)}
                  />
                  {showToDropdown && (
                    <div className="t-dropdown-menu">
                      {stations
                        .filter(s => s.toLowerCase().includes((searchToInput || '').toLowerCase()))
                        .map(station => (
                          <div key={station} className="t-dropdown-item" onClick={() => {
                            setToStation(station);
                            setSearchToInput(station);
                            setShowToDropdown(false);
                          }}>
                            <FaMapMarkerAlt className="t-drop-icon"/> {station}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DATE */}
              <div className="t-input-group">
                <label><FaCalendarAlt className="t-lbl-icon"/> Journey Date</label>
                <div className="t-input-box">
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <div className="t-input-group t-submit-group">
                <button type="submit" className="t-search-submit">
                  Search Trains
                </button>
              </div>
            </div>
            
            {/* Quick Search */}
            <div className="t-quick-search">
              <label><FaSearch /> Got a Train Name/No?</label>
              <div className="t-quick-input-group">
                <input
                  type="text"
                  placeholder="e.g. 12004 or Shatabdi Express"
                  value={trainQuery}
                  onChange={(e) => setTrainQuery(e.target.value)}
                />
                <button type="button" onClick={handleSearch}>Go <FaArrowRight/></button>
              </div>
            </div>
          </form>

          {/* Search History Pilles */}
          {history.length > 0 && (
            <div className="t-history-scroll">
              <div className="t-history-title"><FaHistory /> Recent:</div>
              <div className="t-history-list">
                {history.map((h, i) => (
                  <button key={i} className="t-history-pill" onClick={() => handleHistoryClick(h)}>
                    {h.train ? h.train : <>{h.from} <FaArrowRight className="t-pill-arr"/> {h.to}</>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="t-results-container">
          {loading ? (
            <div className="t-loading">
              <div className="t-spinner"></div>
              <p>Scanning Railway Networks...</p>
            </div>
          ) : searched ? (
            searchResults.length > 0 ? (
              <div className="t-results-header">
                <h3>{searchResults.length} Trains Found</h3>
                <p>From <strong>{(fromStation || searchFromInput).split('(')[0]}</strong> to <strong>{(toStation || searchToInput).split('(')[0]}</strong></p>
                <div className="t-train-cards">
                  {searchResults.map(train => (
                    <div key={train._id} className="t-ticket-card">
                      <div className="t-ticket-main">
                        <div className="t-ticket-top">
                          <h4 className="t-train-title">
                            {train.trainName} <span className="t-train-num">#{train.trainNumber}</span>
                          </h4>
                          <span className="t-days-badge"><FaCalendarAlt/> {(train.runningDays || []).join(', ') || 'Daily'}</span>
                        </div>
                        
                        <div className="t-ticket-route-box">
                          <div className="t-route-point">
                            <span className="t-r-time">{train.departureTime || '08:00 AM'}</span>
                            <span className="t-r-station">{train.stationFrom}</span>
                          </div>
                          
                          <div className="t-route-connector">
                            <span className="t-duration"><FaClock/> {train.duration || '06h 30m'}</span>
                            <div className="t-line-design">
                              <span className="t-dot"></span>
                              <hr className="t-line"/>
                              <FaTrain className="t-line-icon"/>
                              <hr className="t-line"/>
                              <span className="t-dot"></span>
                            </div>
                          </div>

                          <div className="t-route-point right">
                            <span className="t-r-time">{train.arrivalTime || '02:30 PM'}</span>
                            <span className="t-r-station">{train.stationTo}</span>
                          </div>
                        </div>

                        {train.coaches && train.coaches.length > 0 && (
                          <div className="t-coaches-list">
                              {train.coaches.map((c, i) => (
                                <span key={c.coachType || i} className="t-coach-badge">{c.coachType}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="t-ticket-action">
                        <div className="t-price-box">
                          <span className="t-price-label">Starts From</span>
                          <span className="t-price">â‚¹{train.routeFare || 450}</span>
                        </div>
                        <button className="t-book-btn" onClick={() => handleSelectTrain(train._id)}>
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="t-no-results">
                <FaRoute className="t-no-res-icon"/>
                <h3>No Trains Available</h3>
                <p>We couldn't find any direct trains between these stations.</p>
                <button className="t-reset-btn" onClick={() => {
                  setSearched(false);
                  setSearchFromInput('');
                  setSearchToInput('');
                }}>Search Again</button>
              </div>
            )
          ) : (
             <div className="t-empty-state">
                <img
                  src={IMAGE_FALLBACKS.train}
                  alt="Train"
                  className="t-empty-img"
                  onError={(event) => applyImageFallback(event, 'train')}
                />
                <h3>Where to?</h3>
                <p>Enter your departure and arrival stations to begin.</p>
             </div>
          )}
        </div>
      </div>

      <style>{`
        /* Professional Train Booking UI */
        .t-page-container {
          background: #f4f7f6;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          padding-bottom: 50px;
        }

        .t-hero {
          position: relative;
          height: 280px;
          background: url('https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
        }

        .t-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(26,41,128,0.9) 0%, rgba(38,208,206,0.85) 100%);
        }

        .t-hero-content {
          position: relative;
          z-index: 1;
        }

        .t-hero h1 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          letter-spacing: -0.5px;
        }

        .t-hero-content p {
          font-size: 18px;
          opacity: 0.9;
          font-weight: 400;
        }

        .t-main-content {
          max-width: 1100px;
          margin: -60px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .t-search-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.08);
          padding: 30px;
          margin-bottom: 40px;
        }

        .t-search-row {
          display: flex;
          align-items: flex-end;
          gap: 15px;
          flex-wrap: wrap;
        }

        .t-dropdown-wrapper {
          position: relative;
        }

        .t-input-group {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
        }

        .t-input-group label {
          font-size: 13px;
          font-weight: 700;
          color: #555;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .t-lbl-icon {
          color: #0b84ff;
          font-size: 14px;
        }

        .t-input-box input {
          width: 100%;
          padding: 15px 16px;
          border: 1px solid #dcdfe6;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          background: #fbfdff;
          transition: all 0.3s;
          box-sizing: border-box;
        }

        .t-input-box input:focus {
          border-color: #0b84ff;
          box-shadow: 0 0 0 4px rgba(11, 132, 255, 0.1);
          outline: none;
          background: white;
        }

        .t-dropdown-menu {
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          max-height: 250px;
          overflow-y: auto;
          z-index: 100;
          margin-top: 8px;
          border: 1px solid #eee;
        }

        .t-dropdown-item {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.2s;
        }
        .t-dropdown-item:last-child { border: none; }
        .t-dropdown-item:hover { background: #f0f7ff; color: #0b84ff; }
        .t-drop-icon { color: #a0a5aa; }
        .t-dropdown-item:hover .t-drop-icon { color: #0b84ff; }

        .t-swap-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 10px;
        }
        .t-swap-btn {
          background: white;
          border: 1px solid #dcdfe6;
          color: #0b84ff;
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: 0.3s;
        }
        .t-swap-btn:hover { background: #0b84ff; color: white; transform: rotate(180deg); }

        .t-submit-group {
          flex: 0 0 160px;
        }
        .t-search-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
          transition: 0.3s ease;
        }
        .t-search-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 107, 107, 0.4);
        }

        .t-quick-search {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #eee;
        }
        .t-quick-search label {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          display: flex; align-items: center; gap: 8px;
        }
        .t-quick-input-group {
          display: flex;
          flex: 1; max-width: 400px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #dcdfe6;
        }
        .t-quick-input-group input {
          flex: 1; padding: 12px; border: none; outline: none; font-size: 14px; font-weight: 500; background: #fbfdff;
        }
        .t-quick-input-group button {
          padding: 0 20px; background: #0b84ff; border: none; color: white; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;
        }
        .t-quick-input-group button:hover { background: #006ae6; }

        .t-history-scroll {
          display: flex; align-items: center; gap: 15px;
          margin-top: 20px;
          background: #f9fbfd; padding: 12px 15px; border-radius: 8px;
        }
        .t-history-title { font-size: 13px; font-weight: 600; color: #888; display: flex; align-items: center; gap: 6px; }
        .t-history-list { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px; }
        .t-history-list::-webkit-scrollbar { height: 4px; }
        .t-history-list::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .t-history-pill {
          background: white; border: 1px solid #e1e4e8; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #444; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: 0.2s;
        }
        .t-history-pill:hover { border-color: #0b84ff; color: #0b84ff; background: #f0f7ff; }

        .t-results-container {
          padding: 10px 0;
        }
        
        .t-loading, .t-empty-state, .t-no-results {
          text-align: center; padding: 60px 20px; background: white; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.04);
        }

        .t-spinner { width: 40px; height: 40px; border: 4px solid rgba(11, 132, 255, 0.2); border-top-color: #0b84ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .t-empty-state h3, .t-no-results h3 { font-size: 24px; color: #333; margin-bottom: 10px; }
        .t-empty-state p, .t-no-results p { font-size: 16px; color: #777; }
        .t-no-res-icon { font-size: 48px; color: #ffab00; margin-bottom: 20px; }
        
        .t-reset-btn {
          margin-top: 20px; padding: 12px 25px; background: #f0f2f5; border: 1px solid #ccc; border-radius: 8px; font-weight: 600; cursor: pointer; color: #444; transition: 0.2s;
        }
        .t-reset-btn:hover { background: #e4e7ea; }

        .t-results-header { margin-bottom: 20px; }
        .t-results-header h3 { font-size: 20px; color: #333; }
        .t-results-header p { font-size: 15px; color: #666; margin-top: 5px; }

        .t-train-cards { display: flex; flex-direction: column; gap: 20px; }
        .t-ticket-card {
          background: white; border-radius: 16px; display: flex; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.06); transition: 0.3s; position: relative;
        }
        .t-ticket-card:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(0,0,0,0.1); }
        
        .t-ticket-main { padding: 25px; flex: 1; border-right: 2px dashed #eee; position: relative; }
        .t-ticket-main::before, .t-ticket-main::after {
          content: ''; position: absolute; width: 20px; height: 20px; background: #f4f7f6; border-radius: 50%; right: -11px;
        }
        .t-ticket-main::before { top: -10px; }
        .t-ticket-main::after { bottom: -10px; }

        .t-ticket-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .t-train-title { font-size: 18px; font-weight: 800; color: #2c3e50; }
        .t-train-num { color: #8492a6; font-size: 14px; font-weight: 600; margin-left: 8px; }
        .t-days-badge { background: #eaf1fa; color: #507198; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px;}

        .t-ticket-route-box { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .t-route-point { flex: 1; }
        .t-route-point.right { text-align: right; }
        .t-r-time { display: block; font-size: 22px; font-weight: 800; color: #1a2980; }
        .t-r-station { display: block; font-size: 14px; font-weight: 600; color: #555; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

        .t-route-connector { flex: 1.5; text-align: center; padding: 0 20px; }
        .t-duration { font-size: 12px; font-weight: 700; color: #8bacd9; margin-bottom: 8px; display: inline-block; }
        .t-line-design { display: flex; align-items: center; justify-content: center; gap: 5px; }
        .t-dot { width: 8px; height: 8px; border: 2px solid #0b84ff; border-radius: 50%; background: white; }
        .t-line { flex: 1; height: 2px; border: none; background: #dcdfe6; margin: 0; }
        .t-line-icon { color: #0b84ff; font-size: 18px; }

        .t-coaches-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .t-coach-badge { background: #fdf2f2; color: #d64545; border: 1px solid #fad2d2; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }

        .t-ticket-action { padding: 25px; min-width: 220px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fafbfc; }
        .t-price-box { text-align: center; margin-bottom: 15px; }
        .t-price-label { display: block; font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
        .t-price { display: block; font-size: 28px; font-weight: 800; color: #2ecc71; margin-top: 5px; }
        
        .t-book-btn { width: 100%; padding: 14px 0; background: #0b84ff; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 12px rgba(11, 132, 255, 0.3); }
        .t-book-btn:hover { background: #006ae6; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(11, 132, 255, 0.4); }

        @media (max-width: 850px) {
          .t-ticket-card { flex-direction: column; }
          .t-ticket-main { border-right: none; border-bottom: 2px dashed #eee; }
          .t-ticket-main::before, .t-ticket-main::after { display: none; }
          .t-ticket-action { padding: 20px; flex-direction: row; justify-content: space-between; }
          .t-price-box { margin-bottom: 0; text-align: left; }
          .t-book-btn { width: auto; padding: 12px 30px; }
        }
        @media (max-width: 600px) {
          .t-search-row { flex-direction: column; }
          .t-input-group, .t-swap-wrapper, .t-submit-group { width: 100%; }
          .t-swap-btn { transform: rotate(90deg); }
          .t-swap-btn:hover { transform: rotate(270deg); }
          .t-quick-search { flex-direction: column; align-items: flex-start; }
          .t-quick-input-group { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Trains;
