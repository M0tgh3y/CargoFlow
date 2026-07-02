const db = require("../config/db");

class Company {
  static async getAll() {
    const [rows] = await db.execute(
      `
        SELECT
            c.company_id,
            c.company_code,
            c.company_name,
            c.city,
            c.commission_percent,
            GROUP_CONCAT(cp.phone) AS phones
        FROM company c
        LEFT JOIN company_phone cp
        ON c.company_id = cp.company_id
        GROUP BY c.company_id
        `,
    );

    return rows.map((row) => ({
      ...row,
      phones: row.phones ? row.phones.split(",") : [],
    }));
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
        SELECT
            c.company_id,
            c.company_code,
            c.company_name,
            c.city,
            c.commission_percent,
            GROUP_CONCAT(cp.phone) AS phones
        FROM company c
        LEFT JOIN company_phone cp
        ON c.company_id = cp.company_id
        WHERE c.company_id = ?
        GROUP BY c.company_id
        `,
      [id],
    );

    if (!rows[0]) return null;

    // تبدیل string به array
    return {
      ...rows[0],
      phones: rows[0].phones ? rows[0].phones.split(",") : [],
    };
  }
  static async create(data) {
    const { company_code, company_name, city, commission_percent } = data;

    const [result] = await db.execute(
      `
            INSERT INTO company
            (
                company_code,
                company_name,
                city,
                commission_percent
            )
            VALUES (?,?,?,?)
            `,
      [company_code, company_name, city, commission_percent],
    );

    return result;
  }

  static async update(id, data) {
    const { company_code, company_name, city, commission_percent } = data;

    const [result] = await db.execute(
      `
            UPDATE company
            SET
                company_code=?,
                company_name=?,
                city=?,
                commission_percent=?
            WHERE company_id=?
            `,
      [company_code, company_name, city, commission_percent, id],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute(
      `
            DELETE FROM company
            WHERE company_id=?
            `,
      [id],
    );

    return result;
  }
}

module.exports = Company;
