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
    return result.rows[0];
};

// Get all active services
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
const getServicesByProvider = async (providerProfileId) => {
    const query = `
        SELECT *
        FROM services
        WHERE provider_profile_id = $1
        AND active_status = true
    `;

    const result = await db.query(query, [providerProfileId]);
    return result.rows;
};

// Get single service by ID (USED BY APPOINTMENTS)
const getServiceById = async (serviceId) => {
    const query = `
        SELECT *
        FROM services
        WHERE service_id = $1
    `;

    const result = await db.query(query, [serviceId]);
    return result.rows[0];
};

// Soft delete service by ID
const deleteService = async (serviceId, providerProfileId) => {
    const query = `
        UPDATE services
        SET active_status = false
        WHERE service_id = $1
        AND provider_profile_id = $2
        RETURNING *
    `;

    const values = [serviceId, providerProfileId];

    const result = await db.query(query, values);
    return result.rows[0];
};

module.exports = {
    createService,
    getAllServices,
    getServicesByProvider,
    getServiceById,
    deleteService
};