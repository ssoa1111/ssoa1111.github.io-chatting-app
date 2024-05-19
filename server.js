const express = require('express')
const path = require('path');

const app = express()
const PORT = process.env.PORT || 5500

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    const ws = require('ws')

    const server = new ws.Server({ port: 5501 })

    server.on('connection', (socket) => {
        server.clients.forEach(client => {
            client.send(`현재 유저 ${server.clients.size}`)
        })

        socket.on('message', () => {
            console.log('receive message')
        })

        socket.on('close', () => {
            server.clients.forEach(client => {
                client.send(`현재 유저 ${server.clients.size}`)
            })
        })
    })
});

