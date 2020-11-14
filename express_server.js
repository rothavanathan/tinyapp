const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080

//import helper functions
const {generateRandomString, urlsForUser, isRegisteredEmail, getUserByEmail} = require('./helpers.js');

//app config
app.set('view engine', 'ejs');
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const firstDateCreated = new Date().setTime(1605370373766);

//hard code databases
const urlDatabase = {
  b6UTxQ: { 
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    dateCreated: firstDateCreated},
  b6UTxP: {
    longURL: "https://www.gearslutz.com",
    userID: "aJ48lW",
    dateCreated: firstDateCreated
  },
  b6UTxS: {
    longURL: "https://www.bleacherreport.com",
    userID: "user2RandomID",
    dateCreated: firstDateCreated
  },
  b6UTxT: {
    longURL: "https://www.heyrosetta.com",
    userID: "user2RandomID",
    dateCreated: firstDateCreated
  },
  i3BoGr: { 
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
    dateCreated: firstDateCreated
  }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const visits = {
  b6UTxQ: {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  },
  b6UTxP: {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  },
  b6UTxS: {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  },
  b6UTxT: {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  },
  i3BoGr: {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  }
}

//root homepage
app.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

//get login form
app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('login', templateVars);
});

//login form
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  //check if email doesn't exist in database
  if (!isRegisteredEmail(email, users)) {
    return res.status(403).send("Whoops! Try again");
  }
  const user = getUserByEmail(email, users);
  //check if email exists but password is wrong
  if (!bcrypt.compareSync(password, users[user].password)) {
    return res.status(403).send("Whoops! Try again");
  }
  //valid login
  req.session.userId = users[user].id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//url index route
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const validURLs = urlsForUser(userId, urlDatabase);
  const templateVars = {
    visits,
    user: users[userId],
    urls: validURLs
  };
  res.render('urls_index', templateVars);
});

//show new url form
app.get("/urls/new", (req, res) => {
  //check if user is logged in
  if (!req.session.userId) {
    console.log('no user id');
    return res.redirect(403, '/login');
  }
  const templateVars = {
    user: users[req.session.userId],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

//posts a new url to url database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    dateCreated: new Date().getTime(),
    longURL: req.body.longURL,
    userID: req.session.userId
  };
  visits[shortURL] = {
    totalVisits: 0,
    uniqueVisitor: {},
    timeStamps: []
  },
  res.redirect('/urls/' + shortURL);
});

//show new user registration form
app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: null,
    urls: urlDatabase
  };
  res.render("user_register", templateVars);
});

//registers a new user to database
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  //if either email of password input was left blank
  if (!email || !password) {
    return res.status(403).send('ERROR: 403\nWhoops. I think you missed an input back there.');
  }
  //if email address is already in database
  if (isRegisteredEmail(email, users)) {
    return res.status(403).send('ERROR: 403\nthis email is taken');
  }
  const newUserID = generateRandomString();
  users[newUserID] = {
    email,
    password: hashedPassword,
    id: newUserID
  };
  req.session.userId = newUserID;
  res.redirect('/urls');
});

//deletes a url from url database
app.post("/urls/:shortURL/delete", (req, res) => {
  //generate shortURL for user submitted longURL
  const shortURL = req.body.shortURL;
  //if user is not logged in
  if (!req.session.userId) {
    return res.status(403).send('Log in first, please.\n');
  }
  //if specific url doens't exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`There's no URL with that name around here.`);
  }
  //if cookie id and url id must match in order to delete
  if (req.session.userId !== urlDatabase[shortURL].userID) {
    return res.status(403).send('This is not your URL to delete!');
  }
  //delete shortURL key from databasw
  delete urlDatabase[shortURL];
  delete visits[shortURL];
  res.redirect('/urls');
});


//updates a longURL from url database
app.post("/urls/:shortURL", (req, res) => {
  const {shortURL, longURL} = req.body;
  if (!req.session.userId) {
    return res.status(403).send('Log in first, please.\n');
  }
  //if specific url doens't exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`There's no URL with that name around here.`);
  }
  //if cookie id and url id must match in order to delete
  if (req.session.userId !== urlDatabase[shortURL].userID) {
    return res.status(403).send('This is not your URL to delete!');
  }
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.userId,
    dateCreated: urlDatabase[shortURL].dateCreated
  };
  res.redirect('/urls');
});


//shows one specific url in url database
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const validURLs = urlsForUser(req.session.userId, urlDatabase);
  //if the requested url isn't in database
  if (!urlDatabase[shortURL]) {
    return res.redirect(404, '/urls');
  }
  const templateVars = {
    shortURL,
    validURLs,
    visits: visits[shortURL],
    url: urlDatabase[shortURL],
    user: users[req.session.userId]
  };
  res.render('urls_show', templateVars);
});

//redirects to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const timeStamp = new Date().getTime();
  //make sure shortURL exists in database
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`There's no URL with that name around here.`);
  }
  //check if visitor is a repeat or unique by checking cookies
  if (!req.session.visitor_id) {
    const visitorID = generateRandomString();
    req.session.visitor_id = visitorID;
  }
  // if cookie exists chheck if they've visited this shortURL before
  if (!visits[shortURL].uniqueVisitor[req.session.visitor_id]) {
    visits[shortURL].uniqueVisitor[req.session.visitor_id] = true;
  }
  
  //increment total number of visits
  visits[shortURL].totalVisits++;
  //add timestamp to timestamp array
  visits[shortURL].timeStamps.push(timeStamp);


  if (!urlDatabase[shortURL]) {
    return res.redirect('/urls/index');
  }
  console.log(visits)
  res.redirect(urlDatabase[shortURL].longURL);
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
