const db = require("../db/connection");

// Create appointment
const createAppointment = async (
    customerId,
    providerProfileId,
    serviceId,
    appointmentDate,
    startTime,
    endTime,
    notes
) => {
    const query = `
        INSERT INTO appointments (
            customer_id,
            provider_profile_id,
            service_id,
            appointment_date,
            start_time,
            end_time,
            status,
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
        RETURNING *
    `;

    const values = [
        customerId,
        providerProfileId,
        serviceId,
        appointmentDate,
        startTime,
        endTime,
        notes
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

// Check for overlapping appointments
const checkAppointmentConflict = async (
    providerProfileId,
    appointmentDate,
    startTime,
    endTime
) => {
    const query = `
        SELECT *
        FROM appointments
        WHERE provider_profile_id = $1
        AND appointment_date = $2
        AND status != 'cancelled'
        AND (
            start_time < $4
            AND end_time > $3
        )
    `;

    const values = [
        providerProfileId,
        appointmentDate,
        startTime,
        endTime
    ];

    const result = await db.query(query, values);
    return result.rows.length > 0;
};

// Get appointments for provider
const getAppointmentsByProvider = async (providerProfileId) => {
    const query = `
        SELECT *
        FROM appointments
        WHERE provider_profile_id = $1
        ORDER BY appointment_date, start_time
    `;

    const result = await db.query(query, [providerProfileId]);
    return result.rows;
};

// Get appointments for customer
const getAppointmentsByCustomer = async (customerId) => {
    const query = `
        SELECT *
        FROM appointments
        WHERE customer_id = $1
        ORDER BY appointment_date, start_time
    `;

    const result = await db.query(query, [customerId]);
    return result.rows;
};

module.exports = {
    createAppointment,
    checkAppointmentConflict,
    getAppointmentsByProvider,
    getAppointmentsByCustomer
};