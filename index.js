const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
    if(err){
      return res.status(403).send({message: 'Forbidden access'});
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
  })
  next();

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lx750.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("electronics");
        const bookingcollection = database.collection("booking");
          const userscollection = database.collection("users");
        //  const reviewCollection = database.collection("reviews");


   
//  get api for showing all products , managing all items and my items     
 
app.get('/booking', verifyJWT, async(req,res)=>{
  const decodedEmail = req.decoded.email;
  const email=req.query.email;
  if(email === decodedEmail){
    const query={email:email};
  const cursor= bookingcollection.find(query);
  const myProducts= await cursor.toArray();
  res.send(myProducts);
  }
  else{
    res.status(403).send({message: 'forbidden access'})
  }
})



// GET API FOR SHOWING INDIVIDUAL product DETAILS 
app.get('/product/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id:ObjectId(id)};
  const product = await bookingcollection.findOne(query);
  res.json(product);

})

// delete product 
app.delete('/product/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const result = await bookingcollection.deleteOne(query);
  res.send(result);
})

// update product 
app.put('/product/:id', async(req,res)=>{
  const id = req.params.id;
  const updated = req.body;
  const filter = {_id:ObjectId(id)};
  const options = { upsert: true};
  console.log(updated);
  const updatedDoc = {
    $set:{
      quantity:updated.quantity
    }
  };
  const result = await bookingcollection.updateOne(filter, updatedDoc, options);
  res.send(result);
})

// // get api for all reviews 
app.get('/reviews', async(req,res)=>{
  const cursor = reviewCollection.find({});
  const reviews = await cursor.toArray();
  res.send(reviews);
});

// post api for posting reviews 
app.post('/reviews', async(req,res)=>{
  const review = req.body;
  console.log('hit the post api',review);

  const result = await reviewCollection.insertOne(review);
   res.json(result)

});

// })
//   // POST API TO ADD BOOKING OF ANY product 
app.post('/booking', async(req, res) => {
  const newroom = req.body; 
  const result = await bookingcollection.insertOne(newroom);
  console.log('hitting the post',req.body);      
  res.json(result);
        
}) 

       // post api for posting reviews 
app.post('/reviews', async(req,res)=>{
  const review = req.body;
  console.log('hit the post api',review);

  const result = await reviewCollection.insertOne(review);
   res.json(result)

}); 
    } 
    finally {
      
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
