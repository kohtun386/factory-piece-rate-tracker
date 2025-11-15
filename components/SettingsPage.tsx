import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { inviteSupervisor, isInviting, inviteError } = useAuth();
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supervisorEmail) {
      setSuccessMessage(''); // Clear previous messages
      return;
    }

    setSuccessMessage('');
    try {
      await inviteSupervisor(supervisorEmail);
      setSuccessMessage(`Invitation sent successfully to ${supervisorEmail}!`);
      setSupervisorEmail(''); // Clear input on success
    } catch (error) {
      // Error is already handled and stored in `inviteError` by the context
      console.error(error);
    }
  };

  // Clear messages when the user starts typing again
  useEffect(() => {
    if (supervisorEmail) {
      setSuccessMessage('');
    }
  }, [supervisorEmail]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl mb-4">Invite a Supervisor</h2>
        <form onSubmit={handleInvite}>
          <div className="mb-4">
            <label htmlFor="supervisorEmail" className="block text-gray-700 text-sm font-bold mb-2">
              Supervisor Email
            </label>
            <input
              id="supervisorEmail"
              type="email"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="supervisor@example.com"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isInviting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {isInviting ? 'Sending...' : 'Invite Supervisor'}
            </button>
          </div>
        </form>
        {inviteError && (
          <p className="mt-4 text-sm text-red-500">
            Error: {inviteError}
          </p>
        )}
        {successMessage && (
          <p className="mt-4 text-sm text-green-500">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
