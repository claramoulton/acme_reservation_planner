const db = require('./db');
const client = db.client;
const createTables = db.createTables;
const createUser = db.createUser;
const createPlace = db.createPlace;
const fetchUsers = db.fetchUsers;
const fetchPlaces = db.fetchPlaces;
const createVacation = db.createVacation;
const fetchVacations = db.fetchVacations;
const destroyVacation = db.destroyVacation;
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async(req, res, next)=> {
    try {
        res.send(await fetchUsers());    
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/places', async(req, res, next)=> {
    try {
        res.send(await fetchPlaces());    
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/users/:id/vacations', async(req, res, next)=> {
    try {
        res.send(await fetchVacations(req.params.id));    
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/users/:user_id/vacations', async(req, res, next)=> {
    try {
        res.status(201).send(await createVacation({
            user_id: req.params.user_id,
            place_id: req.body.place_id,
            departure_date: req.body.departure_date
        }));    
    }
    catch(ex){
        next(ex);
    }
});

app.delete('/api/users/:user_id/vacations/:id', async(req, res, next)=> {
    try {
        await destroyVacation({ user_id: req.params.user_id, id: req.params.id });
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
    const [moe, lucy, ethyl, rome, dallas, paris, nyc] = await Promise.all([
        createUser({ name: 'moe'}),
        createUser({ name: 'lucy'}),
        createUser({ name: 'ethyl'}),
        createPlace({ name: 'rome'}),
        createPlace({ name: 'dallas'}),
        createPlace({ name: 'paris'}),
        createPlace({ name: 'nyc'}),
    ]);
    console.log(await fetchUsers());
    console.log(await fetchPlaces());
    let vacation = await createVacation({
        departure_date: '03/15/2024',
        place_id: dallas.id,
        user_id: lucy.id
    });
    console.log(await fetchVacations(lucy.id));
    await destroyVacation(vacation);
    console.log(await fetchVacations(lucy.id));
    vacation = await createVacation({
        departure_date: '03/19/2024',
        place_id: paris.id,
        user_id: lucy.id
    });
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log(`curl localhost:${port}/api/users`);
        console.log(`curl localhost:${port}/api/places`);
        console.log(`curl localhost:${port}/api/users/${lucy.id}/vacations`);
        console.log(`curl -X DELETE localhost:${port}/api/users/${lucy.id}/vacations/${vacation.id}`);
        console.log(`curl localhost:${port}/api/users/${moe.id}/vacations`);
        console.log(`curl -X POST localhost:${port}/api/users/${moe.id}/vacations -d '{"place_id":"${nyc.id}", "departure_date": "04/01/2024"}' -H "Content-Type:application/json" -v`);
    });
};


init();
