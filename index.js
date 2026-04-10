const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ObjectId } = require('mongodb');
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
        const staffCollection = client.db("alAminShopDb").collection("staffs");
        const usersCollection = client.db("alAminShopDb").collection("users");

        app.post('/jwt', async (req, res) => {
            const { email } = req.body;

            const token = jwt.sign(
                { email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            res.send({ token });
        });

        // user save
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send({ success: true, result });
        });

        // verify token middleware
        const verifyToken = (req, res, next) => {
            const authHeader = req.headers.authorization;

            if (!authHeader) return res.status(401).send({ message: 'unauthorized' });

            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) return res.status(403).send({ message: 'forbidden' });

                req.decoded = decoded;
                next();
            });
        };

        // স্টাফ ডাটা সেভ করা
        app.post('/staffs', async (req, res) => {
            const item = req.body;
            const result = await staffCollection.insertOne(item);
            res.send(result);
        });

        // স্টাফ ডাটা গেট করা
        app.get('/staffs', async (req, res) => {
            const result = await staffCollection.find().toArray();
            res.send(result);
        });

        // UPDATE staff
        app.put('/staffs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: updatedData
            };

            const result = await staffCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.get('/staffs/:id', async (req, res) => {
            const id = req.params.id;
            const result = await staffCollection.findOne({ _id: new ObjectId(id) });
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