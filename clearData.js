require("dotenv").config(); // Load environment variables from .env file
const { MongoClient } = require("mongodb");

// Construct the MongoDB connection string using environment variables
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2abpe.mongodb.net/Fiction?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function clearData() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("Fiction"); // Ensure this matches your database name

    // Clear all collections
    const collections = [
      "AllBooks",
      "Fiction_Books",
      "Science_Books",
      "History_Books",
      "NonFiction_Books",
      "BorrowedBooks", // Include if you have a BorrowedBooks collection
    ];

    for (const collectionName of collections) {
      const collection = database.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(
        `Cleared ${result.deletedCount} documents from ${collectionName}`
      );
    }

    console.log("All books cleared successfully.");
  } catch (err) {
    console.error("Error clearing data:", err);
  } finally {
    // Close the connection
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the script
clearData().catch(console.error);
