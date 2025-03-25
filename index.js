require("dotenv").config(); // Ensure environment variables are loaded
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lkiq.mongodb.net/?retryWrites=true&w=majority`;

// Create MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("connected to MongoDB!");

    app.get("/", (req, res) => {
      res.send("Hello from server");
    });
    // collections
    const usersCollection = client.db("visaNav").collection("users");
    const visasCollection = client.db("visaNav").collection("visas");
    const applicationsCollection = client
      .db("visaNav")
      .collection("applications");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
