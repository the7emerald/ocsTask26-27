import React from 'react';
import LogoutButton from '../../components/LogoutButton';

const AdminDashboard = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the Admin Dashboard.</p>
            <LogoutButton />
        </div>
    );
};

export default AdminDashboard;
