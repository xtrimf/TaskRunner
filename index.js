var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cmd = require('node-cmd');
var auth = require ('./assets/auth.js')
var Users = require ('./assets/users.js')
var Conf = require ('./assets/conf.js')
var _ = require('lodash');

let ConnectedUsers = 0;
let users = Users.compile();

// create tasks status var
let taskStatus ={}
Object.keys(users).forEach(function(key) {
  for(var i = 0 ; i< users[key].tasks.length; ++i) {
    let task = users[key].tasks[i];
    taskStatus[task] = '';
  }
});

// start server
server.listen(3131, function () {
   app.use(bodyParser.urlencoded({ extended: true }));
   app.use(bodyParser.json());

    console.log(new Date() + ' - Server is running...waiting for connection');
});

//main page
app.get('/taskrunner', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// for authentication REST
app.post('/auth', function (req, res, next) {
  const user = req.headers.user;
  const pwd = req.headers.pwd;
  console.log(new Date() + ' - authenticating '+user);
  auth.authenticate(user,pwd).then((result)=> {
    if(result === true) {
      let perm =[users[user].tasks,[]];
      Object.keys(users[user].tasks).forEach(function(key) {
        const task = users[user].tasks[key];
        perm[1].push(taskStatus[task])
      });
      res.send(perm)
    } else {
      res.send('error')
    }
  })
});

app.get('/auth/tasks', function (req, res, next) {
  const user = req.headers.user;
  let perm =[users[user].tasks,[]];
  Object.keys(users[user].tasks).forEach(function(key) {
    const task = users[user].tasks[key];
    perm[1].push(taskStatus[task])
  });
  res.send(perm)
});

// websocker listener
io.on('connection', function (socket) {
  if(ConnectedUsers == 0) {
    console.log(new Date() + ' - Starting Task Listener');
    var interval = setInterval(getTaskStatus, 1000)

  }; // start getting Tasks' status
  console.log(new Date() + ' - Client connected. Total Connected: '+ (++ConnectedUsers));
  socket.on('disconnect', function(){
    console.log(new Date() + ' - User disconnect. Total Connected: '+ (--ConnectedUsers));
    if(ConnectedUsers == 0) {
      console.log(new Date() + ' - Stopping Task Listener');
      clearInterval(interval)
    }; // stop getting Tasks' status
  });
});

// fetch Tasks' status
function getTaskStatus(){
  Object.keys(taskStatus).forEach(function(key) {
    cmd.get(
      `schtasks /query /S ${Conf.SERVER} /U ${Conf.USER} /P ${Conf.PWD} /TN "${key}" /FO LIST`,
      function(err, data, stderr){
        if(err){console.log(err)}
      let status = data.split("\n")[5].split(":")[1].trim() || "" ;
        if(taskStatus[key] != status) {  // check if status changed
          taskStatus[key] = status
          io.emit('StatusUpdate', {task: key, status: status})
        }
      }
    );
  });
}

// TASK run REST
app.get('/task',function(req,res){
  const task = req.query.task == 'Sales'?'Sales Model' :req.query.task ;
  const user = req.query.user;
  //cmd.run('del L:\HR.ok')
  cmd.get(
      `schtasks /run /S ${Conf.SERVER} /U ${Conf.USER} /P ${Conf.PWD} /TN "${task}"`,
      function(err, data, stderr){
        if(data.substring(0, 7)=='SUCCESS') {
          console.log(new Date() + ' - '+data);
          console.log(new Date() + ' - Started '+task+' Task ('+user+')');
      }
    }
  );
  res.send('OK')
});
