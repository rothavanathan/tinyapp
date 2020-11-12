const { assert } = require('chai');

const { getUserByEmail, isRegisteredEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  b6UTxP: { longURL: "https://www.tinyemperor.ca", userID: "aJ48lW" },
  b6UTxS: { longURL: "https://www.bleacherreport.com", userID: "user2RandomID" }
};

describe('getUserByEmail', function() {
  
  it('should return a user for a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  
  it('should return undefined for an invalid email', function() {
    const user = getUserByEmail("tiny@tim.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});

describe('isRegisteredEmail', function() {
  
  it('should return true for a valid email', function() {
    const user = isRegisteredEmail("user@example.com", testUsers);
    const expectedOutput = true;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  
  it('should return false for an invalid email', function() {
    const user = isRegisteredEmail("tiny@tim.com", testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  
  it('should return filtered object of URLs associated with userId', function() {
    const user = urlsForUser("user2RandomID", urlDatabase);
    const expectedOutput = {b6UTxS: { longURL: "https://www.bleacherreport.com", userID: "user2RandomID" }};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
  
  it('should return empty object if user has no associated URLs', function() {
    const user = urlsForUser("tiny@tim.com", urlDatabase);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  
  it('should return a six character string', function() {
    const id = generateRandomString();
    const expectedLength = 6;
    // Write your assert statement here
    assert.equal(id.length, expectedLength);
  });
  
});
