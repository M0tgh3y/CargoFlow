const db = require("../config/db");

class Cargo {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM cargo");

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute("SELECT * FROM cargo WHERE cargo_id=?", [
      id,
    ]);

    return rows[0];
  }

  static async create(data) {
    const { sender_id, weight, cargo_type, refrigerator_required, status } =
      data;

    const [result] = await db.execute(
      `
            INSERT INTO cargo
            (
                sender_id,
                weight,
                cargo_type,
                refrigerator_required,
                status
            )
            VALUES (?,?,?,?,?)
            `,
      [sender_id, weight, cargo_type, refrigerator_required, status],
    );

    return result;
  }

  static async update(id, data) {
    const { sender_id, weight, cargo_type, refrigerator_required, status } =
      data;

    const [result] = await db.execute(
      `
            UPDATE cargo
            SET
                sender_id=?,
                weight=?,
                cargo_type=?,
                refrigerator_required=?,
                status=?
            WHERE cargo_id=?
            `,
      [sender_id, weight, cargo_type, refrigerator_required, status, id],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM cargo WHERE cargo_id=?", [
      id,
    ]);

    return result;
  }

  static async getWeight(id) {
    const [rows] = await db.execute(
      `
        SELECT weight
        FROM cargo
        WHERE cargo_id=?
        `,
      [id],
    );

    return rows[0];
  }

  static async updateStatus(cargoId, status) {
    const [result] = await db.execute(
      `
        UPDATE cargo
        SET status = ?
        WHERE cargo_id = ?
        `,
      [status, cargoId],
    );

    return result;
  }
}

module.exports = Cargo;
