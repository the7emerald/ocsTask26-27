const db = require('../db');

const getAllProfiles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM public.profile');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all profiles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProfilesByCodes = async (req, res) => {
    const { profileCodes } = req.body;

    if (!profileCodes || !Array.isArray(profileCodes) || profileCodes.length === 0) {
        return res.status(400).json({ error: 'List of profile codes is required' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM public.profile WHERE profile_code = ANY($1)',
            [profileCodes]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching profiles by codes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRecruiterData = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT p.profile_code, p.company_name, p.designation, a.entry_number, a.status 
             FROM public.profile p 
             LEFT JOIN public.application a ON a.profile_code = p.profile_code 
             WHERE p.recruiter_email = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recruiter data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createProfile = async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { companyName, designation, recruiterEmail } = req.body;

    if (!companyName || !designation) {
        return res.status(400).json({ error: 'Company name and designation are required' });
    }

    // Admin can specify recruiterEmail, otherwise use logged-in user's ID
    const targetRecruiterEmail = (userRole === 'admin' && recruiterEmail) ? recruiterEmail : userId;

    try {
        const result = await db.query(
            'INSERT INTO public.profile (company_name, designation, recruiter_email) VALUES ($1, $2, $3) RETURNING *',
            [companyName, designation, targetRecruiterEmail]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteProfile = async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { profileCode } = req.body;

    if (!profileCode) {
        return res.status(400).json({ error: 'Profile code is required' });
    }

    try {
        // Check ownership before deleting (admin bypasses this check)
        if (userRole !== 'admin') {
            const profileCheck = await db.query(
                'SELECT recruiter_email FROM public.profile WHERE profile_code = $1',
                [profileCode]
            );

            if (profileCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            if (profileCheck.rows[0].recruiter_email !== userId) {
                return res.status(403).json({ error: 'Unauthorized: You can only delete your own profiles' });
            }
        }

        const result = await db.query('DELETE FROM public.profile WHERE profile_code = $1 RETURNING *', [profileCode]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ message: 'Profile deleted successfully' });

    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllProfiles,
    getProfilesByCodes,
    getRecruiterData,
    createProfile,
    deleteProfile
};
