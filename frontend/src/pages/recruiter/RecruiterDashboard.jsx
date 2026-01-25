import React, { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';

const RecruiterDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCompany, setNewCompany] = useState('');
    const [newDesignation, setNewDesignation] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profiles/recruiter-data', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setApplications(data);

        } catch (error) {
            console.error('Error in recruiter dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (profileCode, entryNumber, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/application/recruiter-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileCode, entryNumber, status })
            });

            if (!response.ok) throw new Error('Failed to update status');
            fetchData();

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        if (!newCompany || !newDesignation) {
            alert('Please enter both company name and designation');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profiles/create-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyName: newCompany, designation: newDesignation })
            });

            if (!response.ok) throw new Error('Failed to create profile');
            setNewCompany('');
            setNewDesignation('');
            alert('Profile created successfully!');
            fetchData();

        } catch (error) {
            console.error('Error creating profile:', error);
            alert('Failed to create profile');
        }
    };

    const handleDeleteProfile = async (profileCode) => {
        if (!window.confirm('Are you sure you want to delete this profile? All applications will also be deleted.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profiles/delete-profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileCode })
            });

            if (!response.ok) throw new Error('Failed to delete profile');
            alert('Profile deleted successfully!');
            fetchData();

        } catch (error) {
            console.error('Error deleting profile:', error);
            alert('Failed to delete profile');
        }
    };

    // Group applications by profile_code
    const groupedApplications = applications.reduce((acc, app) => {
        if (!acc[app.profile_code]) {
            acc[app.profile_code] = {
                profileCode: app.profile_code,
                company: app.company_name,
                designation: app.designation,
                apps: []
            };
        }
        // Only add if there's an actual application (entry_number is not null)
        if (app.entry_number) {
            acc[app.profile_code].apps.push(app);
        }
        return acc;
    }, {});

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Recruiter Dashboard</h1>

            {/* Create Profile Form */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <h3>Create New Profile</h3>
                <form onSubmit={handleCreateProfile} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Company Name"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#2a2a2a', color: 'white' }}
                    />
                    <input
                        type="text"
                        placeholder="Designation"
                        value={newDesignation}
                        onChange={(e) => setNewDesignation(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#2a2a2a', color: 'white' }}
                    />
                    <button
                        type="submit"
                        style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Create Profile
                    </button>
                </form>
            </div>

            {Object.keys(groupedApplications).length > 0 ? (
                <div>
                    {Object.values(groupedApplications).map((group) => (
                        <div key={group.profileCode} style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                                <h2>{group.company} - {group.designation}</h2>
                                <button
                                    onClick={() => handleDeleteProfile(group.profileCode)}
                                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                    Delete Profile
                                </button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Entry Number</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Status</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.apps.map((app) => (
                                        <tr key={`${app.profile_code}-${app.entry_number}`} style={{ borderBottom: '1px solid #333' }}>
                                            <td style={{ padding: '12px' }}>{app.entry_number}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.status}</td>
                                            <td style={{ padding: '12px' }}>
                                                {app.status === 'Applied' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.profile_code, app.entry_number, 'Selected')}
                                                            style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                        >
                                                            Select
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.profile_code, app.entry_number, 'Not Selected')}
                                                            style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                        >
                                                            Not Select
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No applications found. Create a profile above to start receiving applications.</p>
            )}

            <LogoutButton />
        </div>
    );
};

export default RecruiterDashboard;
