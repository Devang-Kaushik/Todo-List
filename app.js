import express from "express"; // !Importing express into js
import bodyParser from "body-parser";
import ejs from "ejs";
import { getDate, getDay } from "./date.js";
import mongoose from "mongoose";
import _ from "lodash";
import {} from "dotenv/config";

const app = express(); // !Binding the Express Module to a function i.e., app

const port = process.env.PORT || 3000; // !Defining a port to tune our server to

// Connect to MongoDB at port 27017
const username = process.env.MDB_USERNAME;
const password = process.env.MDB_PASSWORD;
mongoose.connect(
  "mongodb+srv://" +
    username +
    ":" +
    password +
    "@cluster0.cjeep.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

const defaultList = [];
// Define schema
const itemsSchema = new mongoose.Schema({
  name: String,
});

// Compile schema into Model
const Item = mongoose.model("Item", itemsSchema);

/*
Creating document and inserting in to the collection

const tast1 = new Item({
  name: "Task 1",
});

const task2 = new Item({
  name: "Task 2",
});

const task3 = new Item({
  name: "Task 3",
});

Item.insertMany([tast1, task2, task3], (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Sucessfully created new entries");
  }
});
*/

// Define Schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

// Compile schema into Model
const List = mongoose.model("List", listSchema);

// Server will be binded to port 3000 || dynamic port when hosted online
app.listen(port, () => {
  console.log("Server is tuned to port " + port);
});

// !Setting view engine to ejs
app.set("view engine", "ejs");

// !bodyParser works with express. Below step is always done before using the bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
// To load up static files over server
app.use(express.static("public"));

// Browser sends GET req to the home route ("/") and will receive the following res.
app.get("/", (req, res) => {
  // Reading the database
  Item.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      // setting values for list.ejs variables
      res.render("list", {
        listName: "Today",
        newListItems: data,
      });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newTask; //getting data from req body
  const listName = req.body.list;
  // Creating document with new item
  const newItem = new Item({
    name: itemName,
  });

  if (listName == "Today") {
    newItem.save(); // Saving new item to the collection
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      if (err) {
        console.log(err);
      } else {
        if (!foundList) {
          console.log(foundList);
          console.log("List not found");
        } else {
          foundList.items.push(newItem);
          foundList.save();
          res.redirect("/" + listName);
        }
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Deletion Successful for item with id " + checkedItemId);
      }
    });

    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
          console.log(
            "Deletion Successful for item with id " +
              checkedItemId +
              " from list " +
              listName
          );
        }
      }
    );
  }
});

app.get("/:list", (req, res) => {
  const customListName = _.capitalize(req.params.list);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        // Create new list
        const newList = new List({
          name: customListName,
          items: defaultList,
        });

        newList.save();

        res.redirect("/" + customListName); //Redirect to current webpage
      } else {
        // Show an existing list
        res.render("list", {
          listName: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});
