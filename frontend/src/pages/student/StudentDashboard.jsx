import React, { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';

const StudentDashboard = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]); // List of { application, profile }
    const [hasAccepted, setHasAccepted] = useState(false);

    // For "Apply to Jobs" view
    const [allProfiles, setAllProfiles] = useState([]);
    const [myApplications, setMyApplications] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeader = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch Applications
            const appResponse = await fetch('/api/application', { headers: authHeader });
            if (!appResponse.ok) throw new Error('Failed to fetch applications');
            const applications = await appResponse.json();
            setMyApplications(applications);

            // 2. Check for Accepted Application
            const acceptedApp = applications.find(app => (app.status === 'Accepted'));

            if (acceptedApp) {
                setHasAccepted(true);
                // Fetch Profile Details
                const profileResponse = await fetch('/api/profiles', {
                    method: 'POST',
                    headers: { ...authHeader, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileCodes: [acceptedApp.profile_code] })
                });

                if (!profileResponse.ok) throw new Error('Failed to fetch profile details');
                const profiles = await profileResponse.json();

                if (profiles.length > 0) {
                    const profile = profiles[0];
                    setMessage(`Congratulations! You have accepted an offer from ${profile.company_name} (${profile.designation}).`);
                } else {
                    setMessage('Error: Accepted app found but no profile data.');
                }
            } else {
                setHasAccepted(false);
                // 3. Check for Selected Applications
                const selectedApps = applications.filter(app => app.status === 'Selected' || app.status === 'selected');

                if (selectedApps.length > 0) {
                    const profileCodes = selectedApps.map(app => app.profile_code);

                    const profileResponse = await fetch('/api/profiles', {
                        method: 'POST',
                        headers: { ...authHeader, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profileCodes })
                    });

                    if (!profileResponse.ok) throw new Error('Failed to fetch profile details');
                    const profiles = await profileResponse.json();

                    // Combine app and profile info
                    const combinedOffers = selectedApps.map(app => {
                        const profile = profiles.find(p => p.profile_code === app.profile_code);
                        return { app, profile };
                    });

                    setOffers(combinedOffers);
                    setMessage('');
                    setAllProfiles([]); // Clear all profiles if we are in offer view
                } else {
                    // 4. No Accepted, No Selected -> Show All Profiles
                    setOffers([]);
                    setMessage('');

                    const openResponse = await fetch('/api/profiles/all', { headers: authHeader });
                    if (!openResponse.ok) throw new Error('Failed to fetch profiles');
                    const allProfilesData = await openResponse.json();
                    setAllProfiles(allProfilesData);
                }
            }

        } catch (error) {
            console.error('Error in student dashboard:', error);
            setMessage('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (profileCode, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/application/student-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileCode, status })
            });

            if (!response.ok) throw new Error('Failed to update status');
            fetchData();

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleApply = async (profileCode) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileCode })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to apply');
            }

            alert('Applied successfully!');
            fetchData();

        } catch (error) {
            console.error('Error applying:', error);
            alert(error.message);
        }
    };

    const getApplicationStatus = (profileCode) => {
        const app = myApplications.find(a => a.profile_code === profileCode);
        return app ? app.status : null;
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Student Dashboard</h1>

            {hasAccepted ? (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px' }}>
                    <h3>{message}</h3>
                </div>
            ) : (
                <>
                    {offers.length > 0 ? (
                        <div>
                            <h2>Job Offers</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Company</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Designation</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map(({ app, profile }) => (
                                        <tr key={app.profile_code} style={{ borderBottom: '1px solid #333' }}>
                                            <td style={{ padding: '12px' }}>{profile?.company_name || 'N/A'}</td>
                                            <td style={{ padding: '12px' }}>{profile?.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => handleAction(app.profile_code, 'Accepted')}
                                                    style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(app.profile_code, 'Rejected')}
                                                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>
                            {allProfiles.length > 0 ? (
                                <div>
                                    <h2>Available Jobs</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left' }}>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Company</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Designation</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Recruiter Email</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allProfiles.map((profile) => {
                                                const status = getApplicationStatus(profile.profile_code);
                                                return (
                                                    <tr key={profile.profile_code} style={{ borderBottom: '1px solid #333' }}>
                                                        <td style={{ padding: '12px' }}>{profile.company_name}</td>
                                                        <td style={{ padding: '12px' }}>{profile.designation}</td>
                                                        <td style={{ padding: '12px' }}>{profile.recruiter_email}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            {status ? (
                                                                <span style={{ fontWeight: 'bold' }}>{status}</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleApply(profile.profile_code)}
                                                                    style={{ padding: '5px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                                >
                                                                    Apply
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>No job profiles available.</p>
                            )}
                        </div>
                    )}
                </>
            )}

            <LogoutButton />
        </div>
    );
};

export default StudentDashboard;
