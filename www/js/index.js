/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var watchID = null;
var db = null;
document.addEventListener("deviceready", onDeviceReady, false);

/*window.addEventListener("devicemotion", deviceMotionUpdate, false);

function deviceMotionUpdate(e){
    alert("x: " +  e.accelerationIncludingGravity.x);
    alert("y: " +  e.accelerationIncludingGravity.y);
    alert("z: " +  e.accelerationIncludingGravity.z);
}*/

function onDeviceReady()
{	
	//alert(navigator.accelerometer);
	//createDatabase();
	db = window.openDatabase("report", "1.0", "Report DB", 1000000);
	
    db.transaction(function(tx) {

        //create table
        tx.executeSql("CREATE TABLE IF NOT EXISTS userReport (id integer primary key autoincrement, first_name varchar(20), last_name varchar(30), email varchar(50), "
        + "mobile_number varchar(15), title varchar(20), short_text text, latitude float, longitude float, picture text )", [], function(tx, res){
            
        });

    }, function(err){
        //errors for all transactions are reported here
        alert("Error: " + err.message)

    });

    // Bind events
    $(document).on("resume", onResume);

    function onRequestSuccess(){
        handleSuccess("Successfully requested accuracy");
    }

    function onRequestFailure(error){
        onError("Accuracy request failed: error code="+error.code+"; error message="+error.message);
    }

    cordova.plugins.locationAccuracy.request(onRequestSuccess.bind(), onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);


    watchAccelerationMove();

}

function checkState(){
    cordova.plugins.diagnostic.isLocationEnabled(function (authorized) {
        if(authorized){
            getMapLocation();
            watchMapPosition();
        }else{
            alert("Your location is not enabled, please turn on your Location Services that you can use this application.");
        }
    }, onError);
}

function onError(error) {
    
}

function MapSuccess(position)
{
    checkState();
}

function MapError(error)
{
    console.log("greska neka");
}

function handleSuccess(msg){
    console.log(msg);
    //alert(msg);
    navigator.geolocation.getCurrentPosition(MapSuccess, MapError, { enableHighAccuracy: true });
    
}

function onResume(){
    //checkState();
}

$(document).on("deviceready", onDeviceReady);



/*var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent("deviceready");
        
        createDatabase();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();*/

/*function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS IMAGE (id INTEGER PRIMARY KEY AUTOINCREMENT, name, width, height)');
}

function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}

function successCB() {
    var db = window.openDatabase("docteamDb", "1.0", "Cordova Demo", 200000);
    db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM IMAGE', [], function (tx, results) {
		  var len = results.rows.length, i;
		  msg = "<p>Found rows: " + len + "</p>";
		  document.querySelector('#textarea').innerHTML +=  msg;

		  for (i = 0; i < len; i++){
		     alert(results.rows.item(i).width );
		  }

		}, null);
	});
}

function insertDB(tx) {
	var img = document.getElementById("slika");
	var width = img.clientWidth;
	var height = img.clientHeight;
	var test = "Ime slike";
    tx.executeSql('INSERT INTO IMAGE (name, width, height) VALUES ("' +test+ '","' +width+ '","' +height+ '")');
}*/

$(function(){

    //getMapLocation();

    //watchMapPosition();

    //watchAccelerationMove();

});

// ------ FUNKCIJE AKCELERATORA I DETEKTOVANJE BRZINE KRETANJA ------

function watchAccelerationMove(){
	
	var optionsAcceleration = { frequency: 3000 };  // Update every 3 seconds
	//var watchID = navigator.accelerometer.getCurrentAcceleration(onSuccessAcceleration, onErrorAcceleration);
	watchID = navigator.accelerometer.watchAcceleration(onSuccessAcceleration, onErrorAcceleration, optionsAcceleration);

	//alert(watchID);
}

function onSuccessAcceleration(acceleration) {
	var accelerationX = (acceleration.x).toFixed(2);
	accelerationX = Math.abs(accelerationX);
	var accelerationY = (acceleration.y).toFixed(2);
	accelerationY = Math.abs(accelerationY);
	var accelerationZ = (acceleration.z).toFixed(2);
	accelerationZ = Math.abs(accelerationZ);

    $("#movementSpeed").html(accelerationX + " m/s");
}

