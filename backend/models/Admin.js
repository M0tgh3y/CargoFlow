const db = require("../config/db");

class Admin {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM admin");

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute("SELECT * FROM admin WHERE admin_id = ?", [
      id,
    ]);

    return rows[0];
  }

  static async create(adminData) {
    const { full_name, phone, username, password, email } = adminData;

    const [result] = await db.execute(
      `
            INSERT INTO admin
            (
                full_name,
                phone,
                username,
                password,
                email
            )
            VALUES (?,?,?,?,?)
            `,
      [full_name, phone, username, password, email],
    );

    return result;
  }

  static async update(id, adminData) {
    const { full_name, phone, username, password, email } = adminData;

    const [result] = await db.execute(
      `
            UPDATE admin
            SET
                full_name=?,
                phone=?,
                username=?,
                password=?,
                email=?
            WHERE admin_id=?
            `,
      [full_name, phone, username, password, email, id],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM admin WHERE admin_id=?", [
      id,
    ]);

    return result;
  }
}

module.exports = Admin;
