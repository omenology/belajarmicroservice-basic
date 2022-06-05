import express, { Express, Request, Response } from "express";
import cors from "cors";
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

// envetn data
const eventsData: {
  type: string;
  data: any;
}[] = [];

// Routes
app.post("/events", (req: Request, res: Response) => {
  const event = req.body;
  eventsData.push(event);
  axios.post("http://post-clusterip-srv:4000/events", event).catch((err) => {
    console.log(err.message, "posts");
  });
  axios.post("http://comment-srv:4001/events", event).catch((err) => {
    console.log(err.message, "comments");
  });
  axios.post("http://query-srv:4002/events", event).catch((err) => {
    console.log(err.message, "query");
  });
  axios.post("http://moderation-srv:4003/events", event).catch((err) => {
    console.log(err.message, "moderation");
  });
  res.send({ status: "OK" });
  console.log("Event: ", event);
});

app.get("/events", (req: Request, res: Response) => {
  res.send(eventsData);
});

const port = process.env.PORT || 4005; // used port

app.listen(port, () => {
  console.log(`Service start on port : ${port}`);
});