function onErrorAcceleration() {
    alert('onError!');
}

function stopWatch() {
    if (watchID) {
        navigator.accelerometer.clearWatch(watchID);
        watchID = null;
    }
}


//---- FUNKCIJE I PROMENJIVE ZA MAPU ---

var Latitude = undefined;
var Longitude = undefined;
var map;

var markers = [];

// Get geo coordinates

function getMapLocation() {

    navigator.geolocation.getCurrentPosition
    (onMapSuccess, onMapError, { enableHighAccuracy: true });
}

// Success callback for get geo coordinates

var onMapSuccess = function (position) {

    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;

    getMap(Latitude, Longitude);

}

// Get map by using coordinates

function getMap(latitude, longitude) {

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map
    (document.getElementById("mapa"), mapOptions);


    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
        position: latLong
    });

    markers.push(marker);

    marker.setMap(map);
    map.setZoom(15);
    map.setCenter(marker.getPosition());
}

// Set only marker

function getMarker(latitude, longitude) {

    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
        position: latLong
    });

    for (var i = markers.length - 1; i >= 0; i--) 
    {
      markers[i].setMap(null);
      markers.pop();
    }

    markers.push(marker);
    marker.setMap(map);
    map.setCenter(marker.getPosition());
}

// Success callback for watching your changing position

var onMapWatchSuccess = function (position) {

    var updatedLatitude = position.coords.latitude;
    var updatedLongitude = position.coords.longitude;

    if (updatedLatitude != Latitude && updatedLongitude != Longitude) {

        Latitude = updatedLatitude;
        Longitude = updatedLongitude;

        getMarker(updatedLatitude, updatedLongitude);
    }
}

// Error callback

function onMapError(error) {
    console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

// Watch your changing position

function watchMapPosition() {

    var options = {
      maximumAge: 3600000,
      timeout: 5000,
      enableHighAccuracy: true,
   }

    return navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, options);
}

//---- FUNKCIJE I PROMENJIVE ZA KAMERU

$("#takeAPicture").click(function(){
    //sourceType: Camera.PictureSourceType.PHOTOLIBRARY ILI Camera.PictureSourceType.SAVEDPHOTOALBUM da bi birali iz albuma
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,destinationType: Camera.DestinationType.FILE_URI });
    document.getElementById("divSlika").style.display = "initial";
});

$("#getPicture").click(function(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
});

$("#showNewBox").click(function(){

});

/*$("#createFile").click(function(){
    createFile();

});

$("#writeFile").click(function(){
    writeFile();

});

$("#readFile").click(function(){
    readFile();

});

$("#deleteFile").click(function(){
    removeFile();

});*/


function onSuccess(imageURI) {
    window.localStorage.setItem('image',imageURI);
    var image = document.getElementById('slika');
    image.src = window.localStorage.getItem('image');

	 //var width = image.clientWidth;
	 //var height = image.clientHeight;
	 //var test = "Ime slike 123";

	/*db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM image", [], function(tx, res){
            for(var iii = 0; iii < res.rows.length; iii++)
            {
                alert(res.rows.item(iii).id + " " + res.rows.item(iii).name + " " + res.rows.item(iii).width + " " + res.rows.item(iii).height);
            }
        })
	});*/

}

//ova funkcija treba da se pozove kada zelimo da upload sliku na server...
function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
    options.mimeType="text/plain";

    var params = new Object();

    options.params = params;

    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI("http://some.server.com/upload.php"), win, fail, options);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}


function onFail(message) {
    alert('Failed because: ' + message);
}

// ------ POPUP PRIKAZ SLIKE NA KLIK -------

$('body').append('<div class="product-image-overlay"><span class="product-image-overlay-close">x</span><img src="" /></div>');
var productImage = $('img');
var productOverlay = $('.product-image-overlay');
var productOverlayImage = $('.product-image-overlay img');

productImage.click(function () {
    var productImageSource = $(this).attr('src');

    productOverlayImage.attr('src', productImageSource);
    productOverlay.fadeIn(100);
    $('body').css('overflow', 'hidden');

    $('.product-image-overlay-close').click(function () {
        productOverlay.fadeOut(100);
        $('body').css('overflow', 'auto');
    });
});

// KREIRANJE FAJLA

