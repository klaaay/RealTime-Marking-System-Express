const path = require('path')
const express = require('express')
const pkg = require('./package')
const app = express()
const routes = require('./routes');
const server = require('http').createServer(app);
var io = require('socket.io')(server);
const MongoClient = require('mongodb').MongoClient;
var url = require('./config/data.js').mogo_url;
var PORT = require('./config/data.js').port;
var console = require('tracer').colorConsole();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

routes(app);

io.on('connection', function (socket) {
  console.log('a user connected');
  console.log(socket.id);
  socket.on('disconnect', function () {
    console.log(socket.id);
    console.log('a user disconnected');
    io.emit('judge_leave', socket.id);
  })
  socket.on('check_judge_login', function (phone_number) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      var dbo = db.db('judge');
      var where = { 'phone_number': phone_number };
      dbo.collection('judges').find(where).toArray(function (err, result) {
        if (result.length !== 0) {
          if (!result[0].state) {
            socket.emit('judge_login_sucess', result[0].phone_number);
            dbo.collection("judges").updateOne({ "state": false }, { $set: { "state": true } }, function (err, res) {
              if (err) throw err;
              console.log("update set true success");
              db.close();
            });
          } else {
            socket.emit('judge_login_fail', "该手机号已登录");
            db.close();
          }
        } else {
          socket.emit('judge_login_fail', "该手机账号不存在");
          db.close();
        }
      })
    })
  })
  socket.on('add_judge', function (Now_phone) {
    let data = {
      'id': socket.id,
      'phone': Now_phone
    }
    io.emit('add_judge', data);
  })
  socket.on('init', () => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      var dbo = db.db('judge');
      dbo.collection('groups').find({}).toArray(function (err, groups) {
        io.emit('groups_info', groups);
      })
    })
  })
  socket.on('begin', (data) => {
    io.emit('begin', data);
  })
  socket.on('fill_score', (data) => {
    io.emit('fill_score', data);
  })
  socket.on('next', () => {
    io.emit('next');
  })
  socket.on('change_judge_state', (phone) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      var dbo = db.db('judge');
      dbo.collection('judges').updateOne({ "phone_number": phone }, { $set: { "state": false } }, (err, res) => {
        if (err) throw err;
        console.log("set false success");
        db.close();
      })
    })
  })
  socket.on('groups_result', (groups_result) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      var dbo = db.db('judge');
      dbo.collection('groups_result').insertMany(groups_result, function (err, result) {
        if(err) throw err;
        console.log("insert: " + result.insertedCount + " results");
        db.close();
      })
    })
  })
})

server.listen(PORT, function () {
  console.log(`${pkg.name} listened on ${PORT}`)
})