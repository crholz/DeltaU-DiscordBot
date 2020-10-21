const MongoClient = require("mongodb");

const dburl = process.env.DB_URL;

const dbClient =  new MongoClient(dburl);

MongoClient.connect(dburl, function(err, db) {
    if (err) throw err;
    console.log("Connected to database.");
});