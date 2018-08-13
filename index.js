const app = require('express')();
const bodyParser = require('body-parser')
const cors = require('cors')
//const app = express();

//Socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Google Auth
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('904784206385-doq275ubs5r5safcpvsnni38vej1bhls.apps.googleusercontent.com');

//Facebook Auth
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())
 
app.get('/', function (req, res) {
  res.send('Hello World')
})



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

    return valor;
}


io.on('connection', function(socket) {
    socket.on('begin-chat',(data) => {
        
        let fecha = getFecha()
        let resp = `
        <div class="chat-message clearfix">
            <img src="http://lorempixum.com/32/32/people" alt="" width="32" height="32">
            <div class="chat-message-content clearfix">
            <span class="chat-time">${fecha}</span>
            <h5>${data.company}</h5>
            <p>Hola Buenas Tardes ${data.name}. ¿ En que te podemos ayudar ?</p>
            </div>
        </div> 
        <hr>
        `;
        socket.emit('msj-resp',{
            resp:resp
        })
    })
});


app.post('/google',async (req,res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token).catch(e => {
        res.send({
            status: true,
            error: e,
        })
    })


    
    res.send({
        status: true,
        usuario: googleUser
    })
})


 
app.listen(3000,() => {
    console.log('Conexion Establecidad');
})