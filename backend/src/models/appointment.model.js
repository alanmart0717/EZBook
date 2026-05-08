const db = require("../db/connection");

const Availability = require("./availability.model");

const BUFFER_MINUTES = 10;

const timeToMinutes = (timeValue) => {
    if (!timeValue) return 0;

    const cleanTime = String(timeValue).split("-")[0];
    const [hours, minutes] = cleanTime.split(":").map(Number);

    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};

const timesOverlap = (startA, endA, startB, endB) => {
    return startA < endB && endA > startB;
};

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
        AND start_time < ($4::time + ($5 || ' minutes')::interval)
        AND (end_time::time + ($5 || ' minutes')::interval) > $3::time
    `;

    const values = [
        providerProfileId,
        appointmentDate,
        startTime,
        endTime,
        BUFFER_MINUTES
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


const getAvailableTimes = async (
    providerProfileId,
    serviceId,
    appointmentDate
) => {
    // Get service duration
    const serviceResult = await db.query(
        `
        SELECT duration_minutes
        FROM services
        WHERE service_id = $1
        `,
        [serviceId]
    );

    if (serviceResult.rows.length === 0) {
        throw new Error("Service not found");
    }

    const serviceDuration = Number(serviceResult.rows[0].duration_minutes);

    console.log("SERVICE ID:", serviceId);
    console.log("SERVICE DURATION:", serviceDuration);
    console.log("BUFFER:", BUFFER_MINUTES);
  
    const availableTimes = [];

    // Get provider availability for this date
    const availabilitySlots = await Availability.getAvailabilityByDate(
        providerProfileId,
        appointmentDate
    );

    if (availabilitySlots.length === 0) {
        return [];
    }

    // Get booked appointments for this date
    const bookedAppointments = await getBookedAppointmentsByDate(
        providerProfileId,
        appointmentDate
    );

    const bookedRanges = bookedAppointments.map((appt) => ({
        start: timeToMinutes(appt.start_time),
        end: timeToMinutes(appt.end_time) + BUFFER_MINUTES
    }));

    // Generate dynamic slots
    for (const slot of availabilitySlots) {
        const availableStart = timeToMinutes(slot.start_time);
        const availableEnd = timeToMinutes(slot.end_time);

        let currentStart = availableStart;

        while (currentStart + serviceDuration <= availableEnd) {
            const currentEnd = currentStart + serviceDuration;

            const hasConflict = bookedRanges.some((booked) =>
                timesOverlap(
                    currentStart,
                    currentEnd,
                    booked.start,
                    booked.end
                )
            );

            if (!hasConflict) {
                availableTimes.push(minutesToTime(currentStart));
            }

            currentStart += serviceDuration + BUFFER_MINUTES;
        }
    }

    const uniqueAvailableTimes = [...new Set(availableTimes)].sort();

    console.log("FINAL AVAILABLE TIMES:", uniqueAvailableTimes);

    return uniqueAvailableTimes;
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
    SELECT
      a.*,
      s.service_name,
      s.duration_minutes,
      s.price,
      p.business_name,
      u.first_name AS provider_first_name,
      u.last_name AS provider_last_name
    FROM appointments a
    JOIN services s 
      ON a.service_id = s.service_id
    JOIN provider_profiles p 
      ON a.provider_profile_id = p.provider_profile_id
    JOIN users u 
      ON p.user_id = u.user_id
    WHERE a.customer_id = $1
    ORDER BY a.appointment_date, a.start_time
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
      a.updated_at,
      u.first_name,
      u.last_name,
      s.service_name
    FROM appointments a
    LEFT JOIN users u ON a.customer_id = u.user_id
    LEFT JOIN services s ON a.service_id = s.service_id
    WHERE a.provider_profile_id = $1
      AND (
        a.status = 'cancelled'
        OR a.appointment_date::date < CURRENT_DATE
      )
    ORDER BY a.updated_at DESC
  `;

  const result = await db.query(query, [providerProfileId]);
  return result.rows;
};

module.exports = {
    createAppointment,
    checkAppointmentConflict,
    getBookedAppointmentsByDate,
    getAvailableTimes,
    cancelFutureAppointmentsByService,
    getAppointmentById,
    getAppointmentsByProvider,
    getAppointmentsByCustomer,
    updateAppointmentStatus,
    cancelAppointment,
    cancelAppointmentsByServiceId,
    getProviderAppointmentHistory
};