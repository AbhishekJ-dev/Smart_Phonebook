import pg from 'pg';
const { Client } = pg;

const passwordsToTry = ['postgres', 'admin', 'root', '1234', '123456', 'password', ''];
const user = 'postgres';

async function testPasswords() {
  console.log('Testing common PostgreSQL passwords...');
  for (const pwd of passwordsToTry) {
    const client = new Client({
      user: user,
      host: 'localhost',
      database: 'postgres', // default db just to test connection
      password: pwd,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS: Password is "${pwd}"`);
      await client.end();
      return;
    } catch (err) {
      console.log(`FAILED: Password "${pwd}"`);
    }
  }
  console.log('ALL FAILED. User needs to provide password.');
}

testPasswords();
