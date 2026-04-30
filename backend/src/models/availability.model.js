const db = require("../db/connection");

// Create availability slot
const createAvailability = async (
    providerProfileId,
    day,
    startTime,
    endTime,
    isAvailable = true
) => {

    // Normalize ENUM value BEFORE DB insert
    const normalizedDay = day.toLowerCase().trim();

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
        normalizedDay,
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

// Delete availability slot
const deleteAvailability = async (availabilityId) => {

    const query = `
        DELETE FROM provider_availability
        WHERE availability_id = $1
        RETURNING *
    `;

    const result = await db.query(query, [availabilityId]);
    return result.rows[0];
};

// Check if provider is available
const checkAvailability = async (
    providerProfileId,
    appointmentDate,
    startTime,
    endTime
) => {

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const dayOfWeek = days[new Date(`${appointmentDate}T00:00:00`).getDay()];

    const query = `
        SELECT *
        FROM provider_availability
        WHERE provider_profile_id = $1
        AND day = $2
        AND is_available = true
        AND start_time <= $3
        AND end_time >= $4
    `;

    const values = [
        providerProfileId,
        dayOfWeek,
        startTime,
        endTime
    ];

    const result = await db.query(query, values);

    return result.rows.length > 0;
};

// Get provider availability for a specific date
const getAvailabilityByDate = async (providerProfileId, appointmentDate) => {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const dayOfWeek = days[new Date(`${appointmentDate}T00:00:00`).getDay()];

    const query = `
        SELECT *
        FROM provider_availability
        WHERE provider_profile_id = $1
        AND day = $2
        AND is_available = true
        ORDER BY start_time
    `;

    const result = await db.query(query, [providerProfileId, dayOfWeek]);
    return result.rows;
};

module.exports = {
    createAvailability,
    getAvailabilityByProviderId,
    deleteAvailability,
    checkAvailability,
    getAvailabilityByDate
};