function createFile() {
   var type = window.TEMPORARY;
   var size = 5*512*512;

   window.requestFileSystem(type, size, successCallback, errorCallback);

   function successCallback(fs) {
      fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {
         alert('File creation successfull!')
      }, errorCallback);
   }

   function errorCallback(error) {
      alert("This file is already created!")
   }
}

// UPISIVANJE U FAJL

function writeFile() {
   var type = window.TEMPORARY;
   var size = 5*512*512;

   window.requestFileSystem(type, size, successCallback, errorCallback)

   function successCallback(fs) {

      fs.root.getFile('log.txt', {create: true}, function(fileEntry) {

         fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
               alert('Write completed.');
            };

            fileWriter.onerror = function(e) {
               alert('Write failed: ' + e.toString());
            };

            var blob = "Test1213212312";
            fileWriter.write(blob);
         }, errorCallback);

      }, errorCallback);

   }

   function errorCallback(error) {
      alert("ERROR: " + error.code)
   }
}

// CITANJE FAJLA

function readFile() {
   var type = window.TEMPORARY;
   var size = 5*512*512;

   window.requestFileSystem(type, size, successCallback, errorCallback)

   function successCallback(fs) {

      fs.root.getFile('log.txt', {}, function(fileEntry) {

         fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
               var txtArea = document.getElementById('textarea');
               txtArea.innerHTML = this.result;
            };

            reader.readAsText(file);

         }, errorCallback);

      }, errorCallback);
   }

   function errorCallback(error) {
      alert("ERROR: " + error.code)
   }
}

// BRISANJE FAJLA

function removeFile() {
   var type = window.TEMPORARY;
   var size = 5*512*512;

   window.requestFileSystem(type, size, successCallback, errorCallback)

   function successCallback(fs) {
      fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

         fileEntry.remove(function() {
            alert('File removed.');
         }, errorCallback);

      }, errorCallback);
   }

   function errorCallback(error) {
      alert("ERROR: " + error.code)
   }
}

//------------ FUNKCIJE ZA FORMU ----------------

$("#submit").click(function(){

    //----- e ovako ovo ovde nam proverava da li je validno ono sto smo stavili od atribura u html -------
    var first_name_validate = $("#firstname")[0].checkValidity();
    var last_name_validate = $("#lastname")[0].checkValidity();
    var email_validate = $("#email")[0].checkValidity();
    var mobile_number_validate = $("#mobilenumber")[0].checkValidity();
    var title_validate = $("#title")[0].checkValidity();
    var short_text_validate = $("#shortText")[0].checkValidity();
    
    //ovu image isto upusujes ovako kako jeste u bazu
    var image = window.localStorage.getItem('image');

    if(first_name_validate && last_name_validate && email_validate && mobile_number_validate && title_validate && short_text_validate && image)
    {
        //---- ako je sve ok izvalacim value koje se upisuju u bazu ----
        var first_name = $("#firstname").val();
        var last_name = $("#lastname").val();
        var email = $("#email").val();
        var mobile_number = $("#mobilenumber").val();
        var title = $("#title").val();
        var short_text = $("#shortText").val();

        //takodje u bazu trebas da ubacis ove dve promenjive koje su vec definisane Latitude i Longitude pukvalno ovako kako sam ti napisao tako se i zovu
        db.transaction(function(tx) {
          alert("Uso sam!");
          tx.executeSql('INSERT INTO userReport (first_name, last_name, email, mobile_number, title, short_text, latitude, longitude, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, email, mobile_number, title, short_text, Latitude, Longitude, image], function(tx, res){
            alert("Uspesno!");
        });

        }, function(err){
            //errors for all transactions are reported here
            alert("Error: " + err.message)

        });

        db.transaction(function(tx) {
          tx.executeSql("SELECT * FROM userReport", [], function(tx, res){
            for(var iii = 0; iii < res.rows.length; iii++)
            {
                //alert(res.rows.item(iii).id + " " + res.rows.item(iii).first_name + " " + res.rows.item(iii).last_name + " " + res.rows.item(iii).email + res.rows.item(iii).image);
                var image = document.getElementById('slika'+ iii);
                image.src = res.rows.item(iii).picture;

            }
          })
        });
    }

    else
    {

        //----- ako nije dobro mozemo da radimo sta ocemo ovde xD -----
        alert("no");
    }
});

