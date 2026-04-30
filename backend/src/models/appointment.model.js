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
        AND status IN ('pending', 'confirmed')
        AND start_time < $4
        AND end_time > $3
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

// Get booked appointments for provider on a specific date
const getBookedAppointmentsByDate = async (providerProfileId, appointmentDate) => {
    const query = `
        SELECT start_time, end_time
        FROM appointments
        WHERE provider_profile_id = $1
        AND appointment_date = $2
        AND status IN ('pending', 'confirmed')
        ORDER BY start_time
    `;

    const result = await db.query(query, [providerProfileId, appointmentDate]);
    return result.rows;
};

const cancelFutureAppointmentsByService = async (serviceId) => {
    const query = `
        UPDATE appointments
        SET status = 'cancelled'
        WHERE service_id = $1
        AND appointment_date >= CURRENT_DATE
        AND status != 'cancelled'
        RETURNING *
    `;

    const result = await db.query(query, [serviceId]);
    return result.rows;
};

// Get appointments by id
const getAppointmentById = async (appointmentId) => {
  const result = await db.query(
    `
    SELECT *
    FROM appointments
    WHERE appointment_id = $1
    `,
    [appointmentId]
  );

  return result.rows[0];
};

// Get appointments for provider
const getAppointmentsByProvider = async (providerProfileId) => {
    const query = `
        SELECT 
            a.*,
            s.service_name,
            u.first_name,
            u.last_name
        FROM appointments a
        JOIN services s ON a.service_id = s.service_id
        JOIN users u ON a.customer_id = u.user_id
        WHERE a.provider_profile_id = $1
        AND a.status NOT IN ('cancelled')
        ORDER BY a.appointment_date, a.start_time
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

const updateAppointmentStatus = async (appointmentId, status) => {
  const result = await db.query(
    `
    UPDATE appointments
    SET status = $1,
        updated_at = NOW()
    WHERE appointment_id = $2
    RETURNING *
    `,
    [status, appointmentId]
  );

  return result.rows[0];
};

const cancelAppointment = async (appointmentId) => {
  const result = await db.query(
    `
    UPDATE appointments
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE appointment_id = $1
    RETURNING *
    `,
    [appointmentId]
  );

  return result.rows[0];
};

const cancelAppointmentsByServiceId = async (serviceId) => {
  const result = await db.query(
    `
    UPDATE appointments
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE service_id = $1
      AND status != 'cancelled'
    RETURNING *
    `,
    [serviceId]
  );

  return result.rows;
};

const getProviderAppointmentHistory = async (providerProfileId) => {
  const query = `
    SELECT 
      a.appointment_id,
      a.appointment_date,
      a.start_time,
      a.end_time,
      a.status,
      a.notes,
      u.first_name,
      u.last_name,
      s.service_name
    FROM appointments a
    JOIN users u ON a.customer_id = u.user_id
    JOIN services s ON a.service_id = s.service_id
    WHERE a.provider_profile_id = $1
      AND (
        a.status = 'cancelled'
        OR a.appointment_date < CURRENT_DATE
      )
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `;

  const result = await db.query(query, [providerProfileId]);
  return result.rows;
};

module.exports = {
    createAppointment,
    checkAppointmentConflict,
    getBookedAppointmentsByDate,
    cancelFutureAppointmentsByService,
    getAppointmentById,
    getAppointmentsByProvider,
    getAppointmentsByCustomer,
    updateAppointmentStatus,
    cancelAppointment,
    cancelAppointmentsByServiceId,
    getProviderAppointmentHistory
};