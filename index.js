require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const authenticateUser = require("./middleware/authentication");

//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean"); //this package is deprecated
const rateLimiter = require("express-rate-limit");

//error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json()); //bec. we have some post routes
app.use(helmet());
app.use(cors());
app.use(xss());

//routes
app.get("/", (req, res) => {
  res.send('<h1>Testing Connect</h1><a href="/api-docs">Documentation</a>');
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter); // to protect all the routes of jobsRouter we are using authenticateUser

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

//order of route and middleware is important. Route should come before middleware
//in .env we create JWT_SECRET key using random key generator website
