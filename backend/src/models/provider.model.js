const db = require("../db/connection");

// Create provider profile
const createProviderProfile = async (
    userId,
    businessName,
    bio,
    serviceCategory,
    location
) => {
    const query = `
        INSERT INTO provider_profiles (
            user_id,
            business_name,
            bio,
            service_category,
            location
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        userId,
        businessName,
        bio,
        serviceCategory,
        location
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

// Get provider profile by user_id
const getProviderByUserId = async (userId) => {
    const query = `
        SELECT *
        FROM provider_profiles
        WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0];
};

// Get provider by provider_profile_id (useful later)
const getProviderById = async (providerProfileId) => {
    const query = `
        SELECT *
        FROM provider_profilesok
        WHERE provider_profile_id = $1
    `;

    const result = await db.query(query, [providerProfileId]);
    return result.rows[0];
};

module.exports = {
    createProviderProfile,
    getProviderByUserId,
    getProviderById
};