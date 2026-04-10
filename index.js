const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dios5i3.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const staffCollection = client.db("alAminShopDb").collection("stafs");

        // স্টাফ ডাটা সেভ করা
        app.post('/stafs', async (req, res) => {
            const item = req.body;
            const result = await staffCollection.insertOne(item);
            res.send(result);
        });

        // স্টাফ ডাটা গেট করা
        app.get('/stafs', async (req, res) => {
            const result = await staffCollection.find().toArray();
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB! ✅");
    } catch (error) {
        console.error("MongoDB Connection Error: ", error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Jewellers shop is running 🚀');
});

app.listen(port, () => {
    console.log(`JEWELLERS Shop running on port ${port}`);
});