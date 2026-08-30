const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

const PORT = 3000;


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==================================================
// MYSQL CONNECTION
// ==================================================

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "",

    database: "codealpha_ecommerce"

});


// ==================================================
// MYSQL CONNECT
// ==================================================

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


// ==================================================
// TEST SERVER
// ==================================================

app.get("/", function (req, res) {

    res.send(
        "CodeAlpha E-Commerce Backend Running..."
    );

});


// ==================================================
// GET PRODUCTS
// ==================================================

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


// ==================================================
// REGISTER
// ==================================================

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


    // Check fields

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


    // Check existing email

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


            // Insert user

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


// ==================================================
// LOGIN
// ==================================================

app.post("/login", function (req, res) {

    const {
        email,
        password
    } = req.body;


    console.log(
        "Login Request:",
        email
    );


    // Check fields

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


            // User not found

            if (result.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const user =
                result[0];


            // Check password

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


// ==================================================
// GET ORDERS
// ==================================================

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


            // No orders

            if (
                orders.length === 0
            ) {

                return res.status(200).json([]);

            }


            // Get order IDs

            const orderIds =
                orders.map(
                    function (order) {
                        return order.id;
                    }
                );


            // Get order items

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


                    // Combine orders and items

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


// ==================================================
// PLACE ORDER
// ==================================================

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


    // Validate fields

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


    // ==================================================
    // INSERT ORDER
    // ==================================================

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


            // New order ID

            const orderId =
                result.insertId;


            // ==================================================
            // PREPARE ORDER ITEMS
            // ==================================================

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


            // ==================================================
            // INSERT ORDER ITEMS
            // ==================================================

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


                    // ==================================================
                    // SUCCESS
                    // ==================================================

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


// ==================================================
// START SERVER
// ==================================================

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