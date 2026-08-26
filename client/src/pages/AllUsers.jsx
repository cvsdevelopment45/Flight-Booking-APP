import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import '../styles/allUsers.css'
import axios from 'axios';

const AllUsers = () => {

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const isAdmin = localStorage.getItem('userType') === 'admin';

  useEffect(()=>{
    fetchUsers();
  },[]);

  const fetchUsers = async () =>{
    await axios.get('http://localhost:6001/fetch-users').then(
      (response) =>{
        setUsers(response.data);
      }
    )
  }

  const startEditing = (user) => {
    setEditingId(user._id);
    setEditName(user.username);
    setEditEmail(user.email);
  };

  const updateUser = async (id) => {
    try {
      await axios.put(`http://localhost:6001/update-user/${id}`, {
        username: editName,
        email: editEmail
      }, { headers: { 'x-user-id': localStorage.getItem('userId') } });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update user');
    }
  };

  const renderUser = (user) => (
    <div className="user" key={user._id}>
      {editingId === user._id ? <>
        <input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Name" />
        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} aria-label="Email" />
        <button className="btn btn-primary" onClick={() => updateUser(user._id)}>Save</button>
        <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
      </> : <>
        <p><b>Id </b>{user._id}</p>
        <p><b>Name </b>{user.username}</p>
        <p><b>Email </b>{user.email}</p>
        {isAdmin && <button className="btn btn-primary" onClick={() => startEditing(user)}>Edit</button>}
      </>}
    </div>
  );

  return (
    <>
      <Navbar />

      <div class="all-users-page">
        <h2>All Users</h2>
        <div class="all-users">

          {users.filter(user=> user.usertype === 'customer').map(renderUser)}
            
        </div>


        <h2>Flight Operators</h2>
        <div class="all-users">

          {users.filter(user=> user.usertype === 'flight-operator').map(renderUser)}
            
        </div>  

    </div>
    </>
  )
}

export default AllUsers