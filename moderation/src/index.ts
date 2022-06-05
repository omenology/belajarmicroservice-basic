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

// Routes
app.post("/events", async (req: Request, res: Response) => {
  try {
    if (req.body.type === "CommentCreated") {
      await axios.post("http://event-bus-srv:4005/events", {
        type: "CommentModerated",
        data: {
          id: req.body.data.id,
          content: req.body.data.content,
          postId: req.body.data.postId,
          status: (req.body.data.content as string).includes("kasar") ? "rejected" : "approved",
        },
      });
    }
    res.status(200).json({});
  } catch (error) {
    console.log((error as any).message);
    res.status(500);
  }
});

const port = process.env.PORT || 4003; // used port

app.listen(port, () => {
  console.log(`Service start on port : ${port}`);
});
