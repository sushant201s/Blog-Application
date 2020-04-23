var express = require('express');
var app = express();
const mongoose = require('mongoose');
var faker = require('faker');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

//set view engine
app.set("view engine", "ejs");

//use the public repository
app.use(express.static('public'));

//connect to DB
mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Schema = mongoose.Schema;

//structure of our blog post
var BlogPost = new Schema({
    id: String,
    title: String,
    description: String
});

const blog = mongoose.model('blog', BlogPost);


//function to generate some random blogs
function generateRandomBlog() {
    return {
        id: faker.random.uuid,
        title: faker.random.title,
        description: faker.random.description
    };
}


//route the home or blog landing page
app.get("/", function (req, res) {
    //fetch all posts from DB and display them
    blog.find({}, function (error, blogs) {
        //render the home page/blogs page
        res.render("blogs", {
            blogs: blogs
        });
    });
});

//route to show form for the create blog
app.get("/create", function (req, res) {
    //show a form here
    res.render("create");
});

//route to create the blog in DB and redirect to blog page
app.post("/create", function (req, res) {
    blog.create({
        id: req.body.name,
        title: req.body.title,
        description: req.body.description
    }, function (error, blog) {
        if (!error) {
            console.log("Post by " + blog.id + " saved to DB.");
            //redirect to blog page
            res.redirect("/");
        } else
            console.log("Failed to create post");
    });
});

//view a single blog post
app.get("/blogs/:id", function (req, res) {
    blog.find({
        id: req.params.id
    }, function (error, blogs) {
        if (!error) {
            console.log(req.params.id);
            //render the show page
            console.log(blogs);
            res.render("show", {
                blog: blogs[0]
            });
        } else {
            console.log("cannot load resource");
            res.send("failed to load resource")
        }
    });
});

//route to edit a post
app.get("/blogs/:id/edit", function (req, res) {
    //find the post from the given id
    blog.find({
        id: req.params.id
    }, function (error, blogs) {
        if (!error) {
            //render the show page
            res.render("edit", {
                blog: blogs[0]
            });
        } else {
            console.log("cannot load resource");
            res.send("failed to load resource")
        }
    });
});

//route to save edited post and redirect to that post page
app.post("/blogs/:id/edit", function (req, res) {
    blog.update({
        id: req.body.id
    }, {
        $set: {
            title: req.body.title,
            description: req.body.description
        }
    }, function (error, blog) {
        if (!error) {
            console.log("post edited");
            console.log(blog);
            //redirect to that edited post
            res.redirect("/blogs/" + req.body.id);
        } else
            console.log("failed to update post");
    });
});

//route to delete a post
app.get("/blogs/:id/delete", function (req, res) {
    blog.deleteOne({
        id: req.params.id
    }, function (error) {
        if (!error) {
            console.log("post deleted successfully");
            //redirect to landing page
            res.redirect("/");
        } else
            console.log("Failed to delete post");
    })
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});