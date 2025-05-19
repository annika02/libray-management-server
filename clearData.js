require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2abpe.mongodb.net/Fiction?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function clearData() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("Fiction");

    const collections = [
      "AllBooks",
      "Fiction_Books",
      "Science_Books",
      "History_Books",
      "Non_Fiction", // Corrected from NonFiction_Books
      "BorrowedBooks",
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
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

clearData().catch(console.error);
