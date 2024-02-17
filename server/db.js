const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_travel_db');

const createTables = async()=> {
    const SQL = `
    DROP TABLE IF EXISTS vacations;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS places;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE places(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE vacations(
        id UUID PRIMARY KEY,
        departure_date DATE NOT NULL,
        place_id UUID REFERENCES places(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL
    );
    `;
    await client.query(SQL);
    
};

const createUser = async({ name })=> {
    const SQL = `
        INSERT INTO users(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createPlace = async({ name })=> {
    const SQL = `
        INSERT INTO places(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const fetchUsers = async()=> {
    const SQL = `
        SELECT *
        FROM users
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchPlaces = async()=> {
    const SQL = `
        SELECT *
        FROM places
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchVacations = async(user_id)=> {
    const SQL = `
        SELECT *
        FROM vacations
        WHERE user_id = $1
    `;
    const response = await client.query(SQL, [user_id ]);
    return response.rows;
};

const destroyVacation = async(vacation)=> {
    const SQL = `
        DELETE FROM vacations
        WHERE id=$1 AND user_id=$2
    `;
    await client.query(SQL, [vacation.id, vacation.user_id]);
};

const createVacation = async({ departure_date, user_id, place_id })=> {
    const SQL = `
        INSERT INTO vacations(id, departure_date, user_id, place_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const response = await client.query(SQL, [
        uuid.v4(), 
        departure_date,
        user_id,
        place_id
        ]);
    return response.rows[0];
};


module.exports = {
    client,
    createTables,
    createUser,
    createPlace,
    fetchUsers,
    fetchPlaces,
    fetchVacations,
    createVacation,
    destroyVacation
};