const express = require('express');
const router = express.Router();
const db = require('../db');

const fs = require('fs')
const path = require('path')
const multer = require('multer');
// const { Port } = require('../');

// Function to get IST timestamp
function getISTTime() {
    const date = new Date();
    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000)) 
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '); // Format YYYY-MM-DD HH:MM:SS
}

// Insert IST timestamp into MySQL
const istTime = getISTTime();

// creating table dynamically 
const tableQuery  = `
    CREATE TABLE IF NOT EXISTS USERSREGISTRATIONCOUNTER (
        ID BIGINT AUTO_INCREMENT PRIMARY KEY, 
        OWNERNAME VARCHAR(255) NOT NULL, 
        MOBILENO VARCHAR(255) UNIQUE NOT NULL,  
        EMAIL VARCHAR(255) UNIQUE NOT NULL, 
        COUNTERNAME VARCHAR(255) UNIQUE NOT NULL,
        IMAGEPATH TEXT NOT NULL,
        AVAILABLE BOOLEAN DEFAULT TRUE,
        CREATED_AT TIMESTAMP NOT NULL
    );
`;

db.query(tableQuery,(err,res)=>{
    if (err) {console.log(err);
    }
    else {console.log(res);}
})



// calling the Api whether is working or not
router.get('/',(req,res)=>{
    res.json({ message: "Welcome to the Node Js Backend.. for COUNTER Registration Api's !" });
})

const imagePath = "/hi";

// Database queries
const insertQuery = "INSERT INTO USERSREGISTRATIONCOUNTER (OWNERNAME,MOBILENO,EMAIL,COUNTERNAME,CREATED_AT,IMAGEPATH) VALUES(?,?,?,?,?,?)"
const readQuery = "SELECT * FROM USERSREGISTRATIONCOUNTER "
const readQueryById = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE ID = ?"
const readQueryByMobileNo = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE MOBILENO = ?"
const deleteQueryById = "DELETE FROM USERSREGISTRATIONCOUNTER WHERE ID = ?"

const updtaeQueryById = "UPDATE USERSREGISTRATIONCOUNTER SET OWNERNAME = ?,MOBILENO = ?,EMAIL = ?,COUNTERNAME = ? WHERE ID = ?"
const updtaeQueryByIdForImage = "UPDATE USERSREGISTRATIONCOUNTER SET IMAGEPATH = ? WHERE ID = ?"

// checking duplicates are founded or not:
const checkEmail = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE EMAIL = ?"
const checkMobilNo = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE MOBILENO = ?"
const checkCounterName = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE COUNTERNAME = ?"

const updtaeQueryByIdForAvailability = "UPDATE USERSREGISTRATIONCOUNTER SET AVAILABLE = ? WHERE ID = ?"
// uploaded directory
const uploadDir = path.join(__dirname, `../uploads/`);

