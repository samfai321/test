//express_demo.js 文件
var express             = require('express'),
    app                 = express(),
    { MongoClient, ServerApiVersion } = require("mongodb"),	
    passport            = require('passport'),// Use Passport Middleware
    FacebookStrategy    = require('passport-facebook').Strategy,
    session             = require('express-session');
    path                = require('path');
    bodyParser          = require('body-parser');
    localStrategy		    = require('passport-local').Strategy;
    bodyParser          = require('body-parser');

    var facebookAuth = {
      'clientID'        : '1094811472291513', // facebook App ID
      'clientSecret'    : '406845bb5fe83a8c751238ec9544a4f5', // facebook App Secret
      'callbackURL'     : 'http://localhost:8099/auth/facebook/callback'
};
  var user = {};
  var { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
    const mongourl = 'mongodb+srv://sam123:123@cluster0.j8ihb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    const dbName = 'test';
    const collectionName = "bookings";
    const client = new MongoClient(mongourl, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });


// Middleware
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Passport.js


passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  done(null, user);
});



    function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();
      res.redirect('/login');
  }

  function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/Home');
  }


//  app.post('/login', passport.authenticate('local', {
//    successRedirect: '/',
//    failureRedirect: '/login?error=true'
//  }));
  
//facebook

passport.use(new FacebookStrategy({
  "clientID"        : facebookAuth.clientID,
  "clientSecret"    : facebookAuth.clientSecret,
  "callbackURL"     : facebookAuth.callbackURL
},  
function (token, refreshToken, profile, done) {
  //console.log("Facebook Profile: " + JSON.stringify(profile));
  console.log("Facebook Profile: ");
  console.log(profile);
  user = {};
  user['id'] = profile.id;
  //user['name'] = profile.name.givenName;
  user['name'] = profile.displayName;
  user['type'] = profile.provider;  // Facebook? Google? Twitter?
  console.log('user object: ' + JSON.stringify(user));
  return done(null,user);  // put user object into session => req.user
})
);

app.use(session({
  secret: "tHiSiSasEcRetStr",
  resave: true,
  saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



// send to facebook to do the authentication
app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email" }));
// handle the callback after facebook has authenticated the user
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect : "/Home",
        failureRedirect : "/"
}));








var formidable = require('express-formidable'),
    fsPromises = require('fs').promises;

app.use(formidable());



/// function

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


const insertDocument = async (db, doc) => {
  var collection = db.collection(collectionName);
  let results = await collection. insertOne (doc);
  console.log("insert one document:" + JSON.stringify(results));
  return results;}

const findDocument = async (db, criteria) => {    var collection = db.collection(collectionName);
  let results = await collection.find(criteria).toArray();
  return results;}/*missing codes here*/

const updateDocument = async (db, criteria, updateData) => {    
  let results = await collection.updateOne(criteria, { $set: updateData });
  console.log("Updated document:" + JSON.stringify(results));
  return results;}/*missing codes here*/


const deleteDocument = async (db, criteria) => {
  var collection = db.collection(collectionName);
  let results = await collection.deleteMany(criteria);
  return results;}/*missing codes here*/


var formidable = require('express-formidable'),
  fsPromises = require('fs').promises;

const handle_Find = async (req, res, criteria) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const docs = await findDocument(db, criteria);
  res.status(200).render('list', { nBookings: docs.length, bookings: docs, user: req.user });
};

var newbookingid  =null;
var returnDestination =null;
var returnbookingid =null;
var returnbookingData =null;
var DOCID =null;

const handle_Create = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  newbookingid = getRandomInt(1000);
  let newDoc = {
      userid: req.user.id,
      bookingid:newbookingid,
      Destination: req.fields.Destination,
      bookingData: req.fields.bookingData
  };
  if (req.files.filetoupload && req.files.filetoupload.size > 0) {
      // Handle files uploaded to MongoDB, e.g., an image. This function is not compulsory.
      const data = await fsPromises.readFile(req.files.filetoupload.path);
      newDoc.photo = Buffer.from(data).toString('base64'); // Coding them via base64.
  }
  await insertDocument(db, newDoc);
  console.log(newDoc);
  res.redirect('/');

};


const handle_Details = async (req, res, criteria) => {

  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const docs = await findDocument(db, criteria);

   console.log("user input:"+req.fields.inputBookingid);

   for (var g = 0; g < docs.length; g++) {
    if (docs[g].bookingid === parseInt(req.fields.inputBookingid))
    {
      returnbookingid = docs[g].bookingid;
      returnDestination = docs[g].Destination;
      returnbookingData = docs[g].bookingData;
      DOCID=docs[g]._id;
    console.log(DOCID);

    console.log("Found");

    break;
    }    

    if (g=== docs.length-1){
    console.log(req.fields.inputBookingid+" Not Found");
    break;
    }
    }
};



