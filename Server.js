var express     =   require("express");
var app         =   express();
//var bodyParser  =   require("body-parser");
var passport = require('passport');
var expressSession = require('express-session');
var moment = require('moment');
var http = require('http');
var mongoose = require('mongoose');
/* var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' }); */
//var router      =   express.Router();
/* app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false})); */
var mongodb = require('mongodb');

var configDB = require('./config/database.js');

//app.configure(function() {

	// set up our express application
	//app.use(express.logger('dev')); // log every request to the console
	//app.use(express.cookieParser()); // read cookies (needed for auth)
	//app.use(express.bodyParser()); // get information from html forms

	//app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(expressSession({ secret: 'lsgpserver',resave: true,
    saveUninitialized: true, cookie: { maxAge: 60000 }})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	//app.use(flash()); // use connect-flash for flash messages stored in session

//});
var connString = "mongodb://lsgpsdb:Yq193njoAJSwVPWMU4IHHInH0eyEuF66oWosb9FSduDajoRza9LAefImTHwb8FulUZcUw31pnX5gpifFMEHqDA==@lsgpsdb.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
var db;
var dbRetval;
var MongoClient = mongodb.MongoClient;
var MongoClientForRet = mongodb.MongoClient;
 require('./config/passport')(passport); // pass passport for configuration
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

/* var Server = mongo.Server,
   Db = mongo.Db,
   BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('ls_gpsdatabase', server); */

//var connString = "mongodb://lsgpsdata:x2Av2IpUW9zaaUaEhvyExbL00iFq43WNjV3P4Gcd56R7r3oG1vGM0PeWq7t2Ou2DCqeAbYTAMX4RUBmjZB166g==@lsgpsdata.documents.azure.com:10255/?ssl=true";

// configuration ===============================================================
mongoose.connect(connString,{useMongoClient: true}); // connect to our database

/*MongoClient.connect(connString, function (err, database) {
    if (err) {
        return console.error('Unable to connect to the mongoDB server. Error:', err);
    } 
    db = database;
    console.log("Connected to 'ls_gpsdatabase' database");
});*/


 /* db.open(function(err, db) {
   if(!err) {
       console.log("Connected to 'ls_gpsdatabase' database");
        db.collection('wines', {strict:true}, function(err, collection) {
           if (err) {
               console.log("The 'wines' collection doesn't exist. Creating it with sample data...");
               populateDB();
           }
       }); 
   }
});  */ 
 
 
//app.listen(80);
//http.createServer(app).listen(process.env.port, function() {
   http.createServer(app).listen(8080, function() {
    MongoClient.connect(connString,{useMongoClient: true}, function (err, database) {
        if (err) {
            return console.log('Unable to connect to the mongoDB server. Error:', err);
        } 
        db = database;
        console.log("Connected to 'ls_gpsdatabase' database");
    });
    MongoClientForRet.connect(connString,{useMongoClient: true}, function (err, database) {
        if (err) {
            return console.log('Unable to connect to the mongoDB server. Error:', err);
        } 
        dbRetval = database;
        console.log("Connected to 'ls_gpsdatabase' database");
    });
});


///////////////////GPS Events

