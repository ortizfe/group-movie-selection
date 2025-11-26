const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

app.use(express.json());

const uri = `mongodb+srv://${username}:${password}@bytestack-llc.jrl18.mongodb.net/?appName=bytestack-llc`;
const databaseName = "group_movie_selection";
let db = "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    // Assign the database to the global variable
    db = client.db(databaseName);

    // Only start listening after the DB is connected
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit if we can't connect
  }
}

startServer();

app.get("/", (req, res) => {
  res.send("Hello bitch");
});

app.get("/movies", async (req, res) => {
  try {
    // 2. Use the existing global 'db' connection
    const collection = db.collection("movie_list");

    // 3. Use .limit(5) to get only the first 5
    const movies = await collection.find({}).limit(5).toArray();

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching results");
  }
  // DO NOT close the client here. Keep it open for the next request.
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
