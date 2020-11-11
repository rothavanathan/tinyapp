const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
  const templateVars = 
    { 
      user: users[req.cookies["user_id"]],
      urls: urlDatabase   
    };
  res.render('urls_index', templateVars);
});

//login form NEEDS UPDATING TO INCLUDE PASSWORD
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls')
})


//ejs template for showing full url database
app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const userId = req.cookies.user_id;
  console.log(users[userId])
  const templateVars = 
  { 
    user: users[userId],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

//ejs template for showing form for adding new url
app.get("/urls/new", (req, res) => {
  const templateVars = 
  { 
    user: users[req.cookies("user_id")],
    urls: urlDatabase 
  };
  res.render("urls_new", templateVars);
});

//posts a new url to url database
app.post("/urls", (req, res) => {
  console.log(req.body);// Log the POST request body to the console
  //generate shortURL for user submitted longURL  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls/' + shortURL);         // Respond with 'Ok' (we will replace this)
});

//show user registration form
app.get("/register", (req, res) => {
  console.log(users)
  const templateVars = 
  { 
    user: null,
    urls: urlDatabase 
  };
  res.render("user_register", templateVars);
});

//registers a new user to database
app.post("/register", (req, res) => {

  const {email, password} = req.body
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email,
    password
  };
  console.log(users);
  res.cookie('user_id', newUserID);
  res.redirect('/urls/');         // Respond with 'Ok' (we will replace this)
});



//deletes a url from url database
app.post("/urls/:shortURL/delete", (req, res) => {
  //generate shortURL for user submitted longURL 
  
  const shortURL = req.body.shortURL;
  //delete shortURL key from databasw
  delete urlDatabase[shortURL];
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

//updates a longURL from url database
app.post("/urls/:shortURL", (req, res) => {
  //generate shortURL for user submitted longURL 
  const {shortURL, longURL} = req.body;
  //delete shortURL key from databasw
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});


//shows one specific url in url database
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect('/urls/index')  
  }

  const templateVars = 
  {
    shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies("user_id")]
  };
  res.render('urls_show', templateVars);
});

//redirects to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect('/urls/index')  
  }
  res.redirect(urlDatabase[shortURL]);
});

//original json output of url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//catch all cases that aren't listed above
app.get("*", (req, res) => {
  res.send("404 error - page not found");
});


app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});
