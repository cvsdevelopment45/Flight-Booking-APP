import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Authenticate.css';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

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

  return <div className="AuthenticatePage"><form className="authForm" onSubmit={changePassword}>
    <h2>Change password</h2>
    <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /><label>Current password</label></div>
    <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="6" required /><label>New password</label></div>
    <div className="form-floating mb-3 authFormInputs"><input type="password" className="form-control" placeholder="Confirm password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength="6" required /><label>Confirm password</label></div>
    <button type="submit" className="btn btn-primary">Update password</button>
  </form></div>;
};

export default ChangePassword;