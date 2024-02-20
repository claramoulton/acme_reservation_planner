const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_db');

const createTables = async()=> {
    const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE reservations(
        id UUID PRIMARY KEY,
        reservation_date DATE NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
    );
    `;
    await client.query(SQL);
    
};

const createCustomer = async({ name })=> {
    const SQL = `
        INSERT INTO customers(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createRestaurant = async({ name })=> {
    const SQL = `
        INSERT INTO restaurants(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const fetchCustomers = async()=> {
    const SQL = `
        SELECT *
        FROM customers
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchRestaurants = async()=> {
    const SQL = `
        SELECT *
        FROM restaurants
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchReservations = async(customer_id)=> {
    const SQL = `
        SELECT *
        FROM reservations
        WHERE customer_id = $1
    `;
    const response = await client.query(SQL, [customer_id ]);
    return response.rows;
};

const destroyReservation = async(reservation)=> {
    const SQL = `
        DELETE FROM reservations
        WHERE id=$1 AND customer_id=$2
    `;
    await client.query(SQL, [reservation.id, reservation.customer_id]);
    
};

const createReservation = async({ reservation_date, party_count, customer_id, restaurant_id })=> {
    const SQL = `
        INSERT INTO reservations(id, reservation_date, party_count, customer_id, restaurant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const response = await client.query(SQL, [
        uuid.v4(),
        reservation_date,
        party_count,
        customer_id,
        restaurant_id
    ]);
    return response.rows[0];
};


module.exports = {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    createReservation,
    destroyReservation
};