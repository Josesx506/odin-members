const pool = require('../config/pool');

async function isUserAvail(emailValue) {
  const { rows } = await pool.query("SELECT email FROM mem_users WHERE email = $1",[emailValue]);
  return rows.length === 0;
}

async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM mem_users WHERE email = $1", [email]);
  return rows;
}

async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM mem_users WHERE id = $1", [id]);
  return rows;
}

async function updateUserStatus(id,membership) {
  await pool.query(`
    UPDATE mem_users 
    SET member = $1 
    WHERE id = $2`, [membership.toLowerCase(),id]);
}

async function registerUser(username,email,hashedPassword) {
  const { rows } = await pool.query("INSERT INTO mem_users (username, email, password) VALUES ($1, $2, $3) RETURNING *", 
    [ username,email,hashedPassword,]);
  return rows;
}

async function getDBPosts() {
  const { rows } = await pool.query(`
    SELECT mem_posts.id AS post_id, title, body, posted, username FROM mem_posts
    JOIN mem_users ON mem_posts.user_id=mem_users.id
    ORDER BY posted DESC;`);
  return rows;
}

async function getDBPostsLimit(limit) {
  const { rows } = await pool.query(`
    SELECT mem_posts.id AS post_id, title, body, posted, username FROM mem_posts
    JOIN mem_users ON mem_posts.user_id=mem_users.id
    ORDER BY posted DESC LIMIT $1;`, [limit]);
  return rows;
}

async function getPostsByUserId(userId) {
  const { rows } = await pool.query(`
    SELECT * FROM mem_posts WHERE user_id = $1 ORDER BY posted DESC;`, [userId]);
  return rows;
}

async function createPost(userId,title,body) {
  await pool.query(`
    INSERT INTO mem_posts (user_id, title, body) VALUES ($1, $2, $3);`, 
    [ userId,title,body ]);
}

async function deletePost(postId) {
  await pool.query(`DELETE FROM mem_posts WHERE id=$1`, [postId]);
}

module.exports = { 
  isUserAvail, findUserByEmail, findUserById, registerUser, 
  updateUserStatus,getDBPosts,getDBPostsLimit,getPostsByUserId,
  createPost,deletePost
}