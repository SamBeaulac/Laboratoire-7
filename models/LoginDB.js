/**
 * @file LoginDB.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Modèle de gestion de la base de données Login
 */

// Initialise la connection 
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'Login',
    waitForConnections: true,
}).promise();

// Classe de gestion
class LoginDB {
    static async getUserById(id) {
        const [rows] = await pool.query(
            `SELECT * 
            FROM Users 
            WHERE id = ?`,
            [id]
        );

        const dbUser = rows[0];

        if(!dbUser) 
        {
            return null;
        }

        return {
            id: dbUser.id,
            username: dbUser.username,
            password: dbUser.password,
            role: dbUser.role,
            welcomeText: dbUser.welcomeText
        };
    }

    static async getUserByLogin(username, password) {
        const [rows] = await pool.query(
            `SELECT * 
            FROM Users 
            WHERE username = ?`,
            [username]
        );
        
        const dbUser = rows[0];

        if(!dbUser || dbUser.password !== password) 
        {
            return { user: null, isInvalid: true };
        }

        return { 
            user: {
                id: dbUser.id,
                username: dbUser.username,
                password: dbUser.password,
                role: dbUser.role,
                welcomeText: dbUser.welcomeText
            },
            isInvalid: false
        };
    }

    static async getUsersInformation() {
        const [rows] = await pool.query(
            `SELECT id, username, password, welcomeText
            FROM Users`,
        );

        if(!rows) 
        {
            return null;
        }

        return rows;
    }

    static async changeUserInformation(id, updates) {
        const [rows] = await pool.query(
            `SELECT id, username, password, role, welcomeText
            FROM Users 
            WHERE id = ?`,
            [id]
        );

        if(rows.length === 0) 
        {
            return null;
        }

        const current = rows[0];
        
        const champs = [];
        const valeurs = [];

        if(updates.username && updates.username !== current.username)
        {
            const [existing] = await pool.query(
                `SELECT id FROM Users WHERE username = ?`,
                [updates.username]
            );
            
            if(existing.length > 0) 
            {
                return { updated: false, currentUser: current, error: 'username_exists' };
            }
            
            champs.push('username = ?');
            valeurs.push(updates.username);
        }

        if(updates.password && updates.password !== current.password)
        {
            champs.push('password = ?');
            valeurs.push(updates.password);
        }

        if(updates.welcomeText !== undefined && updates.welcomeText !== current.welcomeText)
        {
            champs.push('welcomeText = ?');
            valeurs.push(updates.welcomeText);
        }

        if(champs.length === 0) 
        {
            return { updated: false, currentUser: current };
        }

        valeurs.push(id);

        const [result] = await pool.query(
            `UPDATE Users 
            SET ${champs.join(', ')} 
            WHERE id = ?`, 
            valeurs
        );

        if(result.changedRows > 0) 
        {
            const [updatedRows] = await pool.query(
                `SELECT id, username, role, welcomeText 
                FROM Users 
                WHERE id = ?`,
                [id]
            );
            return { updated: true, currentUser: updatedRows[0] };
        } 
        else 
        {
            return { updated: false, currentUser: current };
        }
    }

    static async changeUsersInformation(usersUpdates) {
        if(!Array.isArray(usersUpdates) || usersUpdates.length === 0) 
        {
            return { updated: false, count: 0 };
        }

        let totalUpdated = 0;

        for(const { id, updates } of usersUpdates) 
        {
            const champs = [];
            const valeurs = [];

            if(updates.password)
            {
                champs.push('password = ?');
                valeurs.push(updates.password);
            }

            if(updates.welcomeText !== undefined)
            {
                champs.push('welcomeText = ?');
                valeurs.push(updates.welcomeText);
            }

            if(champs.length > 0) 
            {
                valeurs.push(id);

                const [result] = await pool.query(
                    `UPDATE Users 
                    SET ${champs.join(', ')} 
                    WHERE id = ?`, 
                    valeurs
                );

                if(result.changedRows > 0) 
                {
                    totalUpdated++;
                }
            }
        }

        return { updated: totalUpdated > 0, count: totalUpdated };
    }
}

module.exports = LoginDB;
