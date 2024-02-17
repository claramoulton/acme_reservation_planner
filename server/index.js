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

const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to dataase');
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
    const vacation = await createVacation({
        departure_date: '03/15/2024',
        place_id: dallas.id,
        user_id: lucy.id
    });
    console.log(await fetchVacations(lucy.id));
    await destroyVacation(vacation);
    console.log(await fetchVacations(lucy.id));
};


init();
