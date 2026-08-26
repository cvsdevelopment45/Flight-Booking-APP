import React, { useState } from 'react';

const BookingTable = ({ bookings, onCancel, onModify, showContact = false }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const startEditing = (booking) => {
    setEditingId(booking._id);
    setEditValues({ journeyDate: booking.journeyDate?.slice(0, 10), journeyTime: booking.journeyTime, seatClass: booking.seatClass });
  };

  const updateValue = (field, value) => setEditValues({ ...editValues, [field]: value });

  return <div className="table-wrap">
    <table className="data-table booking-table">
      <thead>
        <tr>
          <th>Booking ID</th>
          {showContact && <th>Contact</th>}
          <th>Flight</th>
          <th>Route</th>
          <th>Journey</th>
          <th>Passengers</th>
          <th>Seats</th>
          <th>Total</th>
          <th>Status</th>
            <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking._id}>
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const journeyCompleted = booking.journeyDate && new Date(booking.journeyDate) < today;
              const canModify = onModify && booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && !journeyCompleted;
              return <>
            <td className="id-cell">{booking._id}</td>
            {showContact && <td>{booking.email}<br />{booking.mobile}</td>}
            <td><strong>{booking.flightId}</strong><br />{booking.flightName}</td>
            <td>{booking.departure} to {booking.destination}</td>
            <td>{editingId === booking._id ? <><input type="date" value={editValues.journeyDate} onChange={(e) => updateValue('journeyDate', e.target.value)} /><input type="time" value={editValues.journeyTime} onChange={(e) => updateValue('journeyTime', e.target.value)} /></> : <>{booking.journeyDate?.slice(0, 10)}<br />{booking.journeyTime}</>}</td>
            <td>{booking.passengers?.map((passenger) => `${passenger.name} (${passenger.age})`).join(', ')}</td>
            <td>{editingId === booking._id ? <select value={editValues.seatClass} onChange={(e) => updateValue('seatClass', e.target.value)}><option value="economy">Economy</option><option value="premium-economy">Premium economy</option><option value="business">Business</option><option value="first-class">First class</option></select> : booking.bookingStatus === 'confirmed' ? booking.seats : '-'}</td>
            <td>{booking.totalPrice}</td>
            <td><span className={`status status-${booking.bookingStatus}`}>{booking.bookingStatus}</span></td>
            <td className="table-actions">{canModify && editingId === booking._id && <><button className="btn btn-primary" onClick={() => { onModify(booking._id, editValues); setEditingId(null); }}>Save</button><button className="btn btn-secondary" onClick={() => setEditingId(null)}>Close</button></>}{canModify && editingId !== booking._id && <button className="btn btn-primary" onClick={() => startEditing(booking)}>Modify</button>}{booking.bookingStatus === 'confirmed' && <button className="btn btn-danger" onClick={() => onCancel(booking._id)}>Cancel</button>}</td>
              </>;
            })()}
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
};

export default BookingTable;
