const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyToken } = require('./middleware');
require('dotenv').config();
const app = express(); 
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edk1eij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// create token 
const createToken = (user) =>{
  const tokenData = {email: user?.email , role: user?.role}
  var token = jwt.sign(tokenData, process.env.SECRET_TOKEN);
  return token;
}
const checkPassword = async(password , hash) => {
  
const isPasswordValid = await bcrypt.compare(password, hash);
return isPasswordValid;
} 
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db('mobile-banking');
    const userCollection = database.collection('users');
    const transactionCollection = database.collection('transaction');

    // authentication api
 app.post('/register', hashPassword, async(req, res)=>{
   try {
    const data = req.body;
    req.body.status = 'pending'
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const isExistEmail = await userCollection.findOne({email: email})
    const isPhoneEmail = await userCollection.findOne({phoneNumber: phoneNumber})
    if (isExistEmail || isPhoneEmail) {
      return res.json({
        status: 400,
        success: false,
        error: 'This user already exist'
      })
    }
    
    const result = await userCollection.insertOne(data);
    const token = createToken(data);
    return res.json({
      success: true,
      message: "user register successful",
      data: result,
      token
    })
    
   } catch (error) {
    return res.json({
      success: false,
      error: error?.message
    })
   }
 })

 app.post("/login",  async(req, res) => {
  try {
    const {phoneNumber , password} = req.body;
    const userDetails = await userCollection.findOne({phoneNumber: phoneNumber})
    const isCheckPassword = checkPassword(password , userDetails?.password);
    if (!isCheckPassword) {
      return res.json({
        success: false,
        status: 400,
        error: "invalid credential"
      })
    }
    if(!userDetails){
      return res.json({
        success: false,
        status: 400,
        error: "user not found"
      })
    }
   
   
    const token = createToken(userDetails);
    return res.json({
      success: true,
      message:"user login successful",
      data: userDetails,
      token
    })

  } catch (error) {
    return res.json({
      success: false,
      error: error?.message
    })
  }
    

 });

 app.get('/me',  async(req, res) =>{

 });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',  (req, res) =>{
    res.send("mobile banking server is running")
})

app.listen(port , ()=>{
    console.log(`Example app listening on port ${port}`)
})