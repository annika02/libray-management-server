const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "https://assignment-11-e2b7f.web.app",
      "assignment-11-e2b7f.firebaseapp.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2abpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Define Collections
    const Books = client.db("Fiction");
    const FictionCollection = Books.collection("Fiction_Books");
    const ScienceCollection = Books.collection("Science_Books");
    const HistoryCollection = Books.collection("History_Books");
    const NonFictionCollection = Books.collection("Non_Fiction");
    const BorrowedBookss = Books.collection("BorrowedBooks");
    const AllBooks = Books.collection("AllBooks");

    // Category mapping to match collection names
    const categoryToCollection = {
      fiction: FictionCollection,
      science: ScienceCollection,
      history: HistoryCollection,
      "non-fiction": NonFictionCollection,
      nonfiction: NonFictionCollection,
    };

    // Normalize category to match backend routes
    const normalizeCategory = (category) => {
      if (!category) return "fiction";
      const normalized = category.toLowerCase().replace(/\s|-/g, "");
      return categoryToCollection.hasOwnProperty(normalized)
        ? normalized
        : "fiction";
    };

    // Routes
    app.get("/", async (req, res) => {
      res.send("Server running successfully!");
    });

    app.get("/fiction", async (req, res) => {
      const booksColl = await FictionCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/fiction/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await FictionCollection.findOne(query);
      res.send(result);
    });

    app.get("/science", async (req, res) => {
      const booksColl = await ScienceCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/science/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ScienceCollection.findOne(query);
      res.send(result);
    });

    app.get("/history", async (req, res) => {
      const booksColl = await HistoryCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/history/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await HistoryCollection.findOne(query);
      res.send(result);
    });

    app.get("/nonfiction", async (req, res) => {
      const booksColl = await NonFictionCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/non-fiction/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await NonFictionCollection.findOne(query);
      res.send(result);
    });

    app.get("/allbooks", async (req, res) => {
      const allbooks = await AllBooks.find().toArray();
      res.send(allbooks);
    });

    app.get("/allbooks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllBooks.findOne(query);
      res.send(result);
    });

    // PATCH endpoint to decrement book quantity
    app.patch("/:category/:id/borrow", async (req, res) => {
      const { category, id } = req.params;
      const collections = {
        fiction: FictionCollection,
        science: ScienceCollection,
        history: HistoryCollection,
        nonfiction: NonFictionCollection,
      };

      const collection = collections[category.toLowerCase()];

      if (!collection) {
        return res.status(400).send({ error: "Invalid category" });
      }

      const query = { _id: new ObjectId(id) };
      const update = { $inc: { quantity: -1 } };

      try {
        const result = await collection.updateOne(query, update);
        if (result.modifiedCount > 0) {
          res
            .status(200)
            .send({ message: "Book quantity updated successfully" });
        } else {
          res
            .status(404)
            .send({ error: "Book not found or already out of stock" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to update book quantity" });
      }
    });

    app.patch("/:category/:id/return", async (req, res) => {
      const { category, id } = req.params;
      console.log(category, id);
      const collections = {
        fiction: FictionCollection,
        science: ScienceCollection,
        history: HistoryCollection,
        nonfiction: NonFictionCollection,
      };

      const collection = collections[category.toLowerCase()];

      if (!collection) {
        return res.status(400).send({ error: "Invalid category" });
      }

      const query = { _id: new ObjectId(id) };
      const update = { $inc: { quantity: 1 } };

      try {
        const result = await collection.updateOne(query, update);
        if (result.modifiedCount > 0) {
          res
            .status(200)
            .send({ message: "Book quantity updated successfully" });
        } else {
          res
            .status(404)
            .send({ error: "Book not found or already out of stock" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to update book quantity" });
      }
    });

    app.post("/borrow", async (req, res) => {
      const borrowedBooks = req.body;
      const result = await BorrowedBookss.insertOne(borrowedBooks);
      res.send(result);
    });

    app.get("/borrow", async (req, res) => {
      const borrowList = await BorrowedBookss.find().toArray();
      res.send(borrowList);
    });

    app.get("/borrow/:id", async (req, res) => {
      const id = req.params.id;

      // Query using the string _id directly
      const query = { _id: id };

      try {
        const result = await BorrowedBookss.findOne(query);
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Borrowed item not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to retrieve borrowed item" });
      }
    });

    app.delete("/borrow/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      try {
        const result = await BorrowedBookss.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
          res.status(200).send({ message: "Book deleted successfully" });
        } else {
          res.status(404).send({ message: "Book not found" });
        }
      } catch (error) {
        console.error("Error deleting the book:", error);
        res.status(500).send({ message: "Failed to delete the book" });
      }
    });

    app.put("/allbooks/:id", async (req, res) => {
      const { id } = req.params;
      const { image, name, author, category, rating } = req.body;

      if (!image || !name || !author || !category || !rating) {
        return res.status(400).send({ error: "All fields are required" });
      }

      const query = { _id: new ObjectId(id) };

      // Update the book details
      const updateDoc = {
        $set: {
          image,
          name,
          author,
          category,
          rating,
        },
      };
      const result = await AllBooks.updateOne(query, updateDoc);
      res.send(result);
    });

    app.post("/allbooks", async (req, res) => {
      const myaddedBooks = req.body;
      const category = normalizeCategory(myaddedBooks.category);

      // Insert into AllBooks
      const result = await AllBooks.insertOne(myaddedBooks);
      console.log(`Added to AllBooks:`, result.insertedId);

      // Insert into the corresponding category collection
      const CategoryCollection = categoryToCollection[category];
      if (CategoryCollection) {
        const categoryResult = await CategoryCollection.insertOne({
          ...myaddedBooks,
          _id: result.insertedId, // Ensure the _id matches
        });
        console.log(
          `Added to ${category} collection:`,
          categoryResult.insertedId
        );
      } else {
        console.error(`No collection found for category: ${category}`);
      }

      res.status(201).send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.listen(port, () => {
      console.log(`Library server running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);
