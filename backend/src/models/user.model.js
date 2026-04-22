const db = require("../db/connection");

// Create new user
const createUser = async (
    firstName,
    lastName,
    email,
    passwordHash,
    phoneNumber,
    role
) => {
    const query = `
        INSERT INTO users (
            first_name,
            last_name,
            email,
            password_hash,
            phone_number,
            role
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            role,
            created_at
    `;

    const values = [
        firstName,
        lastName,
        email,
        passwordHash,
        phoneNumber,
        role
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

// Find user by email (for login)
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            password_hash,
            phone_number,
            role,
            created_at
        FROM users
        WHERE email = $1
    `;

    const result = await db.query(query, [email]);
    return result.rows[0];
};

// Find user by ID
const findUserById = async (userId) => {
    const query = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            role,
            created_at
        FROM users
        WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
};