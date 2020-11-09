const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//root homepage
app.get("/", (req, res) => {
  res.send("WELCOME TO THE FASTASMIC URL SHORT'NER PAGE!!!");
});

//original json output of url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//ejs template for showing full url database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//ejs template for showing form for adding new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//posts a new url to url database
app.post("/urls", (req, res) => {
  const body = req.body;
  console.log(body);
  res.render('urls_index', templateVars);
});

//shows one specific url in url database
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = 
  {
    shortURL,
    longURL: urlDatabase[shortURL],
  };
  res.render('urls_show', templateVars);
});

//random hello page we made during initial set up
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});
