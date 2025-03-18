const bcrypt = require("bcryptjs");
const { Client } = require("pg");
const fs = require('node:fs');
const path = require('path');
require('dotenv').config();

const dirName = path.join(path.dirname(__filename),"..","model/data")

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS mem_users (
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR ( 255 ),
   email VARCHAR ( 255 ) UNIQUE,
   password VARCHAR ( 255 ),
   member VARCHAR
);
`

const CREATE_POSTS = `
CREATE TABLE IF NOT EXISTS mem_posts (
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   user_id INTEGER REFERENCES mem_users(id),
   title VARCHAR ( 128 ),
   body VARCHAR,
   posted TIMESTAMP default CURRENT_TIMESTAMP
);
`

const CREATE_SESSIONS = `
CREATE TABLE IF NOT EXISTS "mem_sessions" (
  "sid" varchar PRIMARY KEY NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "mem_sessions" ("expire");
`

// Insert entries into the db - Read the files synchronously to enable insertion sequentially.
let insertUSERS;
let insertPOSTS;

async function loadUsers() {
  try {
    const data = fs.readFileSync(`${dirName}/users.json`, 'utf8');
    const users = JSON.parse(data);
    const promises = users.map(
        async ({ username, email, password }) => {
          const hashedPassword = await bcrypt.hash(password, 10);
          return `('${username}', '${email}', '${hashedPassword}')`
        }
    );
    const values = await Promise.all(promises);
    
    insertUSERS = `
      INSERT INTO mem_users (username, email, password) 
      VALUES ${values.join(", \n")};`;
    
  } catch (err) {
    console.error(err);
  }
}


try {
  const data = fs.readFileSync(`${dirName}/posts.json`, 'utf8');
  const posts = JSON.parse(data);
  const values = posts.map(
      ({ user_id, title, body }) => 
        `('${user_id}', '${title}', '${body}')`
  );

  insertPOSTS = `
    INSERT INTO mem_posts (user_id, title, body) 
    VALUES ${values.join(", \n")};`;
  
} catch (err) {
  console.error(err);
}


async function main() {
  console.log("populating db...");
  loadUsers();
  const client = new Client({connectionString: process.env.DBURI});
  await client.connect();
  await client.query(CREATE_USERS);
  await client.query(CREATE_POSTS);
  await client.query(CREATE_SESSIONS);
  await client.query(insertUSERS);
  await client.query(insertPOSTS);
  await client.end();
  console.log("table creation completed");
}

main();