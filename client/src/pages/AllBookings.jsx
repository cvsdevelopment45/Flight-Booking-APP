import axios from 'axios';
import React, { useEffect, useState } from 'react'
import '../styles/Bookings.css';
import BookingTable from '../components/BookingTable';
import { notify } from '../utils/notify';

const AllBookings = () => {

  const [bookings, setBookings] = useState([]);

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
        notify("Ticket cancelled!!", 'success');
        fetchBookings();
      }
    )
  }

  const modifyBooking = async (id, values) => {
    try {
      await axios.put(`http://localhost:6001/admin/bookings/${id}`, values);
      fetchBookings();
    } catch (error) {
      notify(error.response?.data?.message || 'Unable to modify booking', 'error');
    }
  }

  return (
    <div className="user-bookingsPage">
      <h1>Bookings</h1>

      <BookingTable bookings={bookings} onCancel={cancelTicket} onModify={modifyBooking} showContact />
    </div>
  )
}

export default AllBookings