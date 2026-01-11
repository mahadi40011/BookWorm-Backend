dotenv.config();
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import cors from "cors";
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

    const db = client.db("BookWorm");
    const usersCollection = db.collection("users");

    //create a new user
    app.post("/signup", async (req, res) => {
      try {
        const { name, image, email, password } = req.body;

        const existing = await usersCollection.findOne({
          email,
        });
        if (existing) {
          return res.status(409).json({
            message: "Email already exists",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const result = await usersCollection.insertOne({
          name,
          image,
          email,
          password: hashedPassword,
        });
        res.status(201).json({
          message: "User created successfully!",
          result,
        });
      } catch (err) {
        res.status(400).json({
          message: "Failed to create user!",
          err,
        });
      }
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Server..");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
