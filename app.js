//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-Aks:testtake1@cluster0.ddvt8as.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema={
  Name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
  Name: "Welcomeeee!!!"
});
const item2= new Item({
  Name: "This is a To-do list website"
});
const item3= new Item({
  Name: "Carry-on add some items"
});

const defaultItems =[item1, item2, item3];

const listSchema={
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, items){
    if(items.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log(err);
        else
          console.log("Success !!");
      });
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: items});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;

  const item = new Item({
    Name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove (checkedItemId, function(err){
      if(!err){
        console.log("Deleted !!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id: checkedItemId}}},
      function(err, foundList){
        if(!err)
          res.redirect("/"+listName);
      });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:topic", function(req, res){
  const topic = _.capitalize(req.params.topic);

  List.findOne({name:topic}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: topic,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+topic);
      }
      else{
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
