dotenv.config();
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
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
          role: "user",
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

    //login user and generate jwt
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await usersCollection.findOne({
          email,
        });

        if (!user) {
          return res.status(404).json({
            message: "User not found!",
          });
        }

        const isMatchedPassword = await bcrypt.compare(password, user.password);

        if (!isMatchedPassword) {
          return res.status(400).json({
            message: "Password incorrect!",
          });
        }

        const token = jwt.sign(
          {
            email: user.email,
            _id: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" }
        );

        res.status(200).json({
          message: "Logged in successfully!",
          token,
        });
      } catch (err) {
        console.log(err);
        res.status(400).json({
          message: "Login failed!",
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
