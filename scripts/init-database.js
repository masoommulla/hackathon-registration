const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    console.log("DEBUG: Password being used is:", process.env.DB_PASSWORD);
    
    let connection; 

    try {
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('🔄 Initializing database...');

        
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hackathon_db'}\``);
        console.log('✅ Database created/verified');

        
        await connection.end();

        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'hackathon_db' 
        });

        
        // Create teams table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS teams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_name VARCHAR(255) NOT NULL UNIQUE,
                selected_domain VARCHAR(255) NOT NULL,
                selected_problem TEXT NOT NULL,
                institution VARCHAR(255),
                contact_email VARCHAR(255) NOT NULL UNIQUE,
                contact_phone VARCHAR(20),
                project_description TEXT,
                tech_stack TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_domain (selected_domain),
                INDEX idx_email (contact_email),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Create team_members table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS team_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_id INT NOT NULL,
                member_name VARCHAR(255) NOT NULL,
                member_email VARCHAR(255) NOT NULL,
                member_phone VARCHAR(20),
                role VARCHAR(100) DEFAULT 'Member',
                skills TEXT,
                experience_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                INDEX idx_team_id (team_id),
                INDEX idx_email (member_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        console.log('✅ Tables created successfully!');

        
        const [existingTeams] = await connection.execute('SELECT COUNT(*) as count FROM teams');
        if (existingTeams[0].count === 0) {
            console.log('🔄 Adding sample data...');
            const [teamResult] = await connection.execute(`
                INSERT INTO teams (
                    team_name, selected_domain, selected_problem, 
                    institution, contact_email, contact_phone, 
                    project_description, tech_stack
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'Code Warriors',
                'Artificial Intelligence & Machine Learning (AI/ML)',
                'Mental Health Chatbot',
                'Tech University',
                'codewarriors@example.com',
                '+1234567890',
                'An AI-powered chatbot to provide mental health support',
                'Python, TensorFlow, React, Node.js'
            ]);

            const teamId = teamResult.insertId;
            await connection.execute(`
                INSERT INTO team_members (
                    team_id, member_name, member_email, 
                    member_phone, role, skills, experience_level
                ) VALUES 
                (?, 'John Doe', 'john@example.com', '+1234567891', 'Team Leader', 'Python, Machine Learning', 'Advanced'),
                (?, 'Jane Smith', 'jane@example.com', '+1234567892', 'Member', 'React, Frontend', 'Intermediate'),
                (?, 'Bob Johnson', 'bob@example.com', '+1234567893', 'Member', 'Node.js, Backend', 'Intermediate')
            `, [teamId, teamId, teamId]);

            console.log('✅ Sample data added!');
        }

        console.log('🎉 Database initialization completed successfully!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end(); // connection ko safely end karein
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;

