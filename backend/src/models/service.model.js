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
  const result = await db.query(
    `
    SELECT 
      s.service_id,
      s.provider_profile_id,
      s.service_name,
      s.description,
      s.duration_minutes,
      s.price,
      p.business_name,
      u.first_name || ' ' || u.last_name AS provider_name
    FROM services s
    JOIN provider_profiles p ON s.provider_profile_id = p.provider_profile_id
    JOIN users u ON p.user_id = u.user_id
    WHERE s.is_archived = false
    ORDER BY s.created_at DESC
    `
  );

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

const archiveService = async (serviceId) => {
  const result = await db.query(
    `
    UPDATE services
    SET is_archived = true,
        archived_at = NOW()
    WHERE service_id = $1
    RETURNING *
    `,
    [serviceId]
  );

  return result.rows[0];
};

const getArchivedServicesByProviderId = async (providerProfileId) => {
  const result = await db.query(
    `
    SELECT *
    FROM services
    WHERE provider_profile_id = $1
      AND is_archived = true
    ORDER BY archived_at DESC
    `,
    [providerProfileId]
  );

  return result.rows;
};

const unarchiveService = async (serviceId) => {
  const result = await db.query(
    `
    UPDATE services
    SET is_archived = false,
        archived_at = NULL
    WHERE service_id = $1
    RETURNING *
    `,
    [serviceId]
  );

  return result.rows[0];
};

module.exports = {
    createService,
    getAllServices,
    getServicesByProvider,
    getServiceById,
    deleteService,
    archiveService,
    getArchivedServicesByProviderId,
    unarchiveService
};