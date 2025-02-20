const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const fs = require('fs')
const path = require('path')
const multer = require('multer')


// configurations for express , cors and body parser 
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Parse form data

// Import routes
const counterRegistrationApis = require('./Routes/CounterRegistration')
const menuItemRegistrationApis = require('./Routes/MenuItemsForCounter')
const userOrders = require('./Routes/UserOrders')

// Use routes
app.use('/counter',counterRegistrationApis)
app.use('/menuItem',menuItemRegistrationApis)
app.use('/order',userOrders)

// Serve images from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// checking the Application is running or not 
app.get('/',(req,res)=>{
    res.json({message : "Welcome to the Node Js Backend.. Api's !"})
})

// Application Running Under Port Number By Using below statement 
const Port = process.env.APP_Port ;
app.listen(Port, () => console.log(`Server running on port ${Port}`));