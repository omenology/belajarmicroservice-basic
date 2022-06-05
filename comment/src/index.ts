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
let commnetsByPostId: {
  [key: string]: {
    id: string;
    content: string;
    status: "pending" | "approved" | "rejected";
  }[];
} = {};

// Routes
app.post("/posts/:id/comments", async (req: Request, res: Response) => {
  const id = randomBytes(4).toString("hex");
  commnetsByPostId[req.params.id] = commnetsByPostId[req.params.id] || [];
  commnetsByPostId[req.params.id].push({
    id,
    content: req.body.content,
    status: "pending",
  });
  try {
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentCreated",
      data: {
        id,
        content: req.body.content,
        postId: req.params.id,
        status: "pending",
      },
    });
    res.status(201).json(commnetsByPostId[req.params.id]);
  } catch (error) {
    console.log((error as any).message);
    res.status(500);
  }
});

app.get("/posts/:id/comment", (req: Request, res: Response) => {
  res.status(200).json(commnetsByPostId[req.params.id] || []);
});

app.post("/events", async (req: Request, res: Response) => {
  if (req.body.type === "CommentModerated") {
    const comment = commnetsByPostId[req.body.data.postId].find((comment) => comment.id === req.body.data.id);
    if (!comment) return res.sendStatus(404);
    comment.content = req.body.data.content;
    comment.status = req.body.data.status;
    console.log(comment)
    axios
      .post("http://event-bus-srv:4005/events", {
        type: "CommentUpdated",
        data: {
          id: req.body.data.id,
          content: req.body.data.content,
          postId: req.body.data.postId,
          status: req.body.data.status,
        },
      })
      .catch((error) => {
        console.log((error as any).message);
      })
      .finally(() => {
        res.status(200).json({});
      });
  }
});

const port = process.env.PORT || 4001; // used port

app.listen(port, () => {
  console.log(`Service start on port : ${port}`);
});
