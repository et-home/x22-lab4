var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var axios = require("axios").default;
var ping = require("ping");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);

const geoKey = "aa51679e2d274cdab7ce7d8cab2430c6";

app.get("/api/location", async function (req, res) {
  let ip = req.ip;
  let ipUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${geoKey}&ip=${ip}`;
  let response = await axios.get(ipUrl);

  let data = response.data;
  res.json({ lat: data.latitude, lng: data.longitude, ip: ip });
});

app.get("/api/ping/:domain?", async function (req, res) {
  const result = await ping.promise.probe(req.params.domain, {
    timeout: 10,
    extra: ["-i", "2"],
  });

  let ipUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${geoKey}&ip=${result.numeric_host}`;
  let response = await axios.get(ipUrl);

  let data = response.data;

  // console.log(data);

  res.json({
    lat: data.latitude,
    lng: data.longitude,
    ip: result.numeric_host,
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
