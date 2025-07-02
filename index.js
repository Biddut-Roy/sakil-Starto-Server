require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
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
    const NewsCollection = db.collection("News");

    app.post("/api/events", async (req, res) => {
      try {
        const { title, description, time, url, img, logoUrl } = req.body;

        const event = {
          title,
          description,
          time,
          url,
          logoUrl,
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

    app.put("/api/events/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.dateTime) {
          updateData.dateTime = new Date(updateData.dateTime);
        }

        const result = await BlogCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: "after" }
        );

        if (!result.value) {
          return res.status(404).json({ error: "Event not found" });
        }

        res.json(result.value);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to update event", message: error.message });
      }
    });

    // Delete event by ID
    app.delete("/api/events/:id", async (req, res) => {
      try {
        const { id } = req.params;
        console.log(`Deleting event with ID: ${new ObjectId(id)}`);

        const result = await BlogCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event deleted successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to delete event", message: error.message });
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

    // get event by ID
    app.get("/api/events/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Validate and convert to ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const event = await BlogCollection.findOne({ _id: new ObjectId(id) });

        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }

        res.status(200).json(event);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch event", message: error.message });
      }
    });

    app.post("/api/news", async (req, res) => {
      try {
        const { tag, tagColor, title, description, image } = req.body;

        const news = {
          tag,
          tagColor,
          title,
          description,
          image,
          createdAt: new Date(), // optional timestamp
        };

        const result = await NewsCollection.insertOne(news); // make sure NewsCollection is defined properly
        res.status(201).json({ insertedId: result.insertedId, ...news });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to insert data", message: error.message });
      }
    });

    // get news by ID
    app.get("/api/news/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Validate and convert to ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const news = await NewsCollection.findOne({ _id: new ObjectId(id) });

        if (!news) {
          return res.status(404).json({ error: "News not found" });
        }

        res.status(200).json(news);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch news", message: error.message });
      }
    });

    // GET route to fetch all news
    app.get("/api/news", async (req, res) => {
      try {
        const news = await NewsCollection.find().toArray();
        res.status(200).json(news);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch news", message: error.message });
      }
    });

    // Update News by ID
    app.patch("/api/news/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { title, image } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (image !== undefined) updateData.image = image;

        const result = await NewsCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: "after" }
        );

        if (!result.value) {
          return res.status(404).json({ error: "News not found" });
        }

        res.json(result.value);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to update news", message: error.message });
      }
    });

    // Delete News by ID
    app.delete("/api/news/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const result = await NewsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "News not found" });
        }

        res.json({ message: "News deleted successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to delete news", message: error.message });
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
