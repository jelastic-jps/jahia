### Super User 
- Login: root
- Password: ${globals.su_pass}
- [${env.protocol}://${env.domain}/](${env.protocol}://${env.domain}/) 

### Manager User 
- Login: ${globals.mngr_user}
- Password: ${globals.mngr_pass}
- [${env.protocol}://${env.domain}/tools/](${env.protocol}://${env.domain}/tools/) 

### DB User 
- Login: ${globals.db_user}
- Password ${globals.db_pass}
- [https://${nodes.sqldb.first.id}-${env.domain}/](https://node${nodes.sqldb.first.id}-${env.domain}/)

### Redis User 
- Login: admin
- Password ${globals.redis_pass}
- [https://${nodes.nosqldb.first.id}-${env.domain}/](https://node${nodes.nosqldb.first.id}-${env.domain}/) 
