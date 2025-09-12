const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// --- APP & PORT INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION POOL ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hackathon_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
});

/**
 * Ensures that the recycle bin tables for deleted teams and members exist.
 */
async function setupRecycleBin() {
    let connection;
    try {
        connection = await pool.getConnection();
        // Create a 'deleted_teams' table with the same structure as the 'teams' table
        await connection.execute(`CREATE TABLE IF NOT EXISTS deleted_teams LIKE teams;`);

        // Create a table to store members of deleted teams
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS deleted_team_members (
                id INT, 
                team_id INT, 
                member_name VARCHAR(255),
                member_email VARCHAR(255), 
                member_phone VARCHAR(20),
                role VARCHAR(100), 
                skills TEXT,
                experience_level ENUM('Beginner', 'Intermediate', 'Advanced'),
                created_at TIMESTAMP
            );
        `);
        console.log('✅ Recycle Bin tables are ready.');
    } catch (error) {
        console.error('❌ Failed to set up recycle bin:', error);
    } finally {
        if (connection) connection.release();
    }
}

// --- API ROUTES ---

// POST /api/register - Register a new team and its members
app.post('/api/register', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { teamName, selectedDomain, selectedProblem, institution, contactEmail, contactPhone, projectDescription, techStack, teamMembers } = req.body;

        // Basic validation
        if (!teamName || !selectedDomain || !selectedProblem || !contactEmail || !teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Insert team details
        const [teamResult] = await connection.execute(
            `INSERT INTO teams (team_name, selected_domain, selected_problem, institution, contact_email, contact_phone, project_description, tech_stack) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [teamName, selectedDomain, selectedProblem, institution, contactEmail, contactPhone, projectDescription, techStack]
        );
        const teamId = teamResult.insertId;

        // Insert team members
        for (const member of teamMembers) {
            if (member.name && member.email) {
                await connection.execute(
                    `INSERT INTO team_members (team_id, member_name, member_email, member_phone, role, skills, experience_level) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [teamId, member.name, member.email, member.phone, member.role || 'Member', member.skills, member.experience || 'Intermediate']
                );
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Team registered successfully!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Registration failed.' });
    } finally {
        if (connection) connection.release();
    }
});

// GET /api/stats - Fetch dashboard statistics
app.get('/api/stats', async (req, res) => {
    try {
        const [[{ count: totalTeams }]] = await pool.execute('SELECT COUNT(*) as count FROM teams');
        const [[{ count: totalParticipants }]] = await pool.execute('SELECT COUNT(*) as count FROM team_members');
        const [domainDistribution] = await pool.execute(`SELECT selected_domain as domain, COUNT(*) as count FROM teams GROUP BY selected_domain`);

        res.json({ success: true, data: { totalTeams, totalParticipants, domainDistribution } });
    } catch (error) {
        console.error("Stats Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
});

// GET /api/teams - Fetch all active teams
app.get('/api/teams', async (req, res) => {
    try {
        const [teams] = await pool.execute(`
            SELECT t.*, COUNT(tm.id) as member_count 
            FROM teams t 
            LEFT JOIN team_members tm ON t.id = tm.team_id 
            GROUP BY t.id 
            ORDER BY t.created_at DESC
        `);
        res.json({ success: true, data: teams });
    } catch (error) {
        console.error("Fetch Teams Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch teams.' });
    }
});

// GET /api/teams/:id/members - Fetch members for a specific team
app.get('/api/teams/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const [members] = await pool.execute(
            'SELECT * FROM team_members WHERE team_id = ? ORDER BY CASE WHEN role = "Team Leader" THEN 0 ELSE 1 END, role',
            [id]
        );
        res.json({ success: true, data: members });
    } catch (error) {
        console.error("Fetch Members Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch team members.' });
    }
});

// GET /api/teams/deleted - Fetch all teams from the recycle bin
app.get('/api/teams/deleted', async (req, res) => {
    try {
        const [deletedTeams] = await pool.execute('SELECT * FROM deleted_teams ORDER BY updated_at DESC');
        res.json({ success: true, data: deletedTeams });
    } catch (error) {
        console.error("Fetch Deleted Teams Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch deleted teams.' });
    }
});

// DELETE /api/teams/:id - Move a team and its members to the recycle bin (soft delete)
app.delete('/api/teams/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        await connection.beginTransaction();

        // Copy members to recycle bin
        await connection.execute('INSERT INTO deleted_team_members SELECT * FROM team_members WHERE team_id = ?', [id]);
        // Copy team to recycle bin
        await connection.execute('INSERT INTO deleted_teams SELECT * FROM teams WHERE id = ?', [id]);

        // Delete from original tables
        await connection.execute('DELETE FROM team_members WHERE team_id = ?', [id]);
        await connection.execute('DELETE FROM teams WHERE id = ?', [id]);

        await connection.commit();
        res.json({ success: true, message: 'Team and members moved to recycle bin.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Soft Delete Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete team.' });
    } finally {
        if (connection) connection.release();
    }
});

// POST /api/teams/:id/restore - Restore a team from the recycle bin
app.post('/api/teams/:id/restore', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        await connection.beginTransaction();

        // Restore team
        await connection.execute('INSERT INTO teams SELECT * FROM deleted_teams WHERE id = ?', [id]);
        // Restore members
        await connection.execute('INSERT INTO team_members SELECT * FROM deleted_team_members WHERE team_id = ?', [id]);

        // Delete from recycle bin tables
        await connection.execute('DELETE FROM deleted_team_members WHERE team_id = ?', [id]);
        await connection.execute('DELETE FROM deleted_teams WHERE id = ?', [id]);

        await connection.commit();
        res.json({ success: true, message: 'Team and members restored successfully.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Restore Team Error:", error);
        res.status(500).json({ success: false, message: 'Failed to restore team.' });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /api/teams/:id/permanent - Permanently delete a team from the recycle bin
app.delete('/api/teams/:id/permanent', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        await connection.beginTransaction();

        // Permanently delete members and team from recycle bin
        await connection.execute('DELETE FROM deleted_team_members WHERE team_id = ?', [id]);
        await connection.execute('DELETE FROM deleted_teams WHERE id = ?', [id]);

        await connection.commit();
        res.json({ success: true, message: 'Team permanently deleted.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Permanent Delete Error:", error);
        res.status(500).json({ success: false, message: 'Failed to permanently delete team.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- HTML SERVING ROUTES ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// --- SERVER STARTUP ---
app.listen(PORT, async () => {
    await setupRecycleBin();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
