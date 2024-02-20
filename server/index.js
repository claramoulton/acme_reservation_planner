const db = require('./db');
const client = db.client;
const createTables = db.createTables;
const createCustomer = db.createCustomer;
const createRestaurant = db.createRestaurant;
const fetchCustomers = db.fetchCustomers;
const fetchRestaurants = db.fetchRestaurants;
const createReservation = db.createReservation;
const fetchReservations = db.fetchReservations;
const destroyReservation = db.destroyReservation;
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers', async(req, res, next)=> {
    try {
        res.send(await fetchCustomers());    
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/restaurants', async(req, res, next)=> {
    try {
        res.send(await fetchRestaurants());    
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/customers/:id/reservations', async(req, res, next)=> {
    try {
        res.send(await fetchReservations(req.params.id));    
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/customers/:customer_id/reservations', async(req, res, next)=> {
    try {
        res.status(201).send(await createReservation({
            customer_id: req.params.customer_id,
            restaurant_id: req.body.restaurant_id,
            party_count: req.body.party_count,
            reservation_date: req.body.reservation_date
        }));    
    }
    catch(ex){
        next(ex);
    }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next)=> {
    try {
        await destroyReservation({ customer_id: req.params.customer_id, id: req.params.id });
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

app.use((err, req, res, next)=> {
    res.status(err.status || 500).send({error: err.message || err});
});

const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    const [moe, lucy, ethyl, Absolute_Bakery, WildEdge_Brewery, Columbine_Bar_and_Grill, The_Boathouse] = await Promise.all([
        createCustomer({ name: 'moe'}),
        createCustomer({ name: 'lucy'}),
        createCustomer({ name: 'ethyl'}),
        createRestaurant({ name: 'Absolute_Bakery'}),
        createRestaurant({ name: 'WildEdge_Brewery'}),
        createRestaurant({ name: 'Columbine_Bar_and_Grill'}),
        createRestaurant({ name: 'The_Boathouse'}),
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());
    let reservation = await createReservation({
        reservation_date: '03/15/2024',
        party_count: '5',
        restaurant_id: The_Boathouse.id,
        customer_id: lucy.id
    });
    console.log(await fetchReservations(lucy.id));
    await destroyReservation(reservation);
    console.log(await fetchReservations(lucy.id));
    reservation = await createReservation({
        reservation_date: '03/19/2024',
        party_count: '2'
        restaurant_id: WildEdge_Brewery.id,
        customer_id: lucy.id
    });
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log(`curl localhost:${port}/api/customers`);
        console.log(`curl localhost:${port}/api/restaurants`);
        console.log(`curl localhost:${port}/api/customers/${lucy.id}/reservations`);
        console.log(`curl -X DELETE localhost:${port}/api/customers/${lucy.id}/reservations/${reservation.id}`);
        console.log(`curl localhost:${port}/api/customers/${moe.id}/reservations`);
        console.log(`curl -X POST localhost:${port}/api/customers/${moe.id}/reservations -d '{"restaurant_id":"${Columbine_Bar_and_Grill.id}", "party_count": "7", "reservation_date": "04/01/2024"}' -H "Content-Type:application/json" -v`);
    });
};


init();
