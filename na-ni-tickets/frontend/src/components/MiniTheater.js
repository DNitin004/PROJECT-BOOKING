import React, { useState, useEffect } from 'react'
import './MiniTheater.css'

export default function MiniTheater({ rows = 6, cols = 8, booked = [], price = 150, onConfirm }){
  const [selected, setSelected] = useState([])

  useEffect(()=>{
    setSelected([])
  }, [booked])

  function seatId(r,c){ return `${String.fromCharCode(65 + r)}${c+1}` }

  function toggleSeat(id){
    if(booked.includes(id)) return
    setSelected(s=> s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  }

  return (
    <div className="mini-theater">
      <div className="screen">SCREEN</div>
      <div className="seats-grid">
        {Array.from({length: rows}).map((_, r)=> (
          <React.Fragment key={r}>
            {Array.from({length: cols}).map((__, c)=>{
              const id = seatId(r,c)
              const isBooked = booked.includes(id)
              const isSelected = selected.includes(id)
              const cls = `seat ${isBooked? 'booked': isSelected? 'selected':''}`
              return (
                <div key={id} className={cls} onClick={()=>toggleSeat(id)}>{id}</div>
              )
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mini-theater-footer">
        <div>
          <strong>Selected:</strong> {selected.join(', ') || '—'}
          <div style={{fontSize:12, color:'#666'}}>Price per seat: ₹{price}</div>
        </div>
        <div>
          <button className="btn-confirm" onClick={()=> onConfirm && onConfirm(selected)} disabled={selected.length===0}>Confirm ({selected.length})</button>
        </div>
      </div>
    </div>
  )
}

