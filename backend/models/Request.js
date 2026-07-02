const db = require("../config/db");

class Request {
  static async getAll() {
    const [rows] = await db.execute(`
            SELECT
                request_id,
                sender_id,
                driver_id,
                rule_id,
                cargo_id,

                ST_AsText(origin_location) AS origin,
                ST_AsText(destination_location) AS destination,

                distance_km,
                estimated_time,

                loading_datetime,
                delivery_datetime,

                status,

                receiver_name,
                receiver_phone,

                price

            FROM request
        `);

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
            SELECT
                request_id,
                sender_id,
                driver_id,
                rule_id,
                cargo_id,

                ST_AsText(origin_location) AS origin,
                ST_AsText(destination_location) AS destination,

                distance_km,
                estimated_time,

                loading_datetime,
                delivery_datetime,

                status,

                receiver_name,
                receiver_phone,

                price

            FROM request
            WHERE request_id = ?
            `,
      [id],
    );

    return rows[0];
  }

  static async getAvailable() {
  const [rows] = await db.execute(`
    SELECT
        r.request_id, r.sender_id, r.driver_id, r.rule_id, r.cargo_id,
        ST_AsText(r.origin_location) AS origin,
        ST_AsText(r.destination_location) AS destination,
        r.distance_km, r.estimated_time, r.loading_datetime, r.delivery_datetime,
        r.status, r.receiver_name, r.receiver_phone, r.price,
        c.cargo_type, c.weight, c.refrigerator_required,
        s.full_name AS sender_name, s.phone AS sender_phone, s.city AS sender_city
    FROM request r
    JOIN cargo c ON c.cargo_id = r.cargo_id
    JOIN sender s ON s.sender_id = r.sender_id
    WHERE r.status = 'pending' AND r.driver_id IS NULL
    ORDER BY r.request_id DESC
  `);
  return rows;
}

static async getByDriverId(driverId) {
  const [rows] = await db.execute(
    `
    SELECT
        r.request_id, r.sender_id, r.driver_id, r.rule_id, r.cargo_id,
        ST_AsText(r.origin_location) AS origin,
        ST_AsText(r.destination_location) AS destination,
        r.distance_km, r.estimated_time, r.loading_datetime, r.delivery_datetime,
        r.status, r.receiver_name, r.receiver_phone, r.price,
        c.cargo_type, c.weight, c.refrigerator_required, c.status AS cargo_status,
        s.full_name AS sender_name, s.phone AS sender_phone
    FROM request r
    JOIN cargo c ON c.cargo_id = r.cargo_id
    JOIN sender s ON s.sender_id = r.sender_id
    WHERE r.driver_id = ?
    ORDER BY r.request_id DESC
    `,
    [driverId],
  );
  return rows;
}

  static async getDetail(id) {
    const [rows] = await db.execute(
      `
      SELECT
          r.request_id, r.sender_id, r.driver_id, r.rule_id, r.cargo_id,
          ST_AsText(r.origin_location) AS origin,
          ST_AsText(r.destination_location) AS destination,
          r.distance_km, r.estimated_time, r.loading_datetime, r.delivery_datetime,
          r.status, r.receiver_name, r.receiver_phone, r.price,
          c.cargo_type, c.weight, c.refrigerator_required, c.status AS cargo_status,
          s.full_name AS sender_name, s.phone AS sender_phone, s.city AS sender_city,
          d.full_name AS driver_name, d.phone AS driver_phone, d.status AS driver_status,
          ST_AsText(d.current_location) AS driver_location,
          v.plate_number, v.vehicle_type
      FROM request r
      JOIN cargo c ON c.cargo_id = r.cargo_id
      JOIN sender s ON s.sender_id = r.sender_id
      LEFT JOIN driver d ON d.driver_id = r.driver_id
      LEFT JOIN vehicle v ON v.driver_id = r.driver_id
      WHERE r.request_id = ?
      `,
      [id],
    );
    return rows[0];
  }

  static async assignDriver(requestId, driverId) {
    const [result] = await db.execute(
      "UPDATE request SET driver_id = ? WHERE request_id = ?",
      [driverId, requestId],
    );
    return result;
  }

  static async getBySenderId(senderId) {
    const [rows] = await db.execute(
      `
          SELECT request_id, sender_id, driver_id, rule_id, cargo_id,
                ST_AsText(origin_location) AS origin,
                ST_AsText(destination_location) AS destination,
                distance_km, estimated_time, loading_datetime, delivery_datetime,
                status, receiver_name, receiver_phone, price
          FROM request
          WHERE sender_id = ?
          ORDER BY request_id DESC
          `,
      [senderId],
    );
    return rows;
  }
  static async create(data) {
    const {
      sender_id,
      driver_id,
      rule_id,
      cargo_id,

      origin_longitude,
      origin_latitude,

      destination_longitude,
      destination_latitude,

      distance_km,
      estimated_time,

      loading_datetime,
      delivery_datetime,

      receiver_name,
      receiver_phone,

      price,
    } = data;

    const [result] = await db.execute(
      `
            INSERT INTO request
            (

                sender_id,
                driver_id,
                rule_id,
                cargo_id,

                origin_location,
                destination_location,

                distance_km,
                estimated_time,

                loading_datetime,
                delivery_datetime,

                receiver_name,
                receiver_phone,

                price

            )
            VALUES
            (

                ?,?,?,?,

                ST_GeomFromText(
                    CONCAT('POINT(', ?, ' ', ?, ')'),
                    4326
                ),

                ST_GeomFromText(
                    CONCAT('POINT(', ?, ' ', ?, ')'),
                    4326
                ),

                ?,?,

                ?,?,

                ?,?,

                ?

            )
            `,
      [
        sender_id,
        driver_id,
        rule_id,
        cargo_id,

        origin_longitude,
        origin_latitude,

        destination_longitude,
        destination_latitude,

        distance_km,
        estimated_time,

        loading_datetime,
        delivery_datetime,

        receiver_name,
        receiver_phone,

        price,
      ],
    );

    return result;
  }

  static async updateStatus(requestId, status) {
    const [result] = await db.execute(
      `
        UPDATE request
        SET status = ?
        WHERE request_id = ?
        `,
      [status, requestId],
    );

    return result;
  }
}

module.exports = Request;
