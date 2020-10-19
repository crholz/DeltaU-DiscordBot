const {MongoClient} = require("mongodb");

const dburl = process.env.DB_URL;

const dbClient =  new MongoClient(dburl);

async function runDB() {
    try {
            await dbClient.connect();

            const database = client.db('inviteToRole');
    }

    // DB = inviteRole
    // coll = inviteTable

    finally {
        await clientInformation.close()
    }
}