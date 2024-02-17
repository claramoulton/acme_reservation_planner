const db = require('./db');
const client = db.client;
const createTables = db.createTables;

const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to dataase');
    await createTables();
    console.log('tables created');
};

init();
