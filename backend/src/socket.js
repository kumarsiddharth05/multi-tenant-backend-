const socketIo = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = socketIo(httpServer, {
            cors: {
                origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
                methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join_tenant', (tenantKey) => {
                socket.join(tenantKey);
                console.log(`Socket ${socket.id} joined room ${tenantKey}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
