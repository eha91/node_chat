const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Usuarios } = require('./clases/usuarios');
const usuarios = new Usuarios();

//Google Auth
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('904784206385-doq275ubs5r5safcpvsnni38vej1bhls.apps.googleusercontent.com');

//Configuracion Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '904784206385-doq275ubs5r5safcpvsnni38vej1bhls.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  return {
      nombre: payload.name,
      email: payload.email,
      img: payload.picture
  }
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}

function getFecha() {
    let date = new Date();
    let day = zero(date.getDay());
    let mes = zero(date.getMonth());
    let ano = zero(date.getFullYear());
    let hora = zero(date.getHours());
    let min = zero(date.getMinutes());

    return hora+':'+min+' '+day+'/'+mes+'/'+ano;
}

function zero(num) {
    let valor = '';
    if(num<10) valor = '0'+num;
    else valor = ''+num;

    return valor;
}


io.on('connection', function(socket){
   
   socket.on('login', (data) => {
       
        let token = data.token;
        verify(token)
        .then((user) => {
            console.log('Usuario Conectado');
            usuarios.addPerson(socket.id,user.nombre,user.img,'123456789',user.email);
            socket.emit('login-resp',{
                status: true,
                user: user,
            })
        })
        .catch(e => {
            socket.emit('login-resp',{
                status: false,
                error: e,
            })
        })
   })

   socket.on('login-app',(data) => {
       let id = '123456789';
       if(data.clave == id) {
           console.log('Empresa Conectada');
           usuarios.addEmpresa(socket.id,'Empresa 1',data.clave);
           socket.emit('login-app-resp',{
               status: true
           })
       }
       else {
           socket.emit('login-app-resp',{
               status: false
           })
       }
   })

   socket.on('begin-chat',(data) => {        
        let fecha = getFecha();
        let msj = `
        <div class="chat-message clearfix">
            <img src="http://gravatar.com/avatar/2c0ad52fc5943b78d6abe069cc08f320?s=32" alt="" width="32" height="32">
            <div class="chat-message-content clearfix">
            <span class="chat-time">${fecha}</span>
            <h5>${data.company}</h5>
            <p>Hola Buenas Tardes <strong>${data.name}</strong>. ¿ En que te podemos ayudar ?</p>
            </div>
        </div> 
        <hr>
        `;
        socket.broadcast.to(socket.id).emit('msj-resp',{
            msj
        });

        let user = usuarios.getPerson(socket.id);
        let empresa = usuarios.getEmpresa(user.clave);
        socket.broadcast.to(empresa.id).emit('new-user',user);
    })

    socket.on('all-users',(data) => {
        let users = usuarios.allPersons(data.clave);
        socket.broadcast.to(socket.id).emit('all-users-resp',{
            users
        });
    })

    socket.on('send-msj-user',(data) => {
        let fecha =getFecha();
        let user = usuarios.getPerson(socket.id);
        let empresa = usuarios.getEmpresa(user.clave);
        socket.broadcast.to(empresa.id).emit('msj-user',{
            email: user.email,
            data: {
                from:'user',
                fecha:fecha,
                text:data.msj
            }
        });
    })

    client.on('disconnect',() => {
        usuarios.deleteEmpresa(socket.id);
        usuarios.deletePerson(socket.id);

        
    })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
