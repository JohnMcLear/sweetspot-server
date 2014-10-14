var ueberDB = require("ueberDB");
var udb = new ueberDB.database("dirty", {"filename" : "./dirty.db"});
var express = require('express');
var cors = require("cors");
var app = express();
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser());

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

app.post('/api/v1/sweetspot', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(!req.query.model || !req.query.x || !req.query.y ){
    console.log("no data");
    res.json({msg:"Error no model, x or y set"});
    return false;
  }
  var model = req.query.model;
  var x = req.query.x;
  var y = req.query.y;

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

// save a record
function saveRecord(model, x, y){
  udb.set(model, {x:x,y:y});
}
