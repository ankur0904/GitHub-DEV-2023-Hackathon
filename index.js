import * as dotenv from 'dotenv'; 
dotenv.config()
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";

// General configurations
const app = express();
const PORT = 3001;
const __dirname = path.resolve();

// Middlewares
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('strictQuery', false);

// TODO: MongoDB URI
mongoose.connect(
 process.env.MONGODB_URI
);

// MongoDB Schemas
const tasksSchema = new mongoose.Schema({
  task: String,
  date: Date,
});
const Tasks = mongoose.model("Tasks", tasksSchema);

// Delete function
async function deleteTask() {
  Tasks.find({}, function (err, tasksList) {
    if (!err) {
      tasksList.forEach((element) => {
        let dateNow = new Date();
        // if task is older than 24 hours it will delete here
        if (dateNow - element.date >=  86400000) {
          Tasks.deleteOne({ date: element.date }, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Deleted...");
            }
          });
        }
      });
    }
  });
}

app.get("/", function (req, res) {
  deleteTask();
  Tasks.find({}, function (err, tasksList) {
    res.render("index", { tasks: tasksList });
  });
});

app.post("/submit", function (req, res) {
  const task = req.body.task;

  const newTask = new Tasks({
    task: task,
    date: new Date(),
  });
  newTask.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      Tasks.find({}, function (err, tasksList) {
        res.render("index", { tasks: tasksList });
      });
    }
  });
});

app.listen(PORT, function () {
  console.log(`Server is running at ${PORT}`);
});