// Set up multer storage dynamically
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if directory exists, else create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `counter_profile_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage: storage });




// // post calling to store the data 
// router.post('/save',upload.single('IMAGE'), (req, res) => {
//     const { OWNERNAME, MOBILENO, EMAIL, COUNTERNAME,IMAGEPATH  } = req.body;

//     // Check if data is missing
//     if (!OWNERNAME || !MOBILENO || !EMAIL || !COUNTERNAME || !IMAGEPATH ) {
//         return res.status(400).json({ message: "All fields are required." });
//     }
//     // Check if the MOBILE NUMBER or EMAIL or COUNTERNAME already exists
//     db.query(checkMobilNo, [MOBILENO], (err, result) => {
//         if (err) return res.status(500).json(err);

//         if (result.length > 0) {
//             return res.status(400).json({ message: "Mobile number already exists." });
//         }

//         // Check for EMAIL duplicates
//         db.query(checkEmail, [EMAIL], (err, result) => {
//             if (err) return res.status(500).json(err);

//             if (result.length > 0) {
//                 return res.status(400).json({ message: "Email already exists." });
//             }

//             // Check for COUNTERNAME duplicates
//             db.query(checkCounterName, [COUNTERNAME], (err, result) => {
//                 if (err) return res.status(500).json(err);

//                 if (result.length > 0) {
//                     return res.status(400).json({ message: "Counter name already exists." });
//                 }

//                 const imagePath = `/uploads/${req.file.filename}`;
//                 // Insert the new record if no duplicates found
//                 db.query(insertQuery, [OWNERNAME, MOBILENO, EMAIL, COUNTERNAME, istTime,imagePath], (err, result) => {
//                     if (err) return res.status(400).json(err);
//                     return res.status(201).json({ message: "Counter added successfully", userId: result.insertId });
//                 });
//             });
//         });
//     });
// });


router.post('/save', upload.single('IMAGE'), (req, res) => {
    const { OWNERNAME, MOBILENO, EMAIL, COUNTERNAME } = req.body;

    // Check if file exists
    if (!req.file) {
        return res.status(400).json({ message: "Image is required." });
    }

    const IMAGEPATH = `/uploads/${req.file.filename}`;

    // Validate required fields
    if (!OWNERNAME || !MOBILENO || !EMAIL || !COUNTERNAME) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check for duplicate entries
    db.query(checkMobilNo, [MOBILENO], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            return res.status(400).json({ message: "Mobile number already exists." });
        }

        db.query(checkEmail, [EMAIL], (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                return res.status(400).json({ message: "Email already exists." });
            }

            db.query(checkCounterName, [COUNTERNAME], (err, result) => {
                if (err) return res.status(500).json(err);

                if (result.length > 0) {
                    return res.status(400).json({ message: "Counter name already exists." });
                }

                // Insert into database
                db.query(insertQuery, [OWNERNAME, MOBILENO, EMAIL, COUNTERNAME, istTime, IMAGEPATH], (err, result) => {
                    if (err) return res.status(500).json({ error: "Insert failed", details: err });
                    
                    return res.status(201).json({ message: "Counter added successfully", userId: result.insertId });
                });
            });
        });
    });
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
        else{
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
    }
})

// checking the mobilenumber based on MObileNo 
router.get('/getByMobileNo/:mobNo',(req,res)=>{
    const mobNo = req.params.mobNo;
    if(!mobNo)return res.status(400).json({message :" MobileNo Parameter is required"})
        else{
        db.query(readQueryByMobileNo,[mobNo],(err,result)=>{
            if(err) return res.status(400).json(err);
            else{
                if (result.length > 0) {
                    return res.status(200).json({ message: "record found for the MobileNo: " + mobNo }); 
                } else {
                    return res.status(404).json({ message: "No record found for the MobileNo: " + mobNo });
                }
            } 
        })
    }
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

router.put('/update/:id',(req,res)=>{
    const id = req.params.id;
    const {OWNERNAME,MOBILENO,EMAIL,COUNTERNAME} = req.body;
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
            db.query(updtaeQueryById, [OWNERNAME,MOBILENO,EMAIL,COUNTERNAME,id], (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).json({ error: "Updation failed", details: updateErr });
                }
                return res.status(201).json({ message: "Successfully updated for the record with ID: " + id });
            });
        } else {
            return res.status(404).json({ message: "No record found for ID: " + id });
        }
    });
});

// Route to update the image only
router.put('/update-image/:id', upload.single("image"), (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "ID parameter required" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`; // Path to store in DB

    // Checking if the ID exists in the database
    db.query(readQueryById, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err });
        }
        if (result.length > 0) {
            
            db.query(updtaeQueryByIdForImage, [imagePath, id], (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).json({ error: "Image update failed", details: updateErr });
                }
                return res.status(200).json({ message: "Image successfully updated for ID: " + id, imagePath });
            });
        } else {
            return res.status(404).json({ message: "No record found for ID: " + id });
        }
    });
});

// to retreive image by id
router.get('/getImage/:id', (req, res) => {
    const userId = req.params.id;

    const getImageQuery = `SELECT IMAGEPATH FROM usersregistrationcounter WHERE ID = ?`;

    db.query(getImageQuery, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });

        if (result.length === 0) return res.status(404).json({ message: "Image not found" });

        const imagePath = result[0].IMAGEPATH;
        res.json({ imageUrl: `http://localhost:9090${imagePath}` }); // Replace PORT with your actual port
    });
});

router.get("/getAllWithAllData", (req, res) => {
    const getCounterName = "SELECT COUNTERNAME, ID FROM USERSREGISTRATIONCOUNTER";

    db.query(getCounterName, (err, counters) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: "Database query failed", details: err });
        }

        if (counters.length === 0) {
            return res.status(200).json([]); // Return empty array if no counters found
        }

        let counterData = [];
        let pendingQueries = counters.length; // Track pending queries

        counters.forEach((counter) => {
            const getMenu = "SELECT category, item_name, price FROM menu_items WHERE counter_id = ?";

            db.query(getMenu, [counter.ID], (err, menuItems) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({ error: "Database query failed", details: err });
                }

                // Group menu items by category
                let categoriesMap = {};
                menuItems.forEach(item => {
                    if (!categoriesMap[item.category]) {
                        categoriesMap[item.category] = {
                            name: item.category,
                            menu: []
                        };
                    }
                    categoriesMap[item.category].menu.push({ name: item.item_name, price: item.price });
                });

                counterData.push({
                    COUNTERNAME: counter.COUNTERNAME,
                    Categories: Object.values(categoriesMap)
                });

                pendingQueries--;

                // Send response when all queries are completed
                if (pendingQueries === 0) {
                    res.status(200).json(counterData);
                }
            });
        });
    });
});

router.put('/getById/availability/:id/:availability',(req,res)=>{
    const id = req.params.id;
    const availability = req.params.availability;
    if(!id)return res.status(400).json({message :" ID Parameter is required"})
        else{
        db.query(readQueryById,[id],(err,result)=>{
            if(err) return res.status(400).json(err);
            else{
                if (result.length > 0) {
                    // return res.status(200).json(result[0]); 
                    db.query(updtaeQueryByIdForAvailability,[availability,id],(updateerr,updateres)=>{
                        if(updateerr) return res.status(400).json(updateerr);
                        else{
                            return res.status(201).json({ message: "Updated record Successfully for ID: " + id });
                        }
                    })
                } else {
                    return res.status(404).json({ message: "No record found for ID: " + id });
                }
            } 
        })
    }
})




module.exports = router;