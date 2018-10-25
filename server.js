var express = require('express'),
	methodOverride = require('method-override');
  bodyParser = require('body-parser');
	restful = require('node-restful'),
	mongoose =  restful.mongoose;

var amqp = require('amqplib/callback_api');

if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongourl = env.mlab[0].credentials.uri;
  var rabbiturl = env.cloudamqp[0].credentials.uri;
}
else{
  var mongourl = "mongodb://localhost/restful-prototype";
  var rabbiturl = "amqp://localhost";
}

var sendMessage = function(msg){
    amqp.connect(rabbiturl, function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'audit';

        ch.assertQueue(q, {durable: false});
        ch.sendToQueue(q, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
      });
      setTimeout(function() { conn.close(); }, 500);
    });
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


var Product = restful.model('Product', ProductSchema);
Product.methods(['get', 'put','post','delete']);

Product.after('post', function(req, res, next) {
  console.log("posting message");
  sendMessage("inserting product: " + req.body.sku);
  next(); // Don't forget to call next!
});

Product.after('put', function(req, res, next) {
  console.log("updating message");
  sendMessage("updating product: " + req.body.sku);
  next(); // Don't forget to call next!
});

Product.after('delete', function(req, res, next) {
  console.log("deleting message");
  sendMessage("deleting product id: " + req.query.id);
  next(); // Don't forget to call next!
});

Product.route('removeall', ['delete'], function(req, res, next) {
  Product.remove({}, function (err) {
        if (err) {
          console.log(err);
        } 
    });
    res.send("records cleared!");
});

Product.register(app, '/api/products');

app.listen(port, host);
// sendMessage("test message product: ");
console.log("Server is on air, port " + port);