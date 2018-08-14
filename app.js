const path = require('path')
const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
// const routes = require('./routes')
const pkg = require('./package')
const app = express()

const server = require('http').createServer(app);
var io = require('socket.io')(server);

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var console = require('tracer').colorConsole();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  name: 'judge_master', // 设置 cookie 中保存 session id 的字段名称
  secret: 'judge_master', // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: 2592000000// 过期时间，过期后 cookie 中的 session id 自动删除
  }
}))

app.use(flash())

app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),
  keepExtensions: true
}))

app.use(function (req, res, next) {
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// routes(app)
app.get('/', function (req, res, next) {
  res.render('index')
})

app.get('/judge', function (req, res, next) {
  res.render('judge');
})

app.get('/show', function (req, res, next) {
  res.render('show');
})

app.use(function (err, req, res, next) {
  req.flash('error', err.message)
  res.redirect('/login')
})


io.on('connection', function (socket) {
  console.log('a user connected');
  console.log(socket.id);
  socket.on('disconnect', function () {
    console.log('a user disconnected');
  })
  socket.on('check_judge_login', function (phone_number) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      var dbo = db.db('judge');
      var where = { 'phone_number': phone_number };
      dbo.collection('judges').find(where).toArray(function (err, result) {
        if (result.length !== 0) {
          socket.emit('judge_login_sucess',socket.id);
        } else {
          socket.emit('judge_login_fail');
        }
      })
    })
  })
  socket.on('add_judge', function () {
    io.emit('add_judge', socket.id);
  })
  socket.on('init',()=>{
    MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
      var dbo = db.db('judge');
      dbo.collection('groups').find({}).toArray(function(err,groups){
        io.emit('groups_info',groups);
      })
    })
  })
  socket.on('begin',()=>{
    io.emit('begin');
  })
  socket.on('fill_score',(data)=>{
    console.log(data);
    io.emit('fill_score',data);
  })
  socket.on('next',()=>{
    io.emit('next');
  })
})

server.listen(3000, function () {
  console.log(`${pkg.name} listened on 3000`)
})