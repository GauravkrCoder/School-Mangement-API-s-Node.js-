const {
    Client
} = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'Super Survey DB'
})

client.on("connect", () => {
    console.log("Database connected")
})

client.on("end", () => {
    console.log("End connection")
})

module.exports = client;