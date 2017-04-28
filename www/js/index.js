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

var image_marker = "img/location2.png";

var trash_image_marker = "img/garbage.png";

var allLocalTrash = [];

var searchLocalTrash = [];

$(function(){


});

function returnAllLocalTrash()
{
  allLocalTrash = [];

  db.transaction(function(tx) {
          tx.executeSql("SELECT * FROM userReport", [], function(tx, res){
            for(var i = 0; i < res.rows.length; i++)
            {
                //alert(res.rows.item(iii).id + " " + res.rows.item(iii).first_name + " " + res.rows.item(iii).last_name + " " + res.rows.item(iii).email + res.rows.item(iii).image);

                item = {}
                item ["id"] = res.rows.item(i).id;
                item ["first_name"] = res.rows.item(i).first_name;
                item ["last_name"] = res.rows.item(i).last_name;
                item ["email"] = res.rows.item(i).email;
                item ["mobile_number"] = res.rows.item(i).mobile_number;
                item ["title"] = res.rows.item(i).title;
                item ["short_text"] = res.rows.item(i).short_text;

                item ["latitude"] = res.rows.item(i).latitude;
                item ["longitude"] = res.rows.item(i).longitude;

                item ["picture"] = res.rows.item(i).picture;

                allLocalTrash.push(item);

            }
          })
        });
}

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

var markersTrash = [];

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
        position: latLong,
        animation: google.maps.Animation.DROP,
        icon: image_marker
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
        position: latLong,
        icon: image_marker
    });

    for (var i = markers.length - 1; i >= 0; i--) 
    {
      markers[i].setMap(null);
      markers.pop();
    }

    markers.push(marker);
    marker.setMap(map);
    //map.setCenter(marker.getPosition());
}


function setMarkerTrash(latitude, longitude, j) {

    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
        position: latLong,
        icon: trash_image_marker
        
    });

    marker.set('id', j);

    marker.info = new google.maps.InfoWindow({
        content:"Name: " + allLocalTrash[j].first_name + " " + allLocalTrash[j].last_name + "<br/> Email: " + allLocalTrash[j].email + "<br/> Mobile Number: " + allLocalTrash[j].mobile_number + "<br/><img class='popUpPicture' id='" + j + "' src='" + allLocalTrash[j].picture + "' onclick=prikaziSliku('"+allLocalTrash[j].picture+"')> <br/> Title: " +  allLocalTrash[j].title + "<br/> Description: " + allLocalTrash[j].short_text
    });

    markersTrash.push(marker);
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function(){
        marker.info.open(map, marker);

    });

    map.setCenter(marker.getPosition());
}

