const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

const PORT = 3000;


// Middleware setup

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// MySQL connection configuration

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "",

    database: "codealpha_ecommerce"

});


// Connect to the MySQL database

db.connect(function (err) {

    if (err) {

        console.error(
            "MySQL Connection Failed!"
        );

        console.error(
            err.message
        );

        return;
    }

    console.log(
        "MySQL Connected Successfully"
    );

});


// Simple route to confirm the server is running

app.get("/", function (req, res) {

    res.send(
        "CodeAlpha E-Commerce Backend Running..."
    );

});


// Get all products from the database

app.get("/products", function (req, res) {

    const sql = `
        SELECT *
        FROM products
    `;

    db.query(
        sql,
        function (err, result) {

            if (err) {

                console.error(
                    "Products Error:",
                    err.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not load products",

                    error:
                        err.message
                });
            }

            res.status(200).json(result);

        }
    );

});


// Register a new user account

app.post("/register", function (req, res) {

    const {
        fullName,
        email,
        password
    } = req.body;


    console.log(
        "Registration Request:",
        email
    );


    // Make sure all required fields were provided

    if (
        !fullName ||
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All fields are required"

        });

    }


    // Check whether the email is already registered

    const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
    `;


    db.query(
        checkSql,
        [email],
        function (err, result) {

            if (err) {

                console.error(
                    "Registration Check Error:",
                    err.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error",

                    error:
                        err.message

                });

            }


            // Email already exists

            if (result.length > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Email already registered"

                });

            }


            // Insert the new user into the database

            const insertSql = `
                INSERT INTO users
                (
                    fullname,
                    email,
                    password
                )
                VALUES (?, ?, ?)
            `;


            db.query(
                insertSql,

                [
                    fullName,
                    email,
                    password
                ],

                function (
                    insertErr,
                    insertResult
                ) {

                    if (insertErr) {

                        console.error(
                            "Registration Error:",
                            insertErr.message
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Registration failed",

                            error:
                                insertErr.message

                        });

                    }


                    console.log(
                        "User Registered:",
                        email
                    );


                    res.status(201).json({

                        success: true,

                        message:
                            "Registration successful!",

                        userId:
                            insertResult.insertId

                    });

                }
            );

        }
    );

});


// Log in an existing user

app.post("/login", function (req, res) {

    const {
        email,
        password
    } = req.body;


    console.log(
        "Login Request:",
        email
    );


    // Make sure both fields were provided

    if (
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required"

        });

    }


    const sql = `
        SELECT
            id,
            fullname,
            email,
            password
        FROM users
        WHERE email = ?
    `;


    db.query(
        sql,
        [email],
        function (err, result) {

            if (err) {

                console.error(
                    "Login Database Error:",
                    err.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error",

                    error:
                        err.message

                });

            }


            // No user found with this email

            if (result.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const user =
                result[0];


            // Verify the password matches

            if (
                password !==
                user.password
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            // Login successful

            console.log(
                "Login Successful:",
                user.email
            );


            res.status(200).json({

                success: true,

                message:
                    "Login successful!",

                user: {

                    id:
                        user.id,

                    fullname:
                        user.fullname,

                    email:
                        user.email

                }

            });

        }
    );

});


// Get all orders along with their items

app.get("/orders", function (req, res) {

    const orderSql = `
        SELECT
            id,
            full_name,
            email,
            address,
            phone,
            total,
            order_date
        FROM orders
        ORDER BY id DESC
    `;


    db.query(
        orderSql,
        function (err, orders) {

            if (err) {

                console.error(
                    "Orders Error:",
                    err.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not load orders",

                    error:
                        err.message

                });

            }


            // No orders exist yet

            if (
                orders.length === 0
            ) {

                return res.status(200).json([]);

            }


            // Collect all order IDs so their items can be fetched together

            const orderIds =
                orders.map(
                    function (order) {
                        return order.id;
                    }
                );


            // Get every item that belongs to these orders

            const itemSql = `
                SELECT
                    id,
                    order_id,
                    product_id,
                    product_name,
                    price,
                    quantity
                FROM order_items
                WHERE order_id IN (?)
                ORDER BY id ASC
            `;


            db.query(
                itemSql,
                [orderIds],
                function (
                    itemErr,
                    items
                ) {

                    if (itemErr) {

                        console.error(
                            "Order Items Error:",
                            itemErr.message
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Could not load order items",

                            error:
                                itemErr.message

                        });

                    }


                    // Attach each order's matching items to it

                    const finalOrders =
                        orders.map(
                            function (order) {

                                const orderItems =
                                    items.filter(
                                        function (item) {

                                            return Number(
                                                item.order_id
                                            ) === Number(
                                                order.id
                                            );

                                        }
                                    );


                                return {

                                    id:
                                        order.id,

                                    full_name:
                                        order.full_name,

                                    email:
                                        order.email,

                                    address:
                                        order.address,

                                    phone:
                                        order.phone,

                                    total:
                                        order.total,

                                    order_date:
                                        order.order_date,

                                    items:
                                        orderItems

                                };

                            }
                        );


                    res.status(200).json(
                        finalOrders
                    );

                }
            );

        }
    );

});


// Place a new order and save its items

app.post("/orders", function (req, res) {

    const {
        fullName,
        email,
        address,
        phone,
        total,
        cart
    } = req.body;


    console.log(
        "New Order Request:"
    );

    console.log(
        req.body
    );


    // Validate that all required fields and a non-empty cart were sent

    if (
        !fullName ||
        !email ||
        !address ||
        !phone ||
        total === undefined ||
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All fields are required"

        });

    }


    // Insert the order's main details first

    const orderSql = `
        INSERT INTO orders
        (
            full_name,
            email,
            address,
            phone,
            total
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    db.query(

        orderSql,

        [
            fullName,
            email,
            address,
            phone,
            total
        ],

        function (
            err,
            result
        ) {

            if (err) {

                console.error(
                    "Order Save Error:",
                    err.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Order could not be saved",

                    error:
                        err.message

                });

            }


            // ID of the order that was just created

            const orderId =
                result.insertId;


            // Prepare each cart item for insertion into order_items

            const itemSql = `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    product_name,
                    price,
                    quantity
                )
                VALUES ?
            `;


            const items =
                cart.map(
                    function (item) {

                        return [

                            orderId,

                            item.id,

                            item.name,

                            Number(
                                item.price
                            ),

                            item.quantity
                                ? Number(
                                    item.quantity
                                )
                                : 1

                        ];

                    }
                );


            // Save all order items linked to this order

            db.query(

                itemSql,

                [items],

                function (itemErr) {

                    if (itemErr) {

                        console.error(
                            "Order Items Error:",
                            itemErr.message
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Order saved but items failed",

                            error:
                                itemErr.message

                        });

                    }


                    console.log(
                        "Order Saved Successfully:",
                        orderId
                    );


                    // Order and its items were saved successfully

                    res.status(201).json({

                        success: true,

                        message:
                            "Order saved successfully",

                        orderId:
                            orderId

                    });

                }
            );

        }
    );

});


// Start the Express server

app.listen(
    PORT,
    function () {

        console.log(
            "===================================="
        );

        console.log(
            `Server Running on http://localhost:${PORT}`
        );

        console.log(
            "===================================="
        );

    }
);
