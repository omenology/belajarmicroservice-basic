import express, { Express, Request, Response } from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import axios from "axios";

const app: Express = express();

// cors config
app.use(
  cors({
    origin: "*",
  })
);

/* Use body parser */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// db
let dataPosts: {
  [key: string]: string;
} = {};

// Routes
app.post("/posts", async (req: Request, res: Response) => {
  console.log(req.body);
  const id = randomBytes(4).toString("hex");
  dataPosts[id] = {
    id,
    ...req.body,
  };
  try {
    await axios.post("http://event-bus-srv:4005/events", {
      type: "PostCreated",
      data: {
        id,
        title: req.body.title,
      },
    });
    res.status(201).json(dataPosts[id]);
  } catch (error) {
    console.log((error as any).message);
    res.status(500);
  }
});

app.get("/posts/", (req: Request, res: Response) => {
  res.status(200).json(dataPosts);
});

app.post("/events", (req: Request, res: Response) => {
  res.status(200).json({});
});

const port = process.env.PORT || 4000; // used port

app.listen(port, () => {
  console.log("terbaru dong dong 2");
  console.log(`Service start on port : ${port}`);
});
