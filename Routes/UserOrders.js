const db = require('../db');
const express = require('express');
const router = express.Router();

// creating table dynamically
const ordersTable = `
      CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    counter_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Preparing', 'Completed', 'Cancelled') DEFAULT 'Pending',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (counter_id) REFERENCES usersregistrationcounter(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);  
    `;

    // Database queries
const insertQuery = "INSERT INTO orders (item_id,counter_id,total_price,quantity) VALUES(?,?,?,?)"
const readQuery = "SELECT * FROM orders "
const readQueryById = "SELECT * FROM orders WHERE ID = ?"
const readQueryByCounterId = "SELECT * FROM orders WHERE counter_id = ?"

const deleteQueryById = "DELETE FROM orders WHERE ID = ?"

// checking the counter id is Existing or not
const checkCounterId = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE ID = ?"
const checkItemId = "SELECT * FROM menu_items WHERE ID = ?"


const dailyPrice = "SELECT SUM(total_price) as total_price,count(*) as total_orders_plaaced FROM orders WHERE counter_id = ?"

const dailyPricedetails = "SELECT counter_id,SUM(total_price) as total_price,count(*) as total_orders_plaaced FROM orders GROUP BY counter_id "

db.query(ordersTable,(err,res)=>{
    if(err) return console.log("Table was not created"+err);
    else return console.log("Table was created successfully"+res);
});

// calling the Api whether is working or not
router.get('/',(req,res)=>{
res.json({ message: "Welcome to the Node Js Backend.. for OrdersTable Api's !" });
})

// API route to save orders
router.post('/save', async (req, res) => {
    const { counter_id, orders } = req.body;

    // Validate request
    if (!counter_id || !Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ message: "Invalid JSON Request" });
    }

    try {
        // Check if counter_id exists
        const [counterCheck] = await db.promise().query(checkCounterId, [counter_id]);

        if (counterCheck.length === 0) {
            return res.status(404).json({ message: `Counter ID ${counter_id} does not exist` });
        }

        // Insert each order using for...of loop (Correct way to handle async operations in loops)
        for (const { item_id, quantity, total_price } of orders) {
            // Check if item_id exists
            const [itemCheck] = await db.promise().query(checkItemId, [item_id]);

            if (itemCheck.length === 0) {
                return res.status(404).json({ message: `Item ID ${item_id} does not exist` });
            }

            // Insert order
            await db.promise().query(insertQuery, [item_id, counter_id, total_price, quantity]);
        }

        return res.status(201).json({ message: "Orders placed successfully" });

    } catch (error) {
        console.error("Error placing orders:", error);
        return res.status(500).json({ message: "Failed to place orders", error });
    }
});

// get call to read the data in db
router.get('/getAll',(req,res)=>{
    db.query(readQuery,(err,result)=>{
        if(err) return res.status(400).json(err);
        else return res.status(200).json(result)
    })
})

// get calling based on id to read the data in db
router.get('/getById/:id',(req,res)=>{
    const id = req.params.id;
    if(!id)return res.status(400).json({message :" ID Parameter is required"})
    
        db.query(readQueryById,[id],(err,result)=>{
            if(err) return res.status(400).json(err);
            else{
                if (result.length > 0) {
                    return res.status(200).json(result[0]); 
                } else {
                    return res.status(404).json({ message: "No record found for ID: " + id });
                }
            } 
        })
    
})


// get the items details based on counterid
router.get('/getByCounterId/:counterId',(req,res)=>{
    const counterId = req.params.counterId;
    if(!counterId)return res.status(400).json({message :" CounterId Parameter is required"})
        
        db.query(readQueryByCounterId,[counterId],(err,result)=>{
            if(err) return res.status(400).json(err);
            else{
                if (result.length > 0) {
                    return res.status(200).json(result); 
                } else {
                    return res.status(404).json({ message: "No record found for the CounterId: " + counterId });
                }
            } 
        })
    
})

router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: "ID parameter required" });
    }
    // Checking whether the ID exists in the DB
    db.query(readQueryById, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err });
        }

        if (result.length > 0) {
            // After checking, proceed to delete
            db.query(deleteQueryById, [id], (deleteErr, deleteResult) => {
                if (deleteErr) {
                    return res.status(500).json({ error: "Deletion failed", details: deleteErr });
                }
                return res.status(200).json({ message: "Successfully deleted record with ID: " + id });
            });
        } else {
            return res.status(404).json({ message: "No record found for ID: " + id });
        }
    });
});

router.get('/getDailyPriseDetailsByCounterId/:counterId',(req,res)=>{
    const counterId = req.params.counterId;
    if(!counterId){return res.status(400).json({message:"counter id should required : "+counterId})};
    db.query(readQueryByCounterId,[counterId],(err,result)=>{
        if(err) return res.status(400).json(err);
        else{
            if (result.length > 0) {
                db.query(dailyPrice,[counterId],(priceerr,priceresult)=>{
                    if(err) return res.status(400).json(err);
                    return res.status(400).json(priceresult)
                }) 
            } else {
                return res.status(404).json({ message: "No record found for the CounterId: " + counterId });
            }
        } 
    })
})

router.get('/getDailyPriseDetails',(req,res)=>{
                db.query(dailyPricedetails,(priceerr,priceresult)=>{
                    if(priceerr) return res.status(400).json(priceerr);
                    return res.status(200).json(priceresult)
                }) 
})


module.exports = router;