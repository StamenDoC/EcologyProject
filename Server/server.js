var http = require('http'),
      fs = require('fs'),
     url = require('url')
     qs = require('querystring'),
     decode = require('urldecode'),
     bodyParser = require('body-parser');

 var express = require('express'),
    app = express(),
    path = require('path'),
    multer  = require('multer');

 var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url_db = "mongodb://localhost:27017/mydb";

var imageDir = './Images/';

app.use(bodyParser.json());


//--------------UPLOAD FILE---------------------------

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./Images");
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: Storage }).array("file", 3); //Field name and max count

app.post("/upload", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        console.log(req.files[0].filename);
        return res.end(req.files[0].filename);
    });
});

app.listen(2000, function (a) {
    console.log("Listening to port 2000");
});

//--------------------MANIPULACIJA SA BAZOM-----------------

http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    if(path=="/insert"){
        console.log("request recieved");

        var body = '';
	    request.on('data', function(chunk) {
	    	console.log("USAO");
	      body += chunk;
	    });

	    request.on('end', function() {
	      var data = qs.parse(body);

	      MongoClient.connect(url_db, function(err, db) {
			  if (err) throw err;
			  db.createCollection("userReport", function(err, res) {
			    if (err) throw err;
			    console.log("Table created!");

				  var myobj = { first_name: data.first_name, last_name: data.last_name, email: data.email, mobile_number: data.mobile_number, title: data.title, short_text: data.short_text, latitude: data.Latitude, longitude: data.Longitude, picture: data.picture };
				  db.collection("userReport").insertOne(myobj, function(err, res) {
				    if (err) throw err;
				    console.log("1 record inserted");
				  });

			    db.close();

			    response.writeHead(200);
	      		response.end(JSON.stringify(data));
	      		console.log("string sent");

			  });
			});

	      
	    });

        /*var string = choices[Math.floor(Math.random()*choices.length)];
        console.log("string '" + string + "' chosen");
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end(string);*/
        
    }

    else if(path=="/getDistanca")
    {
    	console.log("request recieved");

        var body = '';
	    request.on('data', function(chunk) {
	    	console.log("USAO");
	      body += chunk;
	    });

	    request.on('end', function() {
	      var data = qs.parse(body);

	      var allItem = [];

	      var km;
          var m;

	      var radiusInM = data.radiusInM;
	      var Latitude = data.Latitude;
	      var Longitude = data.Longitude;

	      console.log(radiusInM);

	      MongoClient.connect(url_db, function(err, db) {
			  if (err) throw err;
			  db.createCollection("userReport", function(err, res) {
			    if (err) throw err;

			    console.log("Table created!");

			    db.collection('userReport').find().toArray(function(err, docs) {
			        
			        if(docs == null)
				    {
				    	console.log("Prazno");
				    }

				    else
				    {
				    	for(var i = 0; i < docs.length; i++)
				    	{
				    		km = getDistanceFromLatLonInKm(Latitude, Longitude, docs[i].latitude, docs[i].longitude);
			                m = km * 1000;

			              if(radiusInM >= m)
			              {
						    	items = {};
				                items ["id"] = docs[i]._id;
				                items ["first_name"] = docs[i].first_name;
				                items ["last_name"] = docs[i].last_name;
				                items ["email"] = docs[i].email;
				                items ["mobile_number"] = docs[i].mobile_number;
				                items ["title"] = docs[i].title;
				                items ["short_text"] = docs[i].short_text;

				                items ["latitude"] = docs[i].latitude;
				                items ["longitude"] = docs[i].longitude;

				                items ["picture"] = docs[i].picture;

				                allItem.push(items);
				            }
						}

						response.writeHead(200);
						response.end(JSON.stringify(allItem));
						console.log("string sent");
				    }

			        
			      });

			    db.close();
			    
			  });

			});

	      
	    });
    }

    else if(path=="/getEmail")
    {
    	console.log("request recieved");

        var body = '';
	    request.on('data', function(chunk) {
	    	console.log("USAO");
	      body += chunk;
	    });

	    request.on('end', function() {
	      var data = qs.parse(body);

	      var allItem = [];

	      console.log(data.email);

	      MongoClient.connect(url_db, function(err, db) {
			  if (err) throw err;
			  db.createCollection("userReport", function(err, res) {
			    if (err) throw err;

			    console.log("Table created!");

			    db.collection('userReport').find({email: data.email}).toArray(function(err, docs) {
			        
			        if(docs == null)
				    {
				    	console.log("Prazno");
				    }

				    else
				    {
				    	for(var i = 0; i < docs.length; i++)
				    	{
					    	items = {};
			                items ["id"] = docs[i]._id;
			                items ["first_name"] = docs[i].first_name;
			                items ["last_name"] = docs[i].last_name;
			                items ["email"] = docs[i].email;
			                items ["mobile_number"] = docs[i].mobile_number;
			                items ["title"] = docs[i].title;
			                items ["short_text"] = docs[i].short_text;

			                items ["latitude"] = docs[i].latitude;
			                items ["longitude"] = docs[i].longitude;

			                var content_new;

			                var img_read;

			                var content_new  = fs.readFileSync(imageDir + docs[i].picture)

					        img_read = "data:image/jpeg;base64," + new Buffer(content_new).toString('base64');

					        console.log(content_new);


			                items ["picture"] = img_read;

			                allItem.push(items);
						}

						response.writeHead(200);
						response.end(JSON.stringify(allItem));
						console.log("string sent");
				    }

			        
			      });

			    db.close();
			    
			  });

			});

	      
	    });
    }

}).listen(8001);
console.log("server initialized");

/*var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.createCollection("customers", function(err, res) {
    if (err) throw err;
    console.log("Table created!");
    db.close();
  });
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var myobj = { name: "Company Inc", address: "Highway 37" };
  db.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 record inserted");
    db.close();
  });
});*/

/*MongoClient.connect(url_db, function(err, db) {
  if (err) throw err;
  db.collection("userReport").findOne({}, function(err, result) {
    if (err) throw err;
    console.log(result.picture);
    db.close();
  });
});*/

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function getImages(imageDir, callback) {
    var fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        }
        callback(err, files);
    });
}

MongoClient.connect(url_db, function(err, db) {
  if (err) throw err;
  var cursor = db.collection('userReport').find();

  cursor.each(function(err, item) {
	    // otherwise, do something with the item
	    if(item == null)
	    {
	    	db.close();
	    	return null;
	    }
	    console.log(item.email);
	});
});