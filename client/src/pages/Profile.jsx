import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Authenticate.css';

const Profile = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const email = localStorage.getItem('email');
  const usertype = localStorage.getItem('userType');

  const changePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmation) return alert('New passwords do not match');
    try {
      await axios.put('http://localhost:6001/change-password', { currentPassword, newPassword }, { headers: { 'x-user-id': localStorage.getItem('userId') } });
      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to change password');
    }
  };

  const updateName = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put('http://localhost:6001/profile', { username }, { headers: { 'x-user-id': localStorage.getItem('userId') } });
      localStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      alert('Name updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update name');
    }
  };

  return <div className="profile-page">
    <section className="profile-card">
      <p className="profile-eyebrow">Account profile</p>
      <form className="profile-name-form" onSubmit={updateName}><input value={username} onChange={(event) => setUsername(event.target.value)} aria-label="Name" /><button className="btn btn-light" type="submit">Save name</button></form>
      <p className="profile-email">{email}</p>
      <span className="profile-role">{usertype}</span>
    </section>
    <form className="authForm profile-password-form" onSubmit={changePassword}>
      <h2>Change password</h2>
      <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /><label>Current password</label></div>
      <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="6" required /><label>New password</label></div>
      <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="Confirm password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength="6" required /><label>Confirm password</label></div>
      <button type="submit" className="btn btn-primary">Update password</button>
    </form>
  </div>;
};

export default Profile;
