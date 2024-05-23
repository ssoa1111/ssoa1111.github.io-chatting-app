const utils = {
    makeDom(type, className, text) {
        const dom = document.createElement(type)
        dom.className = className
        dom.textContent = text

        return dom
    }
}

const SEND = {
    $target: document.querySelector('.chat-contents'),
    userName: document.querySelector('#user-name'),
    userMsg: document.querySelector('#user-msg'),
    user: (txt) => utils.makeDom('div', 'chat-user', txt),
    system: (txt) => utils.makeDom('div', 'chat-system', txt),
}

const chatContents = document.querySelector('.chat-contents')
const socket = new WebSocket('ws://localhost:5501');

socket.addEventListener("open", () => {
    socket.addEventListener("message", (e) => {
        const data = JSON.parse(e.data)
        SEND.$target.append(SEND[data.type]?.(data.chat))
        chatContents.scrollTop = chatContents.scrollHeight;
    })
})

const sendBtn = document.querySelector('.btn-send')
sendBtn.addEventListener('click', (e) => {
    e.preventDefault()
    SEND.userMsg.value && ecoSay(socket, "user", `${SEND.userMsg.value}`)
    SEND.userMsg.value = ''
})

function ecoSay(server, type, text) {
    server.send(JSON.stringify({
        type: type,
        chat: text
    }))
}