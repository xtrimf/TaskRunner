var _ = require('lodash');

module.exports  = {

  compile: function() {

            //users for authentication
            let rawUsers = [
              { user: 'user1',   tasks:[], token:'', expiration:''},
              { user: 'user2',   tasks:[], token:'', expiration:''}
            ]

            //permissions per task
            const permissions = [
              {task: 'task1',   users: ['user1']},
              {task: 'task2',   users: ['user1','user2']}
            ]

            // join permissions to Users
            Object.keys(rawUsers).forEach(function(u_key) {
              Object.keys(permissions).forEach(function(p_key) {
                const arr = permissions[p_key].users
                if(_.filter(arr, _.matches(rawUsers[u_key].user)).length > 0) {
                  rawUsers[u_key].tasks.push(permissions[p_key].task)
                }
              });
            });

            return _.keyBy(rawUsers,'user');
  }

}
