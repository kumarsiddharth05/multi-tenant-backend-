require('dotenv').config();

const http = require('http');
const app = require('./app');
const socket = require('./socket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
socket.init(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
