const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
const AppError = require("./utils/AppError");

//routes
const userRouter = require("./routes/userRoute");
const projectRouter = require("./routes/projectRoute");
// middlewares
app.use(express.json()); // to add the body the the req

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
