const db = require("../config/db");

class Vehicle {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM vehicle");

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM vehicle WHERE vehicle_id=?",
      [id],
    );

    return rows[0];
  }

  static async getByDriverId(driverId) {
    const [rows] = await db.execute(
      "SELECT * FROM vehicle WHERE driver_id=?",
      [driverId],
    );
    return rows[0];
  }

  static async create(data) {
    const {
      driver_id,
      cargo_dimensions,
      vehicle_type,
      refrigerator,
      depreciation,
      plate_number,
    } = data;

    const [result] = await db.execute(
      `
            INSERT INTO vehicle
            (
                driver_id,
                cargo_dimensions,
                vehicle_type,
                refrigerator,
                depreciation,
                plate_number
            )
            VALUES (?,?,?,?,?,?)
            `,
      [
        driver_id,
        cargo_dimensions,
        vehicle_type,
        refrigerator,
        depreciation,
        plate_number,
      ],
    );

    return result;
  }

  static async update(id, data) {
    const {
      driver_id,
      cargo_dimensions,
      vehicle_type,
      refrigerator,
      depreciation,
      plate_number,
    } = data;

    const [result] = await db.execute(
      `
            UPDATE vehicle
            SET
                driver_id=?,
                cargo_dimensions=?,
                vehicle_type=?,
                refrigerator=?,
                depreciation=?,
                plate_number=?
            WHERE vehicle_id=?
            `,
      [
        driver_id,
        cargo_dimensions,
        vehicle_type,
        refrigerator,
        depreciation,
        plate_number,
        id,
      ],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM vehicle WHERE vehicle_id=?",
      [id],
    );

    return result;
  }
}

module.exports = Vehicle;
