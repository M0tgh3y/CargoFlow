const db = require("../config/db");

const createUser = async (email, password) => {
  const sql = `
    INSERT INTO users (email, password)
    VALUES (?, ?)
  `;

  const [result] = await db.execute(sql, [email, password]);

  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0];
};

const updateRole = async (userId, role) => {
  const [result] = await db.execute(
    "UPDATE users SET role = ? WHERE user_id = ?",
    [role, userId]
  );
  return result;
};

module.exports = {
  createUser,
  findUserByEmail,
  updateRole,
};

