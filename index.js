const express = require("express");
const pg = require("pg");
const app = express();
const port = 3000;

// set up a database client
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "",
  port: 5432
});

// connect to the database
db.connect();

// middleware
// parse the incoming HTTP form data into a format that is useable
app.use(express.urlencoded({ extended: true }));
// direct all requests for static files to the 'public' folder
app.use(express.static("public"));

// homepage, asynchrnous function because we're querying a database
app.get("/", async (req, res) => {
  // attempt to...
  try {
    // get every record from the items table by id ascending order
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    // capture those records in a variable
    let items = result.rows;
  
    res.render("index.ejs", {
      // could switch this to the current day?
      listTitle: "Today",
      // render the records queried from the databse
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
});

// add a to-do list item
app.post("/add", async (req, res) => {
  // the user inputs a to-do item (like 'laundry') then clicks a button to submit the form
  const item = req.body.newItem;
  try {
    // insert the input into the items table of the database, it is automatically assigned an id because the data type in pg is 'SERIAL'
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    // the reload the homepage
    res.redirect("/");  
  } catch (err) {
    console.log(err);
  }
});

// when the user clicks the 'edit' icon
app.post("/edit", async (req, res) => {
  // capture the new input
  const item = req.body.updatedItemTitle;
  // capture the same id 
  const id = req.body.updatedItemId;
  try {
    // change the text of the to-do item in the database
    await db.query("UPDATE items SET title = ($1) where id = $2", [item, id]);
    // reload the homepage
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// if the user clicks the checkbox to the left of the item, delete it
app.post("/delete", async (req, res) => {
  // capture the item id
  const id = req.body.deleteItemId;
  try {
    // delete the item from the database
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    // reload the homepage
    res.redirect("/");  
  } catch (err) {
    console.log(err);
  }
});

// start the server and let us know when it's running
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
