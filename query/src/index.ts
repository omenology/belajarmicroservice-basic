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
let queryData: {
  [key: string]: {
    id: string;
    title: string;
    comments: {
      id: string;
      content: string;
      status: "pending" | "approved" | "rejected";
    }[];
  };
} = {};

const eventHandler = (event: { type: string; data: any }) => {
  if (event.type === "PostCreated") {
    const { id, title } = event.data;
    queryData[id] = {
      id,
      title,
      comments: [],
    };
  }
  if (event.type === "CommentCreated") {
    const { id, content, postId, status } = event.data;

    queryData[postId].comments.push({
      id,
      content,
      status,
    });
  }
  if (event.type === "CommentUpdated") {
    const comment = queryData[event.data.postId].comments.find((comment) => comment.id === event.data.id);
    if (comment) {
      comment.content = event.data.content;
      comment.status = event.data.status;
    }
  }
};

// Routes
app.get("/posts", (req: Request, res: Response) => {
  res.send(queryData);
});

app.post("/events", (req: Request, res: Response) => {
  eventHandler(req.body);
  res.send({});
});

const port = process.env.PORT || 4002; // used port

app.listen(port, () => {
  console.log(`Service start on port : ${port}`);
  axios
    .get("http://event-bus-srv:4005/events")
    .then((res) => {
      console.log(res.data)
      res.data.forEach((element: any) => {
        eventHandler(element);
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
