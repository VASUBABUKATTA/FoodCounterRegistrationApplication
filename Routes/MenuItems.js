const express = require('express');
const router = express.Router();
const db = require('../db');
const { route } = require('./CounterRegistration');

// creating table dynamically
const createCategoryTable = `
       CREATE TABLE IF NOT EXISTS Categorys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    counter_id BIGINT NOT NULL,
    FOREIGN KEY (counter_id) REFERENCES usersregistrationcounter(id) ON DELETE CASCADE
);
    `;

const createMenuItemTable = `
        CREATE TABLE IF NOT EXISTS menuItems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    price VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categorys(id) ON DELETE CASCADE
);
    `;

// creating table dynamically
const createMenuItemsTable = `
CREATE TABLE IF NOT EXISTS menu_items (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR(255) NOT NULL,
description TEXT,
price DECIMAL(10,2) NOT NULL,
category VARCHAR(100) NOT NULL,
available BOOLEAN DEFAULT TRUE,
counter_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (counter_id) REFERENCES usersregistrationcounter(id) ON DELETE CASCADE
);
`;

// Database queries
const insertQuery = "INSERT INTO menu_items (item_name,category,available,counter_id) VALUES(?,?,?,?)"
// const readQuery = "SELECT * FROM menu_items ";
const readQueryById = "SELECT * FROM menu_items WHERE ID = ?"
const readQueryByCounterId = "SELECT * FROM menu_items WHERE counter_id = ?"
const readQueryByCategory = "SELECT * FROM menu_items WHERE category = ?"
const readQueryByItem = "SELECT * FROM menu_items WHERE item_name = ?"
const deleteQueryById = "DELETE FROM menu_items WHERE ID = ?"

// checking the counter id is Existing or not
const checkCounterId = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE ID = ?"
const updateQueryById = "UPDATE menu_items SET item_name = ?, description = ?, price = ?, category = ?, available = ?, counter_id = ? WHERE ID = ?";


// Read Category Items By CounterId
const readQueryCategoryByCounterId = "SELECT * FROM Categorys WHERE counter_id = ?"
// Read MenuItemTable bY CategoryId
const readQueryMenuItemsByCategoryId = "SELECT * FROM menuItems WHERE category_id = ?"

db.query(createMenuItemsTable, (err, res) => {
    if (err) return console.log("Table was not created" + err);
    else return console.log("Table was created successfully" + res);
});
db.query(createCategoryTable, (err, res) => {
    if (err) return console.log("Table was not created" + err);
    else return console.log("Table was created successfully" + res);
});
db.query(createMenuItemTable, (err, res) => {
    if (err) return console.log("Table was not created" + err);
    else return console.log("Table was created successfully" + res);
});

// calling the Api whether is working or not
router.get('/', (req, res) => {

    res.json({ message: "Welcome to the Node Js Backend.. for MenuItemsTable Api's !" });
})

router.post('/save', (req, res) => {
    const { item_name, description, price, category, available, counter_id } = req.body;
    if (!req.body) return res.status(400).json(err);
    db.query(checkCounterId, [counter_id], (err, result) => {
        if (err) return res.status(400).json(err);
        if (result.length > 0) {
            db.query(insertQuery, [item_name, description, price, category, available, counter_id], (err, result) => {
                if (err) return res.status(400).json(err);
                else return res.status(201).json({ message: "Counter added Successfully ", menuId: result.insertId });
            })
        }
        else {
            return res.status(404).json({ message: "CounterId was not available in counter table : " + counter_id });
        }
    })

})


// to add category in menu at counter pannel
router.post("/addCategory", (req, res) => {

    const { categoryName, available, counter_id } = req.body;


    const checkCounterId = "SELECT * FROM USERSREGISTRATIONCOUNTER WHERE ID = ?";

    const isCategoryPresent = "select * from Categorys where name=? and counter_id=?";

    const insertQuery = "INSERT INTO Categorys (name,available,counter_id) VALUES(?,?,?)";

    if (!req.body) return res.status(400).json(err);

    db.query(checkCounterId, [counter_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).json(err);
        }

        if (result.length > 0) {

            db.query(isCategoryPresent, [categoryName.toLowerCase(), counter_id], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "err while checking isCategoryPresent" })
                }
                else {
                    if (result.length > 0) {
                        return res.status(404).json({ message: "Counter already exists " });
                    }
                    else {
                        db.query(insertQuery, [categoryName.toLowerCase(), available, counter_id], (err, result) => {
                            console.log("q2");
                            if (err) {
                                console.log(err);
                                return res.status(400).json(err);
                            }
                            else return res.status(201).json({ message: "Counter added Successfully " });
                        })
                    }
                }
            })


        }
        else {
            return res.status(404).json({ message: "CounterId was not available in counter table : " + counter_id });
        }
    })

})

