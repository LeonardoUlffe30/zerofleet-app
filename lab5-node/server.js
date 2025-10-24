const http = require("http"); // importamos el módulo de http
const PORT = 3000;

const routes = require("./routes.js");

const server = http.createServer(routes.handleRequest);

server.listen(PORT, (error) => {
    if(error){
        console.log("Error al iniciar el servidor:", error);
    }else{
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    }
});