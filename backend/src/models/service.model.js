const db = require("../db/connection");

// Create service
const createService = async (
    providerProfileId,
    serviceName,
    description,
    durationMinutes,
    price
) => {
    const query = `
        INSERT INTO services(
            provider_profile_id,
            service_name,
            description,
            duration_minutes,
            price
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        providerProfileId,
        serviceName,
        description,
        durationMinutes,
        price
    ];

    const result = await db.query(query, values);
    return result.row[0];
};

// Get all active services (IMPORTANT)
const getAllServices = async () => {
    const query = `
        SELECT * 
        FROM services
        WHERE active_status = true
        ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
};

// Get services by provider
const getServicesByProvider = async (providerProfiledID) => {
    const query = `
        SELECT *
        FROM services
        WHERE provider_profile_id = $1
    `;

    const result = await db.query(query, [providerProfileId]);
     return result.row;
};

module.exports = {
    createService,
    getAllServices,
    getServicesByProvider
};