const db = require('../db');

const getAllStudents = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT userid FROM public.users WHERE role = 'student'"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllRecruiters = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT userid FROM public.users WHERE role = 'recruiter'"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStudentData = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            'SELECT profile_code, status FROM public.application WHERE entry_number = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRecruiterData = async (req, res) => {
    const { userId } = req.params;

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

module.exports = {
    getAllStudents,
    getAllRecruiters,
    getStudentData,
    getRecruiterData
};
