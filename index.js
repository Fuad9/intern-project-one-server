const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xg0hf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const MongoClient = require("mongodb").MongoClient;
const port = 5000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    const expenseCollection = client.db(`${process.env.DB_NAME}`).collection("dailyExpenses");
    const categoryCollection = client.db(`${process.env.DB_NAME}`).collection("categories");

    // to add customer orders
    app.post("/addCategory", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const newImg = file.data;
        const encImg = newImg.toString("base64");

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, "base64"),
        };

        categoryCollection
            .insertOne({
                name,
                image,
            })
            .then((result) => {
                res.send(result);
                console.log(result);
            });
    });

    app.get("/", (req, res) => {
        res.send("It's working successfully");
    });

    // to add expense data of customers
    app.post("/addExpense", (req, res) => {
        const newExpense = req.body;
        expenseCollection.insertOne(newExpense).then((result) => {
            res.send(result.insertedCount > 0);
            console.log(result);
        });
    });

    // to retrieve all categories
    app.get("/showCategories", (req, res) => {
        categoryCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // to retrieve all customer expenses
    app.get("/showAllExpenses", (req, res) => {
        expenseCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
});

app.listen(process.env.PORT || port, () => console.log("listening at " + 5000));
