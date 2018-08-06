var ldap = require('ldapjs')
var Promise = require('bluebird');

const ldapOptions = {
    url: 'ldap://{LDAP server address}:389',
    connectedTimeoutt: 30000,
    reconnect: true
};

module.exports = {
        authenticate: function(userId, password) {
                return new Promise((resolve, reject) => {
                        const ldapClient = ldap.createClient(ldapOptions);
                        // authenticate with known user to gain acces to LDAP directory
                        ldapClient.bind('CN={admin},CN=Users,DC={company},DC={com}', '{password}', function(err, res) {
                            if (err) {
                                resolve(false)
                            }
                            var opts = {
                                filter: 'mailNickname=' + userId,
                                scope: 'sub',
                                timeLimit: 2,
                                attributes: ['dn'] //, 'sn', 'cn'] // we only dn for authentication. dn is the route to exact loation in LDAP schema
                            };

                            // search the user in LDAP
                            ldapClient.search('DC=sodaclub,DC=net', opts, function(err, res) {
                                if (err) {
                                    resolve(false)
                                } else {
                                res.on('searchEntry', function(entry) {
                                    try {
                                        // if user found, authenticate it.
                                        ldapClient.bind(entry.dn, password, function(err, res) {
                                          if(err){
                                            console.log(err);
                                            resolve(false)}
                                          else{
                                            resolve(true)
                                            console.log('User "' + userId + '" authenticated');
                                          }
                                        });
                                    }catch(e){};
                                });
                                res.on('error', function(err) {
                                  resolve(false)
                                  console.error('error: ' + err.message);
                               });
                               res.on('end', function(result) {
                                //resolve(true)
                              });
                              }
                            });

                        });
                    });
              }
          }
