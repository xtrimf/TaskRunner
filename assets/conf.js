/*
Configuration file
*/

const LDAP_SERVER = 'ldap://sodaclub.net:389'                     // the ldap server name/address
const SERVER = '192.118.20.91'                                    // the ip address of the server where the tasks are configured.
const USER = 'qvadmin'                                            // the username WITHOUT domain
const LDAP_USER_PATH = 'CN=qvadmin,CN=Users,DC=sodaclub,DC=net'   // the path to the user in the AD. example: 'CN=user1,CN=Users,DC=company,DC=com'
const PWD = 'Qv123-'                                              // the password of the user. make sure it is corret or the AD will lock this account!
const LDAP_SEARCH_PATH = 'DC=sodaclub,DC=net'                     // example: 'DC=company,DC=com'

module.exports = {LDAP_SERVER,SERVER,USER,PWD,LDAP_USER_PATH,LDAP_SEARCH_PATH};
