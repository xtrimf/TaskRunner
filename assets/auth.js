var ldap = require('ldapjs')
var Promise = require('bluebird');
var Conf = require ('./conf.js')

const ldapOptions = {
    url: Conf.LDAP_SERVER,
    connectedTimeoutt: 30000,
    reconnect: true
};

module.exports = {
        authenticate: function(userId, password) {
                return new Promise((resolve, reject) => {
                        const ldapClient = ldap.createClient(ldapOptions);
                        // authenticate with know user to gain acces to LDAP directory
                        ldapClient.bind(`${Conf.LDAP_USER_PATH}`, `${Conf.PWD}`, function(err, res) {
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
                            ldapClient.search(`${Conf.LDAP_SEARCH_PATH}`, opts, function(err, res) {
                                if (err) {
                                    resolve(false)
                                } else {
                                res.on('searchEntry', function(entry) {
                                    //console.log('entry: ' + JSON.stringify(entry.dn));
                                    try {
                                        // if user found, authenticate it.
                                        ldapClient.bind(entry.dn, password, function(err, res) {
                                          if(err){
                                            console.log(err);
                                            resolve(false)}
                                          else{
                                            resolve(true)
                                            console.log(new Date() + ' - User "' + userId + '" authenticated');
                                          }
                                        });
                                    }catch(e){};
                                });
                                res.on('error', function(err) {
                                  resolve(false)
                                  console.error(new Date() + ' - error: ' + err.message);
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
