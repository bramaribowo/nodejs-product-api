var express = require('express'),
	methodOverride = require('method-override');
    bodyParser = require('body-parser');
	restful = require('node-restful'),
	mongoose =  restful.mongoose;

var app = express();
app.use(methodOverride());
// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect('mongodb://localhost/restful-prototype');

var ProductSchema = mongoose.Schema({
	name: String,
	sku: String,
	price: Number
});
var Products = restful.model('products', ProductSchema);
Products.methods(['get', 'put','post','delete']);
Products.register(app, '/api/products');

app.listen(3000);
console.log("Server is on air, port 3000");