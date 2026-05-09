const db = require("../db/connection");

const createBlockedTime = async (
  providerProfileId,
  label,
  repeatType,
  blockDate,
  dayOfWeek,
  dayOfMonth,
  startTime,
  endTime
) => {
  const query = `
    INSERT INTO provider_blocked_times (
      provider_profile_id,
      label,
      repeat_type,
      block_date,
      day_of_week,
      day_of_month,
      start_time,
      end_time
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    providerProfileId,
    label,
    repeatType,
    blockDate,
    dayOfWeek,
    dayOfMonth,
    startTime,
    endTime
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getBlockedTimesByProviderId = async (providerProfileId) => {
  const query = `
    SELECT *
    FROM provider_blocked_times
    WHERE provider_profile_id = $1
    ORDER BY created_at DESC
  `;

  const result = await db.query(query, [providerProfileId]);
  return result.rows;
};

const deleteBlockedTime = async (blockedTimeId) => {
  const query = `
    DELETE FROM provider_blocked_times
    WHERE blocked_time_id = $1
    RETURNING *
  `;

  const result = await db.query(query, [blockedTimeId]);
  return result.rows[0];
};

module.exports = {
  createBlockedTime,
  getBlockedTimesByProviderId,
  deleteBlockedTime
};