const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString =  function() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  console.log(req.body);// Log the POST request body to the console
  //generate shortURL for user submitted longURL  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
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
