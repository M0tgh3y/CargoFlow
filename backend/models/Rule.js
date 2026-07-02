const db = require("../config/db");

class Rule {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM rules");

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
            SELECT *
            FROM rules
            WHERE rule_id=?
            `,
      [id],
    );

    return rows[0];
  }

  static async create(data) {
    const {
      cargo_type,
      cargo_feature,
      vehicle_type,
      vehicle_feature,
      weight_rate,
      distance_rate,
      time_rate,
      company_percent,
      delay_penalty_per_hour,
    } = data;

    const [result] = await db.execute(
      `
            INSERT INTO rules
            (
                cargo_type,
                cargo_feature,
                vehicle_type,
                vehicle_feature,
                weight_rate,
                distance_rate,
                time_rate,
                company_percent,
                delay_penalty_per_hour
            )
            VALUES
            (?,?,?,?,?,?,?,?,?)
            `,
      [
        cargo_type,
        cargo_feature,
        vehicle_type,
        vehicle_feature,
        weight_rate,
        distance_rate,
        time_rate,
        company_percent,
        delay_penalty_per_hour,
      ],
    );

    return result;
  }

  static async update(id, data) {
    const {
      cargo_type,
      cargo_feature,
      vehicle_type,
      vehicle_feature,
      weight_rate,
      distance_rate,
      time_rate,
      company_percent,
      delay_penalty_per_hour,
    } = data;

    const [result] = await db.execute(
      `
            UPDATE rules
            SET
                cargo_type=?,
                cargo_feature=?,
                vehicle_type=?,
                vehicle_feature=?,
                weight_rate=?,
                distance_rate=?,
                time_rate=?,
                company_percent=?,
                delay_penalty_per_hour=?
            WHERE rule_id=?
            `,
      [
        cargo_type,
        cargo_feature,
        vehicle_type,
        vehicle_feature,
        weight_rate,
        distance_rate,
        time_rate,
        company_percent,
        delay_penalty_per_hour,
        id,
      ],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute(
      `
            DELETE FROM rules
            WHERE rule_id=?
            `,
      [id],
    );

    return result;
  }

  static async getRates(id) {
    const [rows] = await db.execute(
      `
        SELECT
            weight_rate,
            distance_rate,
            time_rate,
            company_percent
        FROM rules
        WHERE rule_id=?
        `,
      [id],
    );

    return rows[0];
  }
}

module.exports = Rule;
