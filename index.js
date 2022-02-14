const express = require('express')
const app = express()

const port = process.env.PORT || 5000;
require('dotenv').config();

var cors = require('cors')


var admin = require("firebase-admin");

var serviceAccount = require('./second-ema-firebase-adminsdk-dlegi-f9e5c91afb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


//middleware
app.use(cors());
app.use(express.json())

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.89jki.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function verifyToken (req, res, next){
  if(req.headers?.authorization?.startsWith('Bearer ')){
     const Token = req.headers.authorization.split(' ')[1];
  
    try{
const decodedUser = await admin.auth().verifyToken(Token);
console.log('email', decodedUser.email);

req.decodedUserEmail = decodedUser.email;
    }
    catch{

    };
}
next();
};


async function run(){
try {
await client.connect();
const database = client.db('online_Shopes');
const productCollection  = database.collection('products');
const ordersCollection  = database.collection('orders');

//GET PRODUCT API
app.get('/products', async(req, res) =>{
    const coursor = productCollection.find({});
    const page = req.query.page;
    const size = parseInt(req.query.size);
    let products;
  
    const count = await coursor.count();
    if(page) {
      products = await coursor.skip(page*size).limit(size).toArray();
    }
    else{
      products = await coursor.toArray();
    };
    res.send({
      count,
      products
    });
      });

      //use post request
      app.post('/products/byKeys', async(req, res) =>{
       
        const keys = req.body;
        const query = {key: {$in: keys}};
        const products = productCollection.find(query);
        res.json(products);
      });

      app.get('/order', verifyToken, async(req, res) =>{
        
        const email = req.query.email;
      
      else{
        res.status(401).json({message: 'user not found unothorize'})
      };
       
      });

      app.post('/order', async(req, res)=>{
        const order = req.body;
        order.createdAt = new Date();
        const result = ordersCollection.insertOne(order);
        res.json(result);
      });
}
finally{
//
}
}
run().catch(console.dir)

app.get('/', (req, res) => {res.send('Hello World!')});
  
  app.listen(port, () => {console.log(`server start`,port)});