var ueberDB = require("ueberDB");
var udb = new ueberDB.database("dirty", {"filename" : "./dirty.db"});
var express = require('express');
var cors = require("cors");
var app = express();
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser());

app.get('/api/v2/device/list', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  udb.findKeys("*",null, function(e,data){
    var models = [];
    data.forEach(function(k,er){
      var model = k.split(":")[1];
      models.push(model);
    });
    var uniqueModels = arrayUnique(models);
    console.log(uniqueModels);
    models = uniqueModels.sort();
    res.json(models);
  })
});

app.get('/api/v2/device/search/*', function(req, res){
  console.log(req.url);
  var query = req.url.split("/");
  var model = query[query.length-1];
  var search = unescape(model);
  res.setHeader('Content-Type', 'application/json');
  udb.findKeys("*",null, function(e,data){
    var models = [];
    data.forEach(function(k,er){
      var model = k.split(":")[1];
      var rM = search.toLowerCase();
      var model = model.toLowerCase();
      // console.log("rM", search, "model", model);
      if(model.indexOf(rM) >= 0){
        models.push(model);
      }
    });
    var uniqueModels = arrayUnique(models);
    // console.log(uniqueModels);
    models = uniqueModels.sort();
    res.json(models);
  })
});

app.get('/api/v1/sweetspot', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(!req.query.model){
    res.json({msg:"Error no model set"});
    return false;
  }
  var model = req.query.model;
  console.log("Grabbing ", model);
  udb.findKeys("*:"+model,null, function(e,data){
    var results = "[";
    data.forEach(function(k,er){
      udb.get(k, function(e, row){
        // This is fucking ugly.
        var item = er+1;
        var trail = "";
        if(item !== data.length) trail = ",";
        results += JSON.stringify(row) + trail;
      });
    });
    results += "]";
    console.log(results);
    res.json(results);
  })  
});

app.get('/api/v2/sweetspot', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(!req.query.model){
    res.json({msg:"Error no model set"});
    return false;
  }
  var model = req.query.model;
  console.log("Grabbing ", model);
  udb.findKeys("*:"+model,null, function(e,data){
    var results = "[";
    data.forEach(function(k,er){
      udb.get(k, function(e, row){
        // This is fucking ugly.
        var item = er+1;
        var trail = "";
        if(item !== data.length) trail = ",";
        results += JSON.stringify(row) + trail;
      });
    });
    results += "]";
    console.log(results);
    res.json(results);
  })  
});

app.post('/api/v1/sweetspot', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(!req.body.model || !req.body.x || !req.body.y ){
    console.log("no data");
    res.json({msg:"Error no model, x or y set"});
    return false;
  }
  var model = req.body.model;
  var x = req.body.x;
  var y = req.body.y;

  // Check X and Y are integers
  var intRegex = /^\d+$/;
  if(intRegex.test(x) && intRegex.test(y)) {
    
  }else{
    res.json({msg:"Error x or y isn't an integer"});
    return false;
  }
  // Check model is < 100 characters in length
  if(model.length >= 100){
    res.json({msg:"Model too long"});
    return false;
  }

  console.log("saving data for", model, x, y);

  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };
  })();
  var key = guid()+":"+model;
  console.log("Key", key);
  udb.set(key, {"x":x,"y":y});
  res.json({"success":true});
});

app.post('/api/v2/sweetspot', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body);
  if(!req.body.model || !req.body.x || !req.body.y ){
    console.log("no data");
    res.json({msg:"Error no model, x or y set"});
    return false;
  }
  var model = req.body.model;
  var x = req.body.x;
  var y = req.body.y;
  var maxX = req.body.maxX; // maximum X pixels on the screen
  var maxY = req.body.maxY; // maximum Y pixels on the screen

  // Check X and Y are integers
  var intRegex = /^\d+$/;
  if(intRegex.test(x) && intRegex.test(y) && intRegex.test(maxX) && intRegex.test(maxY)) {
    // all is good
  }else{
    res.json({msg:"Error x,y,maxx or maxy isn't an integer"});
    return false;
  }
  // Check model is < 100 characters in length
  if(model.length >= 100){
    res.json({msg:"Model too long"});
    return false;
  }
  console.log("saving data for", model, x, y, maxX, maxY);

  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
  })();

  var key = guid()+":"+model;
  console.log("Key", key);
  udb.set(key, {"x":x,"y":y,"maxX":+maxX,"maxY":+maxY});
  res.json({"success":true});
});

udb.init(function (err){
  if(err)
  {
    console.error(err);
    process.exit(1);
  }else{
    console.log("Ueber Started");
    app.listen(8001);
  }
});

var arrayUnique = function(a) {
  return a.reduce(function(p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
};
