import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import '../styles/allUsers.css'
import axios from 'axios';

const AllUsers = () => {

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [newUser, setNewUser] = useState({ username: '', email: '', usertype: 'customer', password: '' });
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

  const addUser = async () => {
    try {
      await axios.post('http://localhost:6001/admin/users', newUser, { headers: { 'x-user-id': localStorage.getItem('userId') } });
      setNewUser({ username: '', email: '', usertype: 'customer', password: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to add user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and their bookings?')) return;
    try {
      await axios.delete(`http://localhost:6001/admin/users/${id}`, { headers: { 'x-user-id': localStorage.getItem('userId') } });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete user');
    }
  };

  const renderUser = (user) => (
    <tr key={user._id}>
      <td>{user._id}</td>
      <td>{editingId === user._id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Name" /> : user.username}</td>
      <td>{editingId === user._id ? <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} aria-label="Email" /> : user.email}</td>
      {isAdmin && <td className="table-actions">{editingId === user._id ? <>
        <button className="btn btn-primary" onClick={() => updateUser(user._id)}>Save</button>
        <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
      </> : <><button className="btn btn-primary" onClick={() => startEditing(user)}>Edit</button><button className="btn btn-danger" onClick={() => deleteUser(user._id)}>Delete</button></>}</td>}
    </tr>
  );

  return (
    <>
      <Navbar />

      <div className="all-users-page">
        <h2>All Users</h2>
        {isAdmin && <div className="admin-add-form">
          <input placeholder="Name" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <select value={newUser.usertype} onChange={(e) => setNewUser({ ...newUser, usertype: e.target.value })}>
            <option value="customer">Customer</option><option value="flight-operator">Operator</option>
          </select>
          <input type="password" placeholder="Temporary password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <button className="btn btn-primary" onClick={addUser}>Add user</button>
        </div>}
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User ID</th><th>Name</th><th>Email</th>{isAdmin && <th>Actions</th>}</tr></thead>
            <tbody>{users.filter(user=> user.usertype === 'customer').map(renderUser)}</tbody>
          </table>
        </div>


        <h2>Flight Operators</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User ID</th><th>Name</th><th>Email</th>{isAdmin && <th>Actions</th>}</tr></thead>
            <tbody>{users.filter(user=> user.usertype === 'flight-operator').map(renderUser)}</tbody>
          </table>
        </div>  

    </div>
    </>
  )
}

export default AllUsers