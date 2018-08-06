var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cmd = require('node-cmd');
var auth = require ('./assets/auth.js')
var Users = require ('./assets/users.js')
var _ = require('lodash');
let ConnectedUsers = 0;
let tokenStore = {};

let tasks = {"task1":"",
            "task2": ""
          };


let users = Users.compile();

// start server
server.listen(3131, function () {
   app.use(bodyParser.urlencoded({ extended: true }));
   app.use(bodyParser.json());

    console.log('Server is running...waiting for task request');
});

//main page
app.get('/taskrunner', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// for authentication REST
app.post('/auth', function (req, res, next) {
  const user = req.headers.user;
  const pwd = req.headers.pwd;
  console.log('authenticating '+user);
  auth.authenticate(user,pwd).then((result)=> {
    console.log(result)
    if(result === true) {
      res.send(users[user].tasks)
    } else {
      res.send('error')
    }
  })
});

app.get('/auth/tasks', function (req, res, next) {
  const user = req.headers.user;
  res.send(users[user].tasks)
});

// websocker listener
io.on('connection', function (socket) {
  if(ConnectedUsers == 0) { var interval = setInterval(getTaskStatus, 1000)}; // start getting Tasks' status
  console.log(new Date() + ' - Client connected. Total Connected: '+ (++ConnectedUsers));
  socket.on('disconnect', function(){
    console.log('User disconnect. Total Connected: '+ (--ConnectedUsers));
    if(ConnectedUsers == 0) { clearInterval(interval)}; // stop getting Tasks' status
  });
});

// fetch Tasks' status
function getTaskStatus(){
  Object.keys(tasks).forEach(function(key) {
    cmd.get(
      `schtasks /query /S {Server IP Address} /U {serveruser} /P {password} /TN "${key}" /FO LIST`,
    //  console.log(task);
      function(err, data, stderr){
        if(err){console.log(err)}
        //console.log(data);
        tasks[key] = data.split("\n")[5].split(":")[1].trim()
        io.emit('StatusUpdate', {task: key, status: tasks[key]})
      }
    );
  });
}

// TASK run REST
app.get('/task',function(req,res){
  const task = req.query.task;
  const user = req.query.user;
  cmd.get(
      `schtasks /run /S {Server IP Address} /U {serveruser} /P {password} /TN "${task}"`,
      function(err, data, stderr){
        if(data.substring(0, 7)=='SUCCESS') {
          console.log(new Date() + ' - '+data);
          console.log(new Date() + ' - Started '+task+' Task ('+user+')');
      }
    }
  );
  res.send('OK')
});
