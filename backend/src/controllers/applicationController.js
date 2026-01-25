const db = require('../db');

const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in token' });
        }

        const result = await db.query(
            'SELECT profile_code, status FROM public.application WHERE entry_number = $1',
            [userId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { profileCode, status } = req.body;

        if (!profileCode || !status) {
            return res.status(400).json({ error: 'Profile code and status are required' });
        }

        const validStatuses = ['Accepted', 'Rejected']; // Restrict to expected user actions
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status update' });
        }

        const result = await db.query(
            'UPDATE public.application SET status = $1 WHERE entry_number = $2 AND profile_code = $3 RETURNING *',
            [status, userId, profileCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // If the student accepted this offer, reject all other pending applications
        if (status === 'Accepted') {
            await db.query(
                `UPDATE public.application 
                 SET status = 'Rejected' 
                 WHERE entry_number = $1 
                   AND profile_code != $2 
                   AND status IN ('Applied', 'Selected')`,
                [userId, profileCode]
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const applyForJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { profileCode } = req.body;

        if (!profileCode) {
            return res.status(400).json({ error: 'Profile code is required' });
        }

        const result = await db.query(
            'INSERT INTO public.application (profile_code, entry_number) VALUES ($1, $2) RETURNING *',
            [profileCode, userId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        console.error('Error applying for job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateRecruiterStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { profileCode, entryNumber, status } = req.body;

        if (!profileCode || !entryNumber || !status) {
            return res.status(400).json({ error: 'Profile code, entry number, and status are required' });
        }

        // Verify profile ownership
        const profileCheck = await db.query(
            'SELECT recruiter_email FROM public.profile WHERE profile_code = $1',
            [profileCode]
        );

        if (profileCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        if (profileCheck.rows[0].recruiter_email !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only update applications for your own profiles' });
        }

        const validStatuses = ['Selected', 'Not Selected'];
        // Ideally also allow 'Applied' if they want to undo? But prompt says 'Select'->'Selected', 'Not'->'Not Selected'

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status update by recruiter' });
        }

        const result = await db.query(
            'UPDATE public.application SET status = $1 WHERE entry_number = $2 AND profile_code = $3 RETURNING *',
            [status, entryNumber, profileCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating recruiter status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getUserApplications,
    updateApplicationStatus,
    applyForJob,
    updateRecruiterStatus
};