app.post("/api/gpsevent",isLoggedIn ,function(req,res){
    try {
  
       //var dateArray = req.body.timestamp.split(' ');
       //       var date = dateArray[0].split('/');
         //     var timeArray = dateArray[1].split(":");
           //   var day = date[0];
             // if(parseInt(day) <10)
               //   {
		 //    if(day.length < 2)
		   //  {
                     // day = "0"+day;
		     //}
                  //}
              //var dat = date[1];
              //if(parseInt(dat) <10)
                //  {
		  //   if(dat.length < 2)
		    //  {
                   //dat = "0"+dat;
		    // }
                 // }
              var finddatetime =  new Date(Date.parse(req.body.timestamp));
              //console.log(new Date(Date.parse("2017-08-19 00:00:00")));
              //var findtimestamp = date[2] +"-"+dat+"-"+day+"T"+timeArray[0]+":00:00Z";
               var hours = finddatetime.getHours();
               if(parseInt(hours) <10)
                  {
		     if(hours.length < 2)
		      {
                   hours= "0"+hours;
		     }
                  }
                

              var min = finddatetime.getMinutes();
              var sec = finddatetime.getSeconds();
              finddatetime.setMinutes(0);
              finddatetime.setSeconds(0);
              var findtimestamp = finddatetime.toISOString();
              var jsonminVariable = {};
              var jsonsecVariable = {};
              jsonsecVariable[sec] = {"lat": req.body.lat, "long": req.body.long, "spd": req.body.spd, "head": req.body.head, "alt": req.body.alt, "mcc": req.body.mcc, "mnc": req.body.mnc, "cid": req.body.cid, "lac": req.body.lac, "alarms":req.body.alarms, "status":req.body.status};
              jsonminVariable[min] = [jsonsecVariable];

            
              var length ;
              db.db('ls_gpsdatabase').collection('gpsevent').findOne({"deviceid":req.body.id, "timestamp":findtimestamp},function(err, items) {
                if (err) {
                    res.end(err);
                     return;
                } else {
                if(items)
                    {length = items.values.length;
                        if(items.values[length-1][min])
                            {
                            db.db('ls_gpsdatabase').collection('gpsevent').update({"deviceid":req.body.id, "timestamp":findtimestamp},{$push:{["values."+(length-1)+"."+min]:jsonsecVariable}});
                            }
                            else{
                                db.db('ls_gpsdatabase').collection('gpsevent').update({"deviceid":req.body.id, "timestamp":findtimestamp},{$push:{["values"]:jsonminVariable}});
                            }
                    }
                    else{
                        var gpsevent ={
                               "timestamp": findtimestamp,
                               "deviceid":req.body.id,
                               "accountid":"",
                               "values":[jsonminVariable ]
                            };

                        db.db('ls_gpsdatabase').collection('gpsevent').insert(gpsevent, {safe:true}, function(err, result) {if (err) {
                            res.end(err);
                            return;
                          }});
                    }
                }
                
            }); 
              
             
              
          } catch (error) {
              console.log(error);
              res.end(error);
          }
              
           res.end("Sucess");
  //  }
        
          
});

app.post("/api/gpsevents",isLoggedIn,function(req,res){
   /*  console.log(req.body);
    //var gpsevent = JSON.parse(req.body);
    db.db('ls_gpsdatabase').collection('gpsevent').insert(req.body, {safe:true}, function(err, result) {res.send(err)});
    console.log("Success fully inserted data"); */
});

app.post("/api/registrationinfo",function(req,res){
    console.log(req.body);
    //var gpsevent = JSON.parse(req.body);
    dbRetval.db('ls_gpsdatabase').collection('registrationinfo').insert(req.body, {safe:true}, function(err, result) {res.send(err)});
    console.log("Success fully inserted data");
});

app.get("/api/getgpsevents",isLoggedIn,function(req,res)
{
   
    dbRetval.db('ls_gpsdatabase').collection('gpsevent').find().toArray(function(err, items) {
        res.send(items);
    });
    
});

var GetGpsData = function FindGpsData(idsList)
{
    var secvalue =[];
    try{

   console.log(idsList);
   var idList = [];
    
    //for(reqId in idsList)
    for(var i = 0; i < idsList.length; i++) 
    {
        idList.push(idsList[i].id) ;
        
    } 
    console.log(idList);

    //return dbRetval.db('ls_gpsdatabase').collection('gpsevent').find({ "deviceid":{$in: idList}}).sort({ "_id": -1 }).toArray();
    return dbRetval.db('ls_gpsdatabase').collection('gpsevent').aggregate([
        { "$match": { "deviceid": { "$in": idList}} },
        { "$sort": { "_id": -1} },
        { "$group": { "_id": "$deviceid" , "doc": { "$first": "$$ROOT" }}} ]).toArray();
}
catch (error) {
    console.log("in catch"+error);
    return error;
}
    //var obj_ids = idList.map(function(id) { return ObjectId(id); });
   // var query = { "deviceid":reqId.id};
    
   /*  dbRetval.db('ls_gpsdatabase').collection('gpsevent').find({ "deviceid":{$in: idList}}).sort({ "_id": -1 }).toArray(function(err, items) 
    {
        if (err) {
            console.log("in if "+err);
            return err;
          } else {
            console.log("one");
		console.log(items);
                var item = items[0];
                var values = item.values;
                var length = values.length;
                var value = values[length-1];
                for(key in value)
                {
                    console.log("two");
                    console.log(key);
                    var minInner = value[key];
                    minInner = minInner.sort();
                    var min = minInner[minInner.length-1];
                    for(kkey in min)
                        {
                            //item.timestamp = item.timestamp.replace('T',' ');
                            //item.timestamp = item.timestamp.replace('Z','');
                            //var dateArray = item.timestamp.split(' ');
                            //var date = dateArray[0].split('-');
                            //var timeArray = dateArray[1].split(":");
                            //var day = date[0];
                            //if(parseInt(day) <10)
                             //   {
                             //       day = "0"+day;
                             //   }
                            //var dat = date[1];
                            //if(parseInt(dat) <10)
                             //  {
                              //      dat = "0"+dat;
                              //  }
                            //var finddatetime =  moment(date[2]+"-"+dat+"-"+day+"T"+dateArray[1]+"Z");//new Date(Date.parse(req.body.timestamp));
                            console.log("three");
			   console.log(kkey);
			    var finddatetime =  new Date(Date.parse(item.timestamp));
                           //console.log(finddatetime );
                            var findtimestamp = finddatetime.setMinutes(key);                    
                            findtimestamp = finddatetime.setSeconds(kkey);
                            //findtimestamp = finddatetime.toISOString();
                           //console.log(finddatetime.toISOString() ); 
                            //var finddatetime = new Date((item.timestamp));
                           // var findtimestamp = finddatetime.getFullYear() +"-"+finddatetime.getMonth()+"-"+finddatetime.getDate()+" "+finddatetime.getHours()+":"+key+":"+kkey;
                            secvalue.push({"timestamp":finddatetime.toISOString(),"id":item.deviceid,"lat": min[kkey].lat, "long": min[kkey].long, "spd": min[kkey].spd, "head": min[kkey].head, "alt": min[kkey].alt, "alarms":min[kkey].alarms, "status":min[kkey].status});
                            console.log("four");
                            console.log(secvalue);
                        }                    
                }
                
           }
        
    });
    

    }
    catch (error) {
        console.log("in catch"+error);
        return error;
    }

    console.log("five");
    console.log(secvalue);
    return secvalue;*/
}

