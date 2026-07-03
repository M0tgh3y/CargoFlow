const db = require("../config/db");

class Driver {
  static async getAll() {
    const [rows] = await db.execute(`
            SELECT
                *,
                ST_AsText(current_location) AS location_text
            FROM driver
        `);

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
            SELECT d.*, ST_AsText(d.current_location) AS location_text,
                  
            (SELECT AVG(score) FROM rating WHERE rated_user = 'driver' AND driver_id = d.driver_id) as avg_rating

            FROM driver d
            WHERE d.driver_id = ?
        `,
      [id],
    );
    return rows[0];
  }


  static async getByEmail(email) {
  const [rows] = await db.execute(
    `
          SELECT
              *,
              ST_AsText(current_location) AS location_text
          FROM driver
          WHERE email = ?
      `,
    [email],
  );

  return rows[0];
}

  static async create(data) {
    const {
      admin_id,
      company_id,
      full_name,
      phone,
      username,
      password,
      email,
      city,
      street,
      alley,
      house_number,
      birth_date,
      work_experience,
      license_number,
      disease,
      gender,
      longitude,
      latitude,
      status,
    } = data;

    const [result] = await db.execute(
      `
        INSERT INTO driver
        (
            admin_id,
            company_id,
            full_name,
            phone,
            username,
            password,
            email,
            city,
            street,
            alley,
            house_number,
            birth_date,
            work_experience,
            license_number,
            disease,
            gender,
            current_location,
            status
        )
        VALUES
        (
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ST_GeomFromText(
                CONCAT('POINT(', ?, ' ', ?, ')'),
                4326
            ),
            ?
        )
        `,
      [
        admin_id,
        company_id,
        full_name,
        phone,
        username,
        password,
        email,
        city,
        street,
        alley,
        house_number,
        birth_date,
        work_experience,
        license_number,
        disease,
        gender,
        longitude,
        latitude,
        status,
      ],
    );

    return result;
  }

  static async update(id, data) {
    const {
      admin_id,
      company_id,
      full_name,
      phone,
      username,
      password,
      email,
      city,
      street,
      alley,
      house_number,
      birth_date,
      work_experience,
      license_number,
      disease,
      gender,
      longitude,
      latitude,
      status,
    } = data;

    const [result] = await db.execute(
      `
        UPDATE driver
        SET
            admin_id=?,
            company_id=?,
            full_name=?,
            phone=?,
            username=?,
            password=?,
            email=?,
            city=?,
            street=?,
            alley=?,
            house_number=?,
            birth_date=?,
            work_experience=?,
            license_number=?,
            disease=?,
            gender=?,
            current_location=
                ST_GeomFromText(
                    CONCAT('POINT(', ?, ' ', ?, ')'),
                    4326
                ),
            status=?
        WHERE driver_id=?
        `,
      [
        admin_id,
        company_id,
        full_name,
        phone,
        username,
        password,
        email,
        city,
        street,
        alley,
        house_number,
        birth_date,
        work_experience,
        license_number,
        disease,
        gender,
        longitude,
        latitude,
        status,
        id,
      ],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM driver WHERE driver_id=?", [
      id,
    ]);

    return result;
  }

  static async updateStatus(driverId, status) {
    const [result] = await db.execute(
      `
        UPDATE driver
        SET status = ?
        WHERE driver_id = ?
        `,
      [status, driverId],
    );

    return result;
  }
}

module.exports = Driver;
