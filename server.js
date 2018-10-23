var express = require('express'),
	methodOverride = require('method-override');
    bodyParser = require('body-parser');
	restful = require('node-restful'),
	mongoose =  restful.mongoose;

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongourl = env.mlab[0].credentials.uri
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"", 
    "name":"",
    "db":"restful-prototype"
  }

  var mongourl = generate_mongo_url(mongo);
}

var app = express();
var port = (process.env.PORT  || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
app.use(methodOverride());
// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// mongoose.connect('mongodb://localhost/restful-prototype');
mongoose.connect(mongourl);

var ProductSchema = mongoose.Schema({
	name: String,
	sku: String,
	price: Number
});
var Products = restful.model('products', ProductSchema);
Products.methods(['get', 'put','post','delete']);
Products.register(app, '/api/products');

app.listen(port, host);
console.log("Server is on air, port 3000");