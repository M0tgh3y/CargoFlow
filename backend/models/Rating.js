const db = require("../config/db");

class Rating {
  static async getAll() {
    const [rows] = await db.execute(`
            SELECT *
            FROM rating
        `);

    return rows;
  }

  static async getByIds(senderId, driverId, requestId) {
    const [rows] = await db.execute(
      `
            SELECT *
            FROM rating
            WHERE sender_id = ?
            AND driver_id = ?
            AND request_id = ?
            `,
      [senderId, driverId, requestId],
    );

    return rows[0];
  }

  static async create(data) {
    const {
      sender_id,
      driver_id,
      request_id,

      score,
      comment = null,

      rated_by,
      rated_user,
    } = data;

    console.log({
      sender_id,
      driver_id,
      request_id,
      score,
      comment,
      rated_by,
      rated_user,
    });

    const [result] = await db.execute(
      `
        INSERT INTO rating
        (
            sender_id,
            driver_id,
            request_id,

            score,
            comment,

            rating_datetime,

            rated_by,
            rated_user
        )
        VALUES
        (
            ?,?,?,
            ?,?,
            NOW(),
            ?,?
        )
        `,
      [sender_id, driver_id, request_id, score, comment, rated_by, rated_user],
    );

    return result;
  }
}

module.exports = Rating;