const handle_Delete = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  console.log(DOCID);

if (collection) {
  // Delete a single document that matches the filter
  const result = await collection.deleteOne({bookingid:returnbookingid});

  if (result.deletedCount === 1) {
      console.log("Document deleted successfully");
  } else {
      console.log("Document not found or not deleted");
  }
} else {
  console.log("Collection not found");
}
};


const handle_updataDestination = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  console.log(req.fields.updataDestinationinput);

if (collection) {
  // Delete a single document that matches the filter
  let inputDestination=req.fields.updataDestinationinput;

  console.log(collectionName);

  const result = await collection.updateOne({bookingid:returnbookingid},{"$set" : { "Destination" : inputDestination} });


  if (result.deletedCount === 1) {
      console.log("Destination update successfully");
  } else {
      console.log("Destination not found or not updated");
  }
} else {
  console.log("Collection not found");
}
};


const handle_updataDATA = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  console.log(req.fields.updataDATAinput);

if (collection) {
  // Delete a single document that matches the filter
  let updataDATAinput=req.fields.updataDATAinput;

  console.log(collectionName);

  const result = await collection.updateOne({bookingid:returnbookingid},{"$set" : { "bookingData" : updataDATAinput} });


  if (result.deletedCount === 1) {
      console.log("Date update successfully");
  } else {
      console.log("Date not found or not updated");
  }
} else {
  console.log("Collection not found");
}
};





// ROUTES

app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
  

app.get('/',isLoggedIn, (req, res) => {
	res.status(200).render('Home', { user: req.user });
});

app.get("/login", isLoggedOut,function (req, res) {
  res.status(200).render('Login');
});

app.get("/Home",isLoggedIn, function (req, res) {
  console.log(req.user);

  newbookingid  =null;
  returnDestination =null;
  returnbookingid =null;
  returnbookingData =null;
  DOCID =null;


  res.status(200).render('Home', { user: req.user });
});

app.get('/create', isLoggedIn, (req, res) => {
  res.status(200).render('create', { newbookingid:newbookingid,user: req.user });
});

app.post('/create', isLoggedIn, (req, res) => {
  handle_Create(req, res, { user: req.user });
});

app.get("/Delete",isLoggedIn, function (req, res) {
  res.status(200).render('Delete',  {returnDestination:returnDestination ,returnbookingid:returnbookingid,returnbookingData:returnbookingData,user: req.user });
});

app.get("/Read",isLoggedIn, (req, res) =>{
  res.status(200).render('Read', {returnDestination:returnDestination ,returnbookingid:returnbookingid,returnbookingData:returnbookingData,user: req.user });
});

app.post("/Readdetail",isLoggedIn, function (req, res) {
  handle_Details(req, res, req.query);
  res.send('<script>window.location.reload();</script>');
});

app.get("/Update",isLoggedIn, function (req, res) {
  res.status(200).render('Update', {returnDestination:returnDestination ,returnbookingid:returnbookingid,returnbookingData:returnbookingData,user: req.user });
});

app.get("/deletedetail",isLoggedIn, function (req, res) {
  handle_Delete(req, res, req.query);
});

app.post("/updataDestination",isLoggedIn, function (req, res) {
  handle_updataDestination(req, res, req.query);
});

app.post("/updataDATA",isLoggedIn, function (req, res) {
  handle_updataDATA(req, res, req.query);
});

/* RESTful API*/


  // to use booking id to find the tecket record
const handle_Details_test = async (req, res, criteria) => {

  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const docs = await findDocument(db, criteria);

   console.log("user input:"+req.params.bookingid);

   for (var g = 0; g < docs.length; g++) {
    if (docs[g].bookingid === parseInt(req.params.bookingid))
    {
    console.log("Found");
    return (docs[g]);


    }    

    if (g=== docs.length-1){
    console.log(req.params.bookingid+" Not Found");
    return ("booking ID :"+req.params.bookingid+" Not Found");
    }
    }
};

app.get('/api/read/:bookingid',async function (req, res) {
  console.log("user input:"+req.params.bookingid);
  const result = await handle_Details_test(req, res, req.query);
  res.send(result);

});








const handle_Delete_api = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  console.log(DOCID);

if (collection) {
  // Delete a single document that matches the filter
  const result = await collection.deleteOne({bookingid:returnbookingid});

  if (result.deletedCount === 1) {
      console.log("Document deleted successfully");
  } else {
      console.log("Document not found or not deleted");
  }
} else {
  console.log("Collection not found");
}
};

app.delete("/api/deletedetail/:bookingid", function (req, res) {
  //handle_Delete_api(req, res, req.query);
  console.log("Connected successfully to server");
});



// gate
const port = process.env.PORT || 8099;
app.listen(port, () => {console.log(`Listening at http://localhost:${port}`);});
 

