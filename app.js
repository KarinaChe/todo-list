//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item",itemsSchema)
const item1 = new Item ({
  name:"Bath Time"
});
const item2 = new Item ({
  name:"Cook"
});
const item3 = new Item ({
  name:"Have a rest"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);


// Item.insertMany(defaultItems)
//     .then(result=>{
//       console.log(result)
//     }).catch(err=>{
//       console.log(err)
// })
app.get("/", function(req, res) {
  Item.find({})
      .then((foundItems)=>{
        if(foundItems.length===0){
          Item.insertMany(defaultItems)
            .then(()=>{
              console.log("Success")
              }).catch(err=>{
                console.log(err)
              })
          res.redirect("/")
        }else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
      }).catch(err=>{
        console.log(err)
      })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName})
        .then((foundList)=>{
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName)
        }).catch((err)=>{console.log(err)})  
      
  }
})

app.post("/delete", (req,res)=>{
  async function myDelete(){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      const del = await Item.findByIdAndRemove(checkedItemId);
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
          .then((foundList)=>{
            if(foundList){
              res.redirect("/" + listName)
            }
          }).catch((err)=>{
            console.log(err)
          })
    }
  };
  myDelete();
  //res.redirect("/");
  });




  //  const checkedItemId = req.body.checkbox;
  //  Item.findByIdAndRemove({checkedItemId})
  //      .then((err)=>{
  //       if(!err) {
  //         console.log("Succesfully")
  //       }
  //      })
  //  res.redirect("/");   
//})

app.get("/:customListName", (req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});


  const list = new List ({
    name: customListName,
    items:defaultItems

  })
  list.save();
 }
)

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT;
if(port==null || port==""){
  port = 3000
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
