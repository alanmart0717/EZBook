const db = require("../db/connection");

// Create availability slot
const createAvailability = async (
    providerProfileId,
    day,
    startTime,
    endTime,
    isAvailable = true
) => {
    const query = `
        INSERT INTO provider_availability (
            provider_profile_id,
            day,
            start_time,
            end_time,
            is_available
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        providerProfileId,
        day,
        startTime,
        endTime,
        isAvailable
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

// Get all availability for a provider
const getAvailabilityByProviderId = async (providerProfileId) => {
    const query = `
        SELECT *
        FROM provider_availability
        WHERE provider_profile_id = $1
        ORDER BY day, start_time
    `;

    const result = await db.query(query, [providerProfileId]);
    return result.rows;
};

// Optional: delete slot
const deleteAvailability = async (availabilityId) => {
    const query = `
        DELETE FROM provider_availability
        WHERE availability_id = $1
        RETURNING *
    `;

    const result = await db.query(query, [availabilityId]);
    return result.rows[0];
};

module.exports = {
    createAvailability,
    getAvailabilityByProviderId,
    deleteAvailability
};