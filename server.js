const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT || 8000;
let DEBUG;
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

//import routes
const authRoutes = require("./api/v1/routes/auth.route");
const userRoutes = require("./api/v1/routes/user.route");
const productRoutes = require("./api/v1/routes/product.route");

//middlewares
app.use("/uploads", express.static("uploads"));
//middlewares
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  DEBUG = true;
  app.use(morgan("dev"));
} else {
  DEBUG = false;
}
// if (process.env.NODE_ENV === "development") {
//   app.use(cors({ origin: `http://localhost:3000` }));
// }

app.get("/hi", (req, res) => {
  return res.status(200).json({ message: "hi" });
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Authorization token error" });
  }
});

//if no above routes are found then this middleware runs. then forward the response to the next middleware

app.use((req, res, next) => {
  const error = new Error("Resource Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: error.message,
  });
});

app.listen(port, () => {
  console.log(`API is running on port ${port} - ${process.env.NODE_ENV}`);
});