function deleteMarkerTrash()
{
  for (var i = markersTrash.length - 1; i >= 0; i--) 
    {
      markersTrash[i].setMap(null);
      markersTrash.pop();
    }
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

function prikaziSliku(slika)
{
    productOverlayImage.attr('src', slika);
    productOverlay.fadeIn(100);
    $('body').css('overflow', 'hidden');

    $('.product-image-overlay-close').click(function () {
        productOverlay.fadeOut(100);
        $('body').css('overflow', 'auto');
    });
}

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


    $("#firstNameError").text("");

    $("#lastNameError").text("");

    $("#emailError").text("");

    $("#mobileNumberError").text("");

    $("#titleNameError").text("");

    $("#shortTextError").text("");

    $("#imageError").text("");
        

    //----- e ovako ovo ovde nam proverava da li je validno ono sto smo stavili od atribura u html -------
    var first_name_validate = $("#firstname")[0].checkValidity();
    var last_name_validate = $("#lastname")[0].checkValidity();
    var email_validate = $("#email")[0].checkValidity();
    var mobile_number_validate = $("#mobilenumber")[0].checkValidity();
    var title_validate = $("#title")[0].checkValidity();
    var short_text_validate = $("#shortText")[0].checkValidity();


    //---- ako je sve ok izvalacim value koje se upisuju u bazu ----
    var first_name = $("#firstname").val();
    var last_name = $("#lastname").val();
    var email = $("#email").val();
    var mobile_number = $("#mobilenumber").val();
    var title = $("#title").val();
    var short_text = $("#shortText").val();
    
    //ovu image isto upusujes ovako kako jeste u bazu
    var image = window.localStorage.getItem('image');

    if(first_name_validate && last_name_validate && email_validate && mobile_number_validate && title_validate && short_text_validate && image)
    {

        db.transaction(function(tx) {
          tx.executeSql('INSERT INTO userReport (first_name, last_name, email, mobile_number, title, short_text, latitude, longitude, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, email, mobile_number, title, short_text, Latitude, Longitude, image], function(tx, res){
            alert("You are success report a trash :) Tnx :)");
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#mobilenumber").val("");
            $("#title").val("");
            $("#shortText").val("");

            window.localStorage.setItem('image', undefined);

            $('#mapaModal').modal('toggle');
        });

        }, function(err){
            //errors for all transactions are reported here
            alert("Error: " + err.message)

        });
    }

    else
    {

        //----- ako nije dobro mozemo da radimo sta ocemo ovde xD -----
        if(!first_name_validate)
        {
          if(first_name.length > 0)
          {
            $("#firstNameError").text("Max number of characters is 20");
          }

          else
          {
            $("#firstNameError").text("You need to fill this filed");
          }
        }

        if(!last_name_validate)
        {
          if(last_name.length > 0)
          {
            $("#lastNameError").text("Max number of characters is 30");
          }

          else
          {
            $("#lastNameError").text("You need to fill this filed");
          }
        }

        if(!email_validate)
        {
          if(email.length > 0)
          {
            $("#emailError").text("No correct format of email");
          }

          else
          {
            $("#emailError").text("You need to fill this filed");
          }
        }

        if(!mobile_number_validate)
        {
          if(mobile_number.length > 0)
          {
            $("#mobileNumberError").text("Max number of characters is 15");
          }

          else
          {
            $("#mobileNumberError").text("You need to fill this filed");
          }
        }

        if(!title_validate)
        {
          if(title.length > 0)
          {
            $("#titleNameError").text("Max number of characters is 20");
          }

          else
          {
            $("#titleNameError").text("You need to fill this filed");
          }
        }

        if(!short_text_validate)
        {
          if(short_text.length > 0)
          {
            $("#shortTextError").text("Max number of characters is 200");
          }

          else
          {
            $("#shortTextError").text("You need to fill this filed");
          }
        }

        if(!image)
        {
          $("#imageError").text("You need to take or get a Picture");
        }
    }
});

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

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

$("#SearchIn").change(function(){

  var searchIn = $("#SearchIn").val();

  if(searchIn == 0)
  {
    $("#SearchBy").html("<option value='0' selected>Distance</option>");
  }

  else if(searchIn == 1)
  {
    $("#SearchBy").html("<option value='0' selected>Distance</option><option value='1'>Name</option><option value='2'>Mobile number</option><option value='3'>Email</option>");
  }

});

$("#searchButton").click(function(){

  var searchIn = $("#SearchIn").val();
  var searchBy = $("#SearchBy").val();

  if(searchIn == 0)
  {
    //lokalno trazenje

    var radiusInM = parseInt($("#searchText").val());

    if(radiusInM)
    {
      //prvo vadim sve lokacije iz baze

      returnAllLocalTrash();

      setTimeout(function() {

        //brisem sve markere
        deleteMarkerTrash();

        //e sada posto ovde moze da bude samo pretrazivanje po x metara onda samo ovo radimo

        var km;
        var m;

        var j = 0;

        searchLocalTrash = [];

        for(var i = 0; i < allLocalTrash.length; i++)
        {
          km = getDistanceFromLatLonInKm(Latitude, Longitude, allLocalTrash[i].latitude, allLocalTrash[i].longitude);

          m = km * 1000;

          if(radiusInM >= m)
          {
            searchLocalTrash = allLocalTrash;
            //postavljam marker
            setMarkerTrash(allLocalTrash[i].latitude, allLocalTrash[i].longitude, i);

            j++;
          }
        }
      }, 1000);
    }

    else
    {
      alert("You need to insert a NUMBER!!!");
    }

  }

  else if(searchIn == 1)
  {
    //trazenje na serveru
  }

});

