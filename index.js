const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// Paste your Atlas connection string here
const uri =
  "mongodb+srv://Anika:PowerPuffgirls@cluster0.dj2abpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World from MongoDB Atlas!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
