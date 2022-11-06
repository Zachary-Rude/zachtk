import express from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import urlExist from "url-exist";
import URL from "./models/urlModel.js";

const __dirname = path.resolve();

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public_html"));

// Middleware to validate url
const validateURL = async (req, res, next) => {
  const { url } = req.body;
  const isExist = await urlExist(url);
  if (!isExist) {
    return res.json({ message: "Invalid URL", type: "failure" });
  }
  next();
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public_html/index.html");
});

app.post("/link", validateURL, (req, res) => {
  const { url } = req.body;

  // Generate a unique id to identify the url in the database
  let id = nanoid(6);

  let newURL = new URL({ url, id });
  try {
    newURL.save();
  } catch (err) {
    res.send("An error was encountered! Please try again.");
  }
  // Send the server address with the unique id
  res.json({ message: `https://zach.tk/${newURL.id}`, type: "success" });
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;

  const originalLink = await URL.find({ id: id });

  if (!originalLink) {
    return res.sendFile(__dirname + "/404.html");
  }
  res.set("cache-control","no-store");
  res.status(301).redirect(originalLink.url);
});

app.listen(8000, () => {
  console.log("App listening on port 8000");
});
