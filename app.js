// import modules
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// connect database
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected!");
});
db.on("error", function(err){
  console.log("DB ERROR :", err);
});

// model setting
var postSchema = mongoose.Schema({
  title: {type:String, required:true},
  body: {type:String, required:true},
  createdAt: {type:Date, default:Date.now},
  updateAt: Date
});
var Post = mongoose.model('post', postSchema);

// view setting
app.set("view engine", 'ejs');

// set middleweares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// set routes
app.get('/posts', function(req,res){
  Post.find({}).sort('-createdAt').exec(function(err,posts){
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {data:posts});
  });
}); //index
app.get('/posts/new', function(req,res){
  res.render("posts/new");
}); // new
app.post('/posts', function(req,res){
  console.log(req.body);
  Post.create(req.body.post, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect("/posts");
  });
}); // create
app.get('/posts/:id', function(req,res){
  Post.findById(req.params.id, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/show",{data:post});
  });
}); //show
app.get('/posts/:id/edit', function(req,res){
  Post.findById(req.params.id, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/edit", {data:post});
  });
}); //edit
app.put('/posts/:id', function(req,res){
  req.body.post.updateAt=Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect("/posts/"+req.params.id);
  });
}); // update
app.delete('/posts/:id', function(req,res){
  Post.findByIdAndRemove(req.params.id, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect("/posts");
  });
}); // destroy
var dataSchema = mongoose.Schema({
  name:String,
  count:Number
});
var Data = mongoose.model('data', dataSchema);
Data.findOne({name:"myData"}, function(err,data){
  if(err) return console.log("Data ERROR:", err);
  if(!data){
    Data.create({name:"myData",count:0},function(err,data){
      if(err) return console.log("Data ERROR:", err);
      console.log("Counter initialized:", data);
    });
  }
});

app.get('/', function (req,res){
  Data.findOne({name:"myData"}, function(err,data){
    if(err) return console.log("Data ERROR:", err);
    data.count++;
    data.save(function(err){
      if(err) return console.log("Data ERROR:", err);
      res.render('my_first_ejs', data);
    });
  });
});
app.get('/reset', function(req,res){
  data.count=0;
  res.render('my_first_ejs', data);
});
app.get('/set/count', function(req,res){
  if(req.query.count) data.count=req.query.count;
  res.render('my_first_ejs',data);
});
app.get('/set/:num', function(req,res){
  data.count=req.params.num;
  res.render('my_first_ejs',data);
});
function setCount(res,num){
  console.log("setCounter");
  Data.findOne({name:"myData"}, function(err,data){
    if(err) return console.log("Data ERROR:", err);
    data.count=num;
    data.save(function(err){
      if(err) return console.log("Data ERROR:", err);
      res.render('my_first_ejs', data);
    });
  });
}
function getCounter(res){
  console.log("getCounter");
  Data.findOne({name:"myData"},function(err,data){
    if(err) return console.log("Data ERROR:", err);
    res.render('my_first_ejs',data);
  });
}
app.listen(3000, function(){
  console.log('Server On!');
});
