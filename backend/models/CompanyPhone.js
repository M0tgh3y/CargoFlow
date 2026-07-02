const db = require("../config/db");

class CompanyPhone {
  static async getPhones(companyId) {
    const [rows] = await db.execute(
      `
            SELECT *
            FROM company_phone
            WHERE company_id=?
            `,
      [companyId],
    );

    return rows;
  }

  static async addPhone(companyId, phone) {
    const [result] = await db.execute(
      `
            INSERT INTO company_phone
            (
                company_id,
                phone
            )
            VALUES (?,?)
            `,
      [companyId, phone],
    );

    return result;
  }

  static async deletePhone(id) {
    const [result] = await db.execute(
      `
            DELETE FROM company_phone
            WHERE company_phone_id=?
            `,
      [id],
    );

    return result;
  }
}

module.exports = CompanyPhone;
