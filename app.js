//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const date = require(`${__dirname}/date.js`);
const _ = require("lodash");

mongoose.set('useFindAndModify', false);

mongoose.connect("mongodb+srv://admin-surya:a1234567@cluster0-admca.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
 name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//For Using EJS set veiw engine and create veiws folder
app.set("view engine", "ejs");

//Home Route
app.get("/",(req,res)=>{

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved items in DB");
        }
      });
      res.redirect("/");
      
    }
    else {
      res.render("list", {listTitle: "Today" , newListItems: foundItems });
    }
  });
  
});

//Post From home route
app.post("/",(req,res)=>{
  const itemName = req.body.item;
  const listName = req.body.submit;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, (err, doc) => {
      doc.items.push(item);
      doc.save();
      res.redirect(`/${listName}`);

    });
  }
  
  // if (req.body.submit === "Work") {
  //   workItems.push(newItem);
  //   res.redirect("/work");
  // }
  // else{
  //   newItems.push(newItem);
  //   res.redirect("/");
  //3VCG BSMG K3QB DCKH
  // }
});

//Delete Items
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, (err, docs) => {
      console.log(docs);
      console.log(err);
      res.redirect("/");
    });
  }

  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, doc) =>{
      if(!err){
        res.redirect(`/${doc.name}`);
      }
    });
  }

  
  
});

//Custom Route
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, doc) => {
    if(!doc){
      //Crete new List
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect(`/${customListName}`);
    }

    else{
      //Show existing List
      res.render("list", {listTitle: doc.name, newListItems: doc.items });
    }

  });

  
});

// About Us
app.get("/aboutUs",(req,res)=>{
  res.render('aboutUs');
});


//Listen to port and use the port
app.listen(8080, ()=>{
    console.log("Server running at port 8080");
});


