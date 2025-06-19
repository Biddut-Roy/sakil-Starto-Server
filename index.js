require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("Sakil-Starto");
    const BlogCollection = db.collection("Blog");

    app.post("/api/events", async (req, res) => {
      try {
        const { title, description, time, bg_img, img } = req.body;

        const event = {
          title,
          description,
          time,
          bg_img,
          img,
          dateTime: new Date(),
        };

        const result = await BlogCollection.insertOne(event);
        res.status(201).json({ insertedId: result.insertedId, ...event });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to insert data", message: error.message });
      }
    });

    // GET route to fetch all events
    app.get("/api/events", async (req, res) => {
      try {
        const events = await BlogCollection.find().toArray();
        res.status(200).json(events);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch events", message: error.message });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
