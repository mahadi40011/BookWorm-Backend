dotenv.config();
import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
const app = express();
const port = process.env.PORT || "3000";
const client = new MongoClient(process.env.MONGODB_URI);

// middleware
app.use(
  cors({
    origin: [process.env.CLIENT_DOMAIN],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

async function run() {
  try {
    await client.connect();
    console.log("Database connected!!!");

    const db = client.db("backend_session");
    const usersCollection = db.collection("users");


  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
