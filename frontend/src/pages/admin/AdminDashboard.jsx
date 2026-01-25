import React, { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [studentsRes, recruitersRes] = await Promise.all([
                fetch('/api/admin/students', { headers }),
                fetch('/api/admin/recruiters', { headers })
            ]);

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
            }

            if (recruitersRes.ok) {
                const recruitersData = await recruitersRes.json();
                setRecruiters(recruitersData);
            }

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const viewStudent = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/student/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch student data');
            const data = await response.json();
            setSelectedUser({ type: 'student', userId });
            setUserData(data);

            // Also fetch all profiles for the apply functionality
            fetchAllProfiles();

        } catch (error) {
            console.error('Error fetching student data:', error);
            alert('Failed to fetch student data');
        }
    };

    const viewRecruiter = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/recruiter/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch recruiter data');
            const data = await response.json();
            setSelectedUser({ type: 'recruiter', userId });
            setUserData(data);

        } catch (error) {
            console.error('Error fetching recruiter data:', error);
            alert('Failed to fetch recruiter data');
        }
    };

    const handleRecruiterStatusUpdate = async (profileCode, entryNumber, status) => {
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
            // Refresh recruiter data
            if (selectedUser) {
                viewRecruiter(selectedUser.userId);
            }

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleStudentStatusUpdate = async (profileCode, entryNumber, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/application/student-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileCode, status, entryNumber })
            });

            if (!response.ok) throw new Error('Failed to update status');
            // Refresh student data
            if (selectedUser) {
                viewStudent(selectedUser.userId);
            }

        } catch (error) {
            console.error('Error updating student status:', error);
            alert('Failed to update student status');
        }
    };

    const closeDetail = () => {
        setSelectedUser(null);
        setUserData(null);
    };

    // Create Profile Modal State
    const [showCreateProfile, setShowCreateProfile] = useState(false);
    const [newProfileData, setNewProfileData] = useState({ companyName: '', designation: '' });

    const handleCreateProfile = async () => {
        if (!newProfileData.companyName || !newProfileData.designation) {
            alert('Company name and designation are required');
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
                body: JSON.stringify({
                    companyName: newProfileData.companyName,
                    designation: newProfileData.designation,
                    recruiterEmail: selectedUser.userId
                })
            });

            if (!response.ok) throw new Error('Failed to create profile');

            setNewProfileData({ companyName: '', designation: '' });
            setShowCreateProfile(false);
            // Refresh recruiter data
            viewRecruiter(selectedUser.userId);

        } catch (error) {
            console.error('Error creating profile:', error);
            alert('Failed to create profile');
        }
    };

    const handleDeleteProfile = async (profileCode) => {
        if (!window.confirm(`Are you sure you want to delete profile ${profileCode}? This will also delete all associated applications.`)) {
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

            // Refresh recruiter data
            viewRecruiter(selectedUser.userId);

        } catch (error) {
            console.error('Error deleting profile:', error);
            alert('Failed to delete profile');
        }
    };

    // Apply to profile for student (admin action)
    const [allProfiles, setAllProfiles] = useState([]);

    const fetchAllProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profiles/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const profiles = await response.json();
                setAllProfiles(profiles);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleApplyForStudent = async (profileCode) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    profileCode: profileCode,
                    entryNumber: selectedUser.userId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to apply');
            }

            alert('Applied successfully!');
            // Refresh student data
            viewStudent(selectedUser.userId);

        } catch (error) {
            console.error('Error applying for student:', error);
            alert(error.message || 'Failed to apply');
        }
    };

    // Helper to check if student has already applied to a profile
    const getStudentApplicationStatus = (profileCode) => {
        if (!userData || !Array.isArray(userData)) return null;
        const app = userData.find(a => a.profile_code === profileCode);
        return app ? app.status : null;
    };

    // Group recruiter data by profile
    const groupRecruiterData = (data) => {
        return data.reduce((acc, item) => {
            if (!acc[item.profile_code]) {
                acc[item.profile_code] = {
                    profileCode: item.profile_code,
                    company: item.company_name,
                    designation: item.designation,
                    apps: []
                };
            }
            if (item.entry_number) {
                acc[item.profile_code].apps.push(item);
            }
            return acc;
        }, {});
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>

            {/* Tab Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => { setActiveTab('students'); closeDetail(); }}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: activeTab === 'students' ? '#007bff' : '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Students ({students.length})
                </button>
                <button
                    onClick={() => { setActiveTab('recruiters'); closeDetail(); }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'recruiters' ? '#007bff' : '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Recruiters ({recruiters.length})
                </button>
            </div>

            {/* Detail View */}
            {selectedUser && userData && (
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Viewing: {selectedUser.userId} ({selectedUser.type})</h2>
                        <button
                            onClick={closeDetail}
                            style={{ padding: '5px 15px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>

                    {selectedUser.type === 'student' && (
                        <div>
                            <h3>Available Profiles</h3>
                            {allProfiles.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#2a2a2a', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Company</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Designation</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Recruiter Email</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Status / Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allProfiles.map((profile) => {
                                            const status = getStudentApplicationStatus(profile.profile_code);
                                            return (
                                                <tr key={profile.profile_code} style={{ borderBottom: '1px solid #333' }}>
                                                    <td style={{ padding: '12px' }}>{profile.company_name}</td>
                                                    <td style={{ padding: '12px' }}>{profile.designation}</td>
                                                    <td style={{ padding: '12px' }}>{profile.recruiter_email}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {status ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span style={{ fontWeight: 'bold' }}>{status}</span>
                                                                {status === 'Selected' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleStudentStatusUpdate(profile.profile_code, selectedUser.userId, 'Accepted')}
                                                                            style={{ padding: '3px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStudentStatusUpdate(profile.profile_code, selectedUser.userId, 'Rejected')}
                                                                            style={{ padding: '3px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApplyForStudent(profile.profile_code)}
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
                            ) : (
                                <p>No profiles available.</p>
                            )}
                        </div>
                    )}

                    {selectedUser.type === 'recruiter' && (
                        <div>
                            {/* Create Profile Button */}
                            <button
                                onClick={() => setShowCreateProfile(true)}
                                style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                + Create New Profile
                            </button>

                            {/* Create Profile Modal */}
                            {showCreateProfile && (
                                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #444' }}>
                                    <h4 style={{ marginTop: 0 }}>Create New Profile for {selectedUser.userId}</h4>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Company Name:</label>
                                        <input
                                            type="text"
                                            value={newProfileData.companyName}
                                            onChange={(e) => setNewProfileData({ ...newProfileData, companyName: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Designation:</label>
                                        <input
                                            type="text"
                                            value={newProfileData.designation}
                                            onChange={(e) => setNewProfileData({ ...newProfileData, designation: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleCreateProfile}
                                            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Create
                                        </button>
                                        <button
                                            onClick={() => { setShowCreateProfile(false); setNewProfileData({ companyName: '', designation: '' }); }}
                                            style={{ padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {Object.keys(groupRecruiterData(userData)).length > 0 ? (
                                Object.values(groupRecruiterData(userData)).map((group) => (
                                    <div key={group.profileCode} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                                            <h3 style={{ margin: 0 }}>
                                                {group.company} - {group.designation} (Profile: {group.profileCode})
                                            </h3>
                                            <button
                                                onClick={() => handleDeleteProfile(group.profileCode)}
                                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                            >
                                                Delete Profile
                                            </button>
                                        </div>
                                        {group.apps.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#2a2a2a', textAlign: 'left' }}>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Entry Number</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Status</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.apps.map((app) => (
                                                        <tr key={`${app.profile_code}-${app.entry_number}`} style={{ borderBottom: '1px solid #333' }}>
                                                            <td style={{ padding: '10px' }}>{app.entry_number}</td>
                                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{app.status}</td>
                                                            <td style={{ padding: '10px' }}>
                                                                {app.status === 'Applied' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleRecruiterStatusUpdate(app.profile_code, app.entry_number, 'Selected')}
                                                                            style={{ marginRight: '5px', padding: '3px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                                        >
                                                                            Select
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRecruiterStatusUpdate(app.profile_code, app.entry_number, 'Not Selected')}
                                                                            style={{ padding: '3px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
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
                                        ) : (
                                            <p style={{ color: '#888' }}>No applications for this profile.</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No profiles found for this recruiter.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* User Lists */}
            {activeTab === 'students' && !selectedUser && (
                <div>
                    <h2>All Students</h2>
                    {students.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>User ID</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.userid} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '12px' }}>{student.userid}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => viewStudent(student.userid)}
                                                style={{ padding: '5px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No students found.</p>
                    )}
                </div>
            )}

            {activeTab === 'recruiters' && !selectedUser && (
                <div>
                    <h2>All Recruiters</h2>
                    {recruiters.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>User ID</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recruiters.map((recruiter) => (
                                    <tr key={recruiter.userid} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '12px' }}>{recruiter.userid}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => viewRecruiter(recruiter.userid)}
                                                style={{ padding: '5px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No recruiters found.</p>
                    )}
                </div>
            )}

            <div style={{ marginTop: '30px' }}>
                <LogoutButton />
            </div>
        </div>
    );
};

export default AdminDashboard;
