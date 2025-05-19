const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Enhanced CORS Middleware
const allowedOrigins = [
  "https://assignment-11-e2b7f.web.app",
  "https://assignment-11-e2b7f.firebaseapp.com",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS Origin:", origin);
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Middleware to normalize URLs and log requests
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, "/");
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || allowedOrigins[0]
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight for:", req.url);
    return res.sendStatus(204);
  }
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Prevent redirects
app.use((req, res, next) => {
  res.redirect = (status, url) => {
    console.log(`Blocked redirect to ${url} with status ${status}`);
    res.status(status).send({ error: "Redirects are disabled" });
  };
  next();
});

app.use(express.json());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2abpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const Books = client.db("Fiction");
    const FictionCollection = Books.collection("Fiction_Books");
    const ScienceCollection = Books.collection("Science_Books");
    const HistoryCollection = Books.collection("History_Books");
    const NonFictionCollection = Books.collection("Non_Fiction");
    const BorrowedBookss = Books.collection("BorrowedBooks");
    const AllBooks = Books.collection("AllBooks");

    const categoryToCollection = {
      fiction: FictionCollection,
      science: ScienceCollection,
      history: HistoryCollection,
      "non-fiction": NonFictionCollection,
      nonfiction: NonFictionCollection,
    };

    const normalizeCategory = (category) => {
      if (!category) return "fiction";
      const normalized = category.toLowerCase().replace(/\s|-/g, "");
      return categoryToCollection.hasOwnProperty(normalized)
        ? normalized
        : "fiction";
    };

    app.get("/", async (req, res) => {
      console.log("Root endpoint hit");
      res.send("Server running successfully!");
    });

    app.get("/fiction", async (req, res) => {
      console.log("Fetching fiction books");
      const booksColl = await FictionCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/fiction/:id", async (req, res) => {
      console.log(`Fetching fiction book with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await FictionCollection.findOne(query);
      res.send(result || { error: "Book not found" });
    });

    app.get("/science", async (req, res) => {
      console.log("Fetching science books");
      const booksColl = await ScienceCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/science/:id", async (req, res) => {
      console.log(`Fetching science book with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ScienceCollection.findOne(query);
      res.send(result || { error: "Book not found" });
    });

    app.get("/history", async (req, res) => {
      console.log("Fetching history books");
      const booksColl = await HistoryCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/history/:id", async (req, res) => {
      console.log(`Fetching history book with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await HistoryCollection.findOne(query);
      res.send(result || { error: "Book not found" });
    });

    app.get("/nonfiction", async (req, res) => {
      console.log("Fetching nonfiction books");
      const booksColl = await NonFictionCollection.find().toArray();
      res.send(booksColl);
    });

    app.get("/nonfiction/:id", async (req, res) => {
      console.log(`Fetching nonfiction book with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await NonFictionCollection.findOne(query);
      res.send(result || { error: "Book not found" });
    });

    app.get("/allbooks", async (req, res) => {
      console.log("Fetching all books");
      const allbooks = await AllBooks.find().toArray();
      res.send(allbooks);
    });

    app.get("/allbooks/:id", async (req, res) => {
      console.log(`Fetching all book with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllBooks.findOne(query);
      res.send(result || { error: "Book not found" });
    });

    app.patch("/:category/:id/borrow", async (req, res) => {
      console.log(`Borrow request for ${req.params.category}/${req.params.id}`);
      const { category, id } = req.params;
      const { quantityToBorrow } = req.body;
      const collections = {
        fiction: FictionCollection,
        science: ScienceCollection,
        history: HistoryCollection,
        nonfiction: NonFictionCollection,
      };

      const collection = collections[category.toLowerCase()];
      if (!collection)
        return res.status(400).send({ error: "Invalid category" });

      const query = { _id: new ObjectId(id) };
      try {
        const book = await collection.findOne(query);
        if (!book) return res.status(404).send({ error: "Book not found" });

        let currentQuantity = book.quantity;
        if (typeof currentQuantity === "string") {
          currentQuantity = parseInt(currentQuantity) || 0;
          await collection.updateOne(query, {
            $set: { quantity: currentQuantity },
          });
        } else if (
          !book.hasOwnProperty("quantity") ||
          typeof currentQuantity !== "number"
        ) {
          await collection.updateOne(query, { $set: { quantity: 0 } });
          currentQuantity = 0;
        }

        const borrowAmount = Number(quantityToBorrow) || 1;
        if (currentQuantity < borrowAmount) {
          return res.status(400).send({
            error: `Only ${currentQuantity} books available to borrow`,
          });
        }

        const update = { $inc: { quantity: -borrowAmount } };
        const result = await collection.updateOne(query, update);
        if (result.modifiedCount > 0) {
          await AllBooks.updateOne(query, update);
          res
            .status(200)
            .send({ message: "Book quantity updated successfully" });
        } else {
          res
            .status(404)
            .send({ error: "Book not found or already out of stock" });
        }
      } catch (error) {
        console.error("Patch /borrow error:", error);
        res.status(500).send({
          error: "Failed to update book quantity",
          details: error.message,
        });
      }
    });

    app.patch("/:category/:id/return", async (req, res) => {
      console.log(`Return request for ${req.params.category}/${req.params.id}`);
      const { category, id } = req.params;
      const { quantityToReturn } = req.body;
      const collections = {
        fiction: FictionCollection,
        science: ScienceCollection,
        history: HistoryCollection,
        nonfiction: NonFictionCollection,
      };

      const collection = collections[category.toLowerCase()];
      if (!collection)
        return res.status(400).send({ error: "Invalid category" });

      const query = { _id: new ObjectId(id) };
      try {
        const book = await collection.findOne(query);
        if (!book) return res.status(404).send({ error: "Book not found" });

        if (typeof book.quantity === "string") {
          await collection.updateOne(query, {
            $set: { quantity: parseInt(book.quantity) || 0 },
          });
        } else if (
          !book.hasOwnProperty("quantity") ||
          typeof book.quantity !== "number"
        ) {
          await collection.updateOne(query, { $set: { quantity: 0 } });
        }

        const returnAmount = Number(quantityToReturn) || 1;
        const update = { $inc: { quantity: returnAmount } };
        const result = await collection.updateOne(query, update);
        if (result.modifiedCount > 0) {
          await AllBooks.updateOne(query, update);
          res
            .status(200)
            .send({ message: "Book quantity updated successfully" });
        } else {
          res.status(404).send({ error: "Book not found" });
        }
      } catch (error) {
        console.error("Patch /return error:", error);
        res.status(500).send({
          error: "Failed to update book quantity",
          details: error.message,
        });
      }
    });

    app.post("/borrow", async (req, res) => {
      console.log("Borrow post request received");
      const borrowedBooks = req.body;
      const bookToInsert = {
        ...borrowedBooks,
        _id: new ObjectId(),
        details: borrowedBooks.details || "No details available",
        quantity: Number(borrowedBooks.quantity) || 1,
      };
      try {
        const result = await BorrowedBookss.insertOne(bookToInsert);
        res.status(201).send(result);
      } catch (error) {
        console.error("Post /borrow error:", error);
        res
          .status(500)
          .send({ error: "Failed to borrow book", details: error.message });
      }
    });

    app.get("/borrow", async (req, res) => {
      console.log("Fetching borrow list");
      const borrowList = await BorrowedBookss.find().toArray();
      res.send(borrowList);
    });

    app.get("/borrow/:id", async (req, res) => {
      console.log(`Fetching borrow item with id: ${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await BorrowedBookss.findOne(query);
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Borrowed item not found" });
        }
      } catch (error) {
        console.error("Get /borrow/:id error:", error);
        res.status(500).send({ message: "Failed to retrieve borrowed item" });
      }
    });

    app.delete("/borrow/:id", async (req, res) => {
      console.log(`Deleting borrow item with id: ${req.params.id}`);
      const { id } = req.params;
      try {
        const result = await BorrowedBookss.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.status(200).send({ message: "Book deleted successfully" });
        } else {
          res.status(404).send({ message: "Book not found" });
        }
      } catch (error) {
        console.error("Delete /borrow/:id error:", error);
        res.status(500).send({ message: "Failed to delete the book" });
      }
    });

    app.put("/allbooks/:id", async (req, res) => {
      console.log(`Updating all book with id: ${req.params.id}`);
      const { id } = req.params;
      const { image, name, author, category, rating, quantity } = req.body;

      if (!image || !name || !author || !category || !rating) {
        return res.status(400).send({ error: "All fields are required" });
      }

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          image,
          name,
          author,
          category,
          rating,
          quantity: Number(quantity) || 0,
        },
      };
      try {
        const result = await AllBooks.updateOne(query, updateDoc);
        const normalizedCategory = normalizeCategory(category);
        const CategoryCollection = categoryToCollection[normalizedCategory];
        if (CategoryCollection) {
          await CategoryCollection.updateOne(query, updateDoc);
        }
        res.send(result);
      } catch (error) {
        console.error("Put /allbooks/:id error:", error);
        res.status(500).send({ error: "Failed to update book" });
      }
    });

    app.post("/allbooks", async (req, res) => {
      console.log("Adding new book");
      const myaddedBooks = req.body;
      const category = normalizeCategory(myaddedBooks.category);

      const bookToInsert = {
        ...myaddedBooks,
        quantity: Number(myaddedBooks.quantity) || 0,
        details: myaddedBooks.details || "No details available",
      };

      const result = await AllBooks.insertOne(bookToInsert);
      const CategoryCollection = categoryToCollection[category];
      if (CategoryCollection) {
        await CategoryCollection.insertOne({
          ...bookToInsert,
          _id: result.insertedId,
        });
      }
      res.status(201).send(result);
    });

    console.log("Connected to MongoDB!");
    app.listen(port, () => {
      console.log(`Library server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
}

run().catch(console.dir);
