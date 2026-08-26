import React, { useEffect, useState } from 'react'
import '../styles/Bookings.css'
import axios from 'axios';
import BookingTable from '../components/BookingTable';

const Bookings = () => {


  const [bookings, setBookings] = useState([]);

  const userId = localStorage.getItem('userId');

  useEffect(()=>{
    fetchBookings();
  }, [])

  const fetchBookings = async () =>{
    await axios.get('http://localhost:6001/fetch-bookings').then(
      (response)=>{
        setBookings(response.data.reverse());
      }
    )
  }
  const cancelTicket = async (id) =>{
    await axios.put(`http://localhost:6001/cancel-ticket/${id}`).then(
      (response)=>{
        alert("Ticket cancelled!!");
        fetchBookings();
      }
    )
  }

  return (
    <div className="user-bookingsPage">
      <h1>Bookings</h1>

      <BookingTable bookings={bookings.filter(booking=> booking.user === userId)} onCancel={cancelTicket} />
    </div>
  )
}

export default Bookings