const db = require("../config/db");

class Sender {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM sender");

    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT s.*, 
             
        (SELECT AVG(score) FROM rating WHERE rated_user = 'sender' AND sender_id = s.sender_id) as avg_rating

       FROM sender s WHERE s.sender_id = ?`,
      [id]
    );
    return rows[0];
  }



  static async getByEmail(email) {
  const [rows] = await db.execute(
    "SELECT * FROM sender WHERE email = ?",
    [email],
  );

  return rows[0];
}

  static async create(data) {
    const {
      admin_id,
      full_name,
      phone,
      username,
      password,
      email,
      city,
      street,
      alley,
      house_number,
    } = data;

    const [result] = await db.execute(
      `
            INSERT INTO sender
            (
                admin_id,
                full_name,
                phone,
                username,
                password,
                email,
                city,
                street,
                alley,
                house_number
            )
            VALUES (?,?,?,?,?,?,?,?,?,?)
            `,
      [
        admin_id,
        full_name,
        phone,
        username,
        password,
        email,
        city,
        street,
        alley,
        house_number,
      ],
    );

    return result;
  }

  static async update(id, data) {
    const {
      admin_id,
      full_name,
      phone,
      username,
      password,
      email,
      city,
      street,
      alley,
      house_number,
    } = data;

    const [result] = await db.execute(
      `
            UPDATE sender
            SET
                admin_id=?,
                full_name=?,
                phone=?,
                username=?,
                password=?,
                email=?,
                city=?,
                street=?,
                alley=?,
                house_number=?
            WHERE sender_id=?
            `,
      [
        admin_id,
        full_name,
        phone,
        username,
        password,
        email,
        city,
        street,
        alley,
        house_number,
        id,
      ],
    );

    return result;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM sender WHERE sender_id=?", [
      id,
    ]);

    return result;
  }
}

module.exports = Sender;