// get call to read the data in db
// router.get('/getAll',(req,res)=>{
//     db.query(readQuery,(err,result)=>{
//         if(err) return res.status(400).json(err);
//         else return res.status(200).json(result)
//     })
// })

router.post("/addItems", (req, res) => {
    const { itemName, price, available, category_id } = req.body;

    const checkCategoryId = `select * from Categorys WHERE ID = ?`;

    const isItemPresent = "Select *from menuItems where name =? and category_id=?";

    const insertQuery = "INSERT INTO menuItems (name,price,available,category_id) VALUES(?,?,?,?)";

    db.query(checkCategoryId, [category_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "err while checking categoryID" })
        }
        else {
            if (result.length > 0) {
                db.query(isItemPresent, [itemName.toLowerCase(), category_id], (err, result) => {
                    if (result.length > 0) {
                        return res.status(404).json({ message: `${itemName} already exists for categoryId ${category_id}` });
                    }
                    else {
                        db.query(insertQuery, [itemName.toLowerCase(), price, available, category_id], (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json(err);
                            }
                            else return res.status(201).json({ message: "item added Successfully " });
                        })
                    }

                })
            }
            else {
                return res.status(500).json({ message: "categoryID not present" })
            }

        }


    })

})


// router.get("/getAllCategorys", (req, res) => {
//     const getQuery = `SELECT * 
//     FROM Categorys c  
//     JOIN menuItems m ON c.id = m.category_id`;


//     db.query(getQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({ message: "err while retriving the data" })
//         }
//         else
//             return res.status(200).json(result);
//     })
// })

router.get("/getAllCategories", (req, res) => {
    const getQuery = `
        SELECT c.id AS categoryId, c.name AS categoryName, 
               m.id AS itemId, m.name AS itemName, m.price
        FROM Categorys c  
        LEFT JOIN menuitems m ON c.id = m.category_id
    `;

    db.query(getQuery, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error while retrieving data" });
        }

        // Transform flat SQL results into nested JSON format
        const categoryMap = {};

        results.forEach(row => {
            if (!categoryMap[row.categoryId]) {
                categoryMap[row.categoryId] = {
                    name: row.categoryName,
                    categoryId: row.categoryId,
                    menu: []
                };
            }

            if (row.itemId) {
                categoryMap[row.categoryId].menu.push({
                    name: row.itemName,
                    price: row.price,
                    itemId: row.itemId
                });
            }
        });

        const formattedData = Object.values(categoryMap);

        return res.status(200).json(formattedData);
    });
});

router.put("/updateCategory", (req, res) => {

    const { categoryId, counter_id, categoryName } = req.body;
    console.log(req.body);

    const updateQuery = "update Categorys set name=? where id=? ";
    const isCategoryPresent = "select * from Categorys where name=? and counter_id=?"

    db.query(isCategoryPresent, [categoryName.toLowerCase(), counter_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "err while checking isCategoryPresent" })
        }
        else {
            if (result.length > 0) {
                return res.status(404).json({ message: "Counter already exists " });
            }
            else {
                db.query(updateQuery, [categoryName.toLowerCase(), categoryId], (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json(err);
                    }
                    else return res.status(201).json({ message: "Counter updated Successfully " });
                })
            }
        }
    })
})

router.delete("/deleteCategory/:categoryId", (req, res) => {
    const { categoryId } = req.params;
    console.log(categoryId);

    const deleteQuery = "Delete from Categorys where id=?";
    db.query(deleteQuery, [categoryId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "err while deleteing the category" });
        }
        else
            return res.status(204).json({ message: "Deleted Successfully" })
    })
})

// router.put("/updateItem", (req, res) => {
//     const { itemName, itemId, price, category_id } = req.body;
//     console.log(req.body);

//     const checkCategoryId = `select * from Categorys WHERE ID = ?`;

//     const updateQuery = "UPDATE menuItems SET name = ?, price = ? WHERE id = ?";

//     // const isItemPresent = "Select * from menuItems where name = ? AND category_id=?";
//     const isItemPresent = "SELECT * FROM menuItems WHERE name = ? AND category_id = ? AND id != ?";



//     db.query(checkCategoryId, [category_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({ message: "err while checking categoryID" })
//         }
//         else {
//             if (result.length > 0) {
//                 db.query(isItemPresent, [itemName.toLowerCase(), category_id, itemId], (err, result) => {
//                     console.log(result.length);
//                     console.log(result);


//                     if (result.length > 0) {
//                         return res.status(404).json({ message: `${itemName} already exists for categoryId ${category_id}` });
//                     }
//                     else {
//                         db.query(updateQuery, [itemName.toLowerCase(), price, itemId], (err, result) => {
//                             if (err) {
//                                 console.log(err);
//                                 return res.status(400).json(err);
//                             }
//                             else {
//                                 return res.status(201).json({ message: "item updated Successfully " });
//                             }
//                         })
//                     }

