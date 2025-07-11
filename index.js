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
    const CarouseCollection = db.collection("carouse");

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

    //CarouseCollection routes
    app.post("/api/carouse", async (req, res) => {
      try {
        const { title, description, image } = req.body;

        const carouse = {
          title,
          description,
          image,
          createdAt: new Date(), // optional timestamp
        };

        const result = await CarouseCollection.insertOne(carouse);
        res.status(201).json({ insertedId: result.insertedId, ...carouse });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to insert data", message: error.message });
      }
    });

    app.get("/api/carouse", async (req, res) => {
      try {
        const carouse = await CarouseCollection.find().toArray();
        res.status(200).json(carouse);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch carouse", message: error.message });
      }
    });

    // Update a carousel item (PUT for full update, PATCH for partial)
    app.put("/api/carouse/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const Data = req.body;

        const updateData = {};
        if (Data.title !== undefined) updateData.title = Data.title;
        if (Data.description !== undefined)
          updateData.description = Data.description;
        if (Data.image !== undefined) updateData.image = Data.image;

        // Validate ID format
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await CarouseCollection.findOneAndUpdate(
          { _id: id ? new ObjectId(id) : null },
          { $set: updateData },
          { returnDocument: "after" } // Returns the updated document
        );

        if (!result.value) {
          return res.status(404).json({ error: "Carousel item not found" });
        }

        res.status(200).json(result.value);
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({
          error: "Failed to update carousel item",
          message: error.message,
        });
      }
    });

    // Delete a carousel item
    app.delete("/api/carouse/:id", async (req, res) => {
      try {
        const { id } = req.params;

        // Validate ID format
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            error: "Invalid ID format",
          });
        }

        const result = await CarouseCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            error: "Carousel item not found",
          });
        }

        res.status(200).json({
          success: true,
          data: result.value,
          message: "Carousel item deleted successfully",
        });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to delete carousel item",
          message: error.message,
        });
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
