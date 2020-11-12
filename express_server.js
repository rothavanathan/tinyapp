const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));




const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  b6UTxP: { longURL: "https://www.tinyemperor.ca", userID: "aJ48lW" },
  b6UTxS: { longURL: "https://www.bleacherreport.com", userID: "user2RandomID" },
  b6UTxT: { longURL: "https://www.wintersleep.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
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

const urlsForUser = (id) => {
  const validURLs = {};
  //takes in current user id
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      validURLs[url] = urlDatabase[url]
    }
  }
  return validURLs;
  //returns url entries where url id matches user id
}

const isRegisteredEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return false;
} 


const generateRandomString =  function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


//root homepage
app.get("/", (req, res) => {
  const templateVars = { 
      user: users[req.session.user_id],
      urls: urlDatabase   
    };
  res.render('urls_index', templateVars);
});

//get login form 
app.get("/login", (req, res) => {
  const templateVars = { 
      user: users[req.session.user_id], 
    };
  res.render('login', templateVars);
});

//login form
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = isRegisteredEmail(email, users)
  if (!user) {
    return res.sendStatus(403);
  }     
  if (!bcrypt.compareSync(password, users[user].password)) {
    return res.sendStatus(403);
  } 
  req.session.user_id = users[user].id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


//url index route
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const validURLs = urlsForUser(userId);
  const templateVars = { 
    user: users[userId],
    urls: validURLs 
  };
  res.render('urls_index', templateVars);
});

//show new url form
app.get("/urls/new", (req, res) => {
  //check if user is logged in
  if (!req.session.user_id) {
    console.log('no user id');
    return res.redirect('/login');
  }
  const templateVars = { 
    user: users[req.session.user_id],
    urls: urlDatabase 
  };
  res.render("urls_new", templateVars);
});

//posts a new url to url database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, 
    userID: req.session.user_id
  }
  res.redirect('/urls/' + shortURL);
});

//show new user registration form
app.get("/register", (req, res) => {
  const templateVars = { 
    user: null,
    urls: urlDatabase 
  };
  res.render("user_register", templateVars);
});

//registers a new user to database
app.post("/register", (req, res) => {
  const {email, password} = req.body
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.sendStatus(404);
  } 
  if (isRegisteredEmail(email, users)) {
    return res.sendStatus(404).send('this email is taken');
  } 
  const newUserID = generateRandomString();
  users[newUserID] = {
    email,
    password: hashedPassword,
    id: newUserID
  };
  req.session.user_id = newUserID;
  res.redirect('/urls');
});

//deletes a url from url database
app.post("/urls/:shortURL/delete", (req, res) => {
  //generate shortURL for user submitted longURL 
  const shortURL = req.body.shortURL;
  console.log(urlDatabase[shortURL]);
  if (!req.session.user_id) {
    return res.sendStatus(403).send('Log in first please');
  }
  //cookie id and url id must match in order to delete
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    console.log('client wasn\'t permitted to delete');
    return res.sendStatus(403).send('This is not your URL to delete!');
  }
  //delete shortURL key from databasw
  console.log(`deleting ${shortURL} from database\n`)
  delete urlDatabase[shortURL];
  console.log(urlDatabase);

  res.redirect('/urls');
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
  const validURLs = urlsForUser(req.session.user_id);
  if (!urlDatabase[shortURL]) {
    return res.redirect('/urls/index')  
  }
  const templateVars = {
    shortURL,
    validURLs,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render('urls_show', templateVars);
});

//redirects to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect('/urls/index')  
  }
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