app.post("/api/getgpsevent",function(req,res)
{
    var data = [];
    GetGpsData(req.body.values).then(
        function(items) {
            try{
            console.log("one"+items.length);
                   console.log(items);
                   for(element in items)
                   {
                    var item = items[element];
                    console.log(item);
                    var values = item.doc.values;
                    console.log(item.doc.values);
                    var length = values.length;
                    var value = values[length-1];
                    for(key in value)
                    {
                        console.log("two");
                        console.log(key);
                        var minInner = value[key];
                        minInner = minInner.sort();
                        var min = minInner[minInner.length-1];
                        for(kkey in min)
                            {
                                //item.timestamp = item.timestamp.replace('T',' ');
                                //item.timestamp = item.timestamp.replace('Z','');
                                //var dateArray = item.timestamp.split(' ');
                                //var date = dateArray[0].split('-');
                                //var timeArray = dateArray[1].split(":");
                                //var day = date[0];
                                //if(parseInt(day) <10)
                                 //   {
                                 //       day = "0"+day;
                                 //   }
                                //var dat = date[1];
                                //if(parseInt(dat) <10)
                                 //  {
                                  //      dat = "0"+dat;
                                  //  }
                                //var finddatetime =  moment(date[2]+"-"+dat+"-"+day+"T"+dateArray[1]+"Z");//new Date(Date.parse(req.body.timestamp));
                                console.log("three");
                   console.log(kkey);
                    var finddatetime =  new Date(Date.parse(item.doc.timestamp));
                               //console.log(finddatetime );
                                var findtimestamp = finddatetime.setMinutes(key);                    
                                findtimestamp = finddatetime.setSeconds(kkey);
                                //findtimestamp = finddatetime.toISOString();
                               //console.log(finddatetime.toISOString() ); 
                                //var finddatetime = new Date((item.timestamp));
                               // var findtimestamp = finddatetime.getFullYear() +"-"+finddatetime.getMonth()+"-"+finddatetime.getDate()+" "+finddatetime.getHours()+":"+key+":"+kkey;
                               data.push({"timestamp":finddatetime.toISOString(),"id":item.doc.deviceid,"lat": min[kkey].lat, "long": min[kkey].long, "spd": min[kkey].spd, "head": min[kkey].head, "alt": min[kkey].alt, "alarms":min[kkey].alarms, "status":min[kkey].status});
                                console.log("four");
                                console.log(data);
                            }}
                        }
                            res.send(data);
                    }
                    catch (error) {
                        console.log("in catch"+error);
                        res.send(error);
                    }
            
          }, function(err) {
            console.error('The promise was rejected', err, err.stack);
          }
    );
    
});


//

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.end('fail');
}
