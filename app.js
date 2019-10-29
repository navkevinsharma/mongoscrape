var cheerio = require("cheerio");
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 3000;
var app = express();

app.use(bodyParser());
app.use(express.static("public"));

var $ = cheerio.load(html);

var results = [];

$("p.title").each(function(i, element) {

    var title = $(element).text();

    var link = $(element).children().eq(0).attr("href");

    if (!link.includes('')){
        link = "" + link;
    }

    results.push({
        title: title,
        link: link
    });
    console.log(results);
});

var databaseUrl = process.env.MONGODB_URI || "articles_db";
var collections = ["articles"];

var db = mongojs(databaseUrl , collections);

db.on("error", function(error) {
    console.log("Database Error:", error);
});

app.get("/articles", function(req, res) {
    db.articles.aggregate(
        [
            { $sort : { votes : -1 } }
        ], function(error, articles){

            res.json(articles);
        }
    )
});

db.articles.find({}, function(error, songs) {
    if (error) {
        console.log(error);
    }
    else { 
        res.json(articles);
    }
});

app.post("/articles", function(req, res) {
    
    db.articles.insert({votes: req.body.votes, articleName: req.body.articleName}, function(error, savedArticle) {
        if (error) {
            console.log(error);
        }else {
            res.json(savedArticle);
        }
    });
});

app.get("/articles/:articlename", function(req, res) {

    res.json({
        articlename: req.params.articlename})

        res.json(req.params)
})

app.get("/articles/:id", function(req, res) {
    db.articles.findOne({
        "_id": mongojs.ObjectId(req.params.id)
    }, function(error, oneArticle) {
        if (error) {
            res.send(error);
        }else {
            res.json(oneArticle);
        }
    });
});

app.put("/articles/:id", function(req, res) {
    db.articles.findAndModify({
        query: {
            "_id": mongojs.ObjectId(req.params.id)
        },
        update: { $set: {
            "articles": req.body.artist, "articlename": req.body.articleName }
        },
        new: true
        }, function (err, editedArticle) {
            res.json(editedArticle);
        });
    });

    app.put("/articles/votes/:id/:direction", function(req, res){

        var voteChange = 0;

        if (req.params.direction == 'up') voteChange = 1;
        else voteChange = -1;

        db.articles.findAndModify({
            query: {
                "_id": mongojs.ObjectId(req.params.id)
            },
            update: { $inc: { votes: voteChange} },
            new: true
            }, function (err, editedArticle) {
                res.json(editedArticle);
            }};
        });

        app.delete("/articles/:id", function(req, res) {
            var id = req.params.id;

            db.articles.remove({
                "_id": mongojs.ObjectID(id)
            }, function(error, removed) {
                if (error) {
                    res.send(error);
                }else {
                    res.json(id);
                }
            });
        });

        app.scrape(PORT, function() {
            console.log('', PORT, PORT);
        });

