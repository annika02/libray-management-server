require("dotenv").config(); // Ensure environment variables are loaded
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

    // Get All Users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      const user = await usersCollection.findOne({ email });
      res.json(user);
    });

    // Register User
    app.post("/register", async (req, res) => {
      const { name, email, photoURL } = req.body;
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      const newUser = { name, email, photoURL, createdAt: new Date() };
      const result = await usersCollection.insertOne(newUser);
      res.json(result);
    });

    // Get User by Email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.json(user);
    });

    // Get All Visas
    app.get("/all-visas", async (req, res) => {
      const visas = await visasCollection.find().toArray();
      res.json(visas);
    });

    app.get("/latest-visas", async (req, res) => {
      const latestVisas = await visasCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.json(latestVisas);
    });

    // Get visas added by the logged-in user
    app.get("/my-visas/:email", async (req, res) => {
      const email = req.params.email;
      const visas = await visasCollection.find({ createdBy: email }).toArray();
      res.json(visas);
    });

    // Add a New Visa
    app.post("/add-visa", async (req, res) => {
      const visa = req.body;
      visa.createdAt = new Date();
      const result = await visasCollection.insertOne(visa);
      res.json(result);
    });

    // Get Visa by ID
    app.get("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const visa = await visasCollection.findOne({ _id: new ObjectId(id) });
      res.json(visa);
    });

    // Update Visa
    app.patch("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await visasCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json(result);
    });

    // Delete Visa
    app.delete("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const result = await visasCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // Apply for a Visa
    app.post("/apply", async (req, res) => {
      const application = req.body;
      if (!application.email) {
        return res.status(400).json({ error: "User email is required" });
      }
      application.appliedAt = new Date();
      application.status = "Pending";
      const result = await applicationsCollection.insertOne(application);
      res.json(result);
    });

    // Get All Applications for a User
    app.get("/applications/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const applications = await applicationsCollection
          .find({ email })
          .toArray();
        res.json(applications);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch applications" });
      }
    });

    // Cancel Visa Application
    app.delete("/application/:id", async (req, res) => {
      const id = req.params.id;
      const result = await applicationsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// Start Express server
module.exports = app;
