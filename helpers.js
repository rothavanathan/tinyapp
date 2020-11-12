//returns all URLs in database that were created by given userID
const urlsForUser = (id, database) => {
  const validURLs = {};
  //takes in current user id
  for (const url in database) {
    if (database[url].userID === id) {
      validURLs[url] = database[url]
    }
  }
  return validURLs;
  //returns url entries where url id matches user id
};

//returns boolean whether or not an email exists in database
const isRegisteredEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

//returns user_id given an email and database
const getUserByEmail = function(email, database) {
  // lookup magic...
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return false;
};


//generates a random 6 digit string of upper or lowercase letters
const generateRandomString =  function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {generateRandomString, urlsForUser, isRegisteredEmail, getUserByEmail};