//                 })
//             }
//             else {
//                 return res.status(500).json({ message: "categoryID not present" })
//             }

//         }


//     })
// })

router.put("/updateItem", (req, res) => {
    const { itemName, itemId, price, category_id } = req.body;
    console.log(req.body);

    const checkCategoryId = `SELECT * FROM Categorys WHERE ID = ?`;
    const updateQuery = "UPDATE menuItems SET name = ?, price = ? WHERE id = ?";
    const isItemPresent = "SELECT * FROM menuItems WHERE name = ? AND category_id = ? AND id != ?";

    db.query(checkCategoryId, [category_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error while checking categoryID" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Category ID not present" });
        }

        // Check if the item name already exists for the same category_id
        db.query(isItemPresent, [itemName.toLowerCase(), category_id, itemId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error checking item presence" });
            }

            console.log("Duplicate check result:", result);

            if (result.length > 0) {
                return res.status(400).json({ message: `Item '${itemName}' already exists in category ${category_id}` });
            }

            // Proceed with updating if no duplicate is found
            db.query(updateQuery, [itemName.toLowerCase(), price, itemId], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Error updating item" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Item not found" });
                }

                return res.status(201).json({ message: "Item updated successfully" });
            });
        });
    });
});


router.delete("/deleteItem/:itemId", (req, res) => {
    const { itemId } = req.params;
    console.log(itemId);

    const deleteQuery = "Delete from menuItems where id=?";
    db.query(deleteQuery, [itemId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "err while deleteing the category" });
        }
        else
            return res.status(204).json({ message: "Deleted Successfully" })
    })
})

router.put("/updateCategoryStatus", (req, res) => {

    const { available, categoryId } = req.body

    const updateQuery = "update Categorys set available=? where id=? ";

    db.query(updateQuery, [available, categoryId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "err while updating category status" });
        }
        else return res.status(201).json({ message: `Category Status updated to ${available} for CategoryId ${categoryId}` })
    })

})




router.get('/getAll', (req, res) => {
    const readQuery = "SELECT * FROM menu_items ";
    db.query(readQuery, (err, result) => {
        if (err) return res.status(400).json(err);
        else return res.status(200).json(result)
    })
})




// get calling based on id to read the data in db
router.get('/getById/:id', (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: " ID Parameter is required" })

    db.query(readQueryById, [id], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({ message: "No record found for ID: " + id });
            }
        }
    })

})

// get Conter Id by Category
router.get('/getCategory/ByCounterId/:id', (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: " ID Parameter is required" })

    db.query(readQueryCategoryByCounterId, [id], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: "No record found for ID: " + id });
            }
        }
    })

})


// get MenuItems by Category Id
router.get('/getCategory/ByCateGoryId/:id', (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: " ID Parameter is required" })

    db.query(readQueryMenuItemsByCategoryId, [id], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: "No record found for ID: " + id });
            }
        }
    })

})

// get the items details based on counterid
router.get('/getByCounterId/:counterId', (req, res) => {
    const counterId = req.params.counterId;
    if (!counterId) return res.status(400).json({ message: " CounterId Parameter is required" })

    db.query(readQueryByCounterId, [counterId], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: "No record found for the CounterId: " + counterId });
            }
        }
    })

})

// get the items details based on Category
router.get('/getByCategory/:category', (req, res) => {
    const category = req.params.category;
    if (!category) return res.status(400).json({ message: " Category Parameter is required" })

    db.query(readQueryByCategory, [category], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: "No record found for the Category: " + category });
            }
        }
    })

})


// get the items details based on Item
router.get('/getByItem/:item', (req, res) => {
    const item = req.params.item;
    if (!item) return res.status(400).json({ message: " Category Parameter is required" })

    db.query(readQueryByItem, [item], (err, result) => {
        if (err) return res.status(400).json(err);
        else {
            if (result.length > 0) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: "No record found for the Item: " + item });
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



router.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { item_name, description, price, category, available, counter_id } = req.body;
    if (!id || !req.body) {
        return res.status(400).json({ message: "ID and body parameters required" });
    }
    // Checking whether the ID exists in the DB
    db.query(readQueryById, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err });
        }
        if (result.length > 0) {

            db.query(checkCounterId, [counter_id], (err, result) => {
                if (err) return res.status(400).json(err);
                if (result.length > 0) {
                    // After checking, proceed to delete
                    db.query(updateQueryById, [item_name, description, price, category, available, counter_id, id], (updateErr, updateResult) => {
                        if (updateErr) {
                            return res.status(500).json({ error: "Updation failed", details: updateErr });
                        }
                        return res.status(201).json({ message: "Successfully updated for the record with ID: " + id });
                    });
                }
                else {
                    return res.status(404).json({ message: "CounterId was not available in counter table : " + counter_id });
                }
            })
        } else {
            return res.status(404).json({ message: "No record found for ID: " + id });
        }
    });
});

module.exports = router;
