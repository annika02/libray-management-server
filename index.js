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
    console.log("Successfully connected to MongoDB!");

    // Access the database and collections
    const database = client.db("visaNavigator");
    const usersCollection = database.collection("users");

    // API Route to test MongoDB connection
    app.get("/", (req, res) => {
      res.send("Hello from Visa Navigator server!");
    });

    // Example: Add a new user (POST request)
    app.post("/add-user", async (req, res) => {
      try {
        const newUser = req.body; // Get user data from request body
        const result = await usersCollection.insertOne(newUser);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Failed to add user");
      }
    });

    // Example: Fetch all users (GET request)
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.status(200).send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Failed to fetch users");
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
