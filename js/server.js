const express = require('express')
const path = require('path');

const app = express()
const PORT = process.env.PORT || 5500

app.get('../chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.html'));
});

app.listen(PORT, () => {
    const ws = require('ws')

    const server = new ws.Server({ port: 5501 })

    server.on('connection', (socket) => {
        ecoSayAll(server, "system", `유저가 입장했습니다. 현재 유저 ${server.clients.size}`)

        socket.on('message', (e) => {
            if (e) {
                const data = e
                ecoSayAll(server, 'user', JSON.parse(data).chat)
            }
        })
        socket.on('close', () => {
            ecoSayAll(server, "system", `유저가 나갔습니다. 현재 유저 ${server.clients.size}`)
        })
    })
});

function ecoSayAll(server, type, text) {
    server.clients.forEach(client => {
        client.send(JSON.stringify({
            type: type,
            chat: text
        }))
    })
}

