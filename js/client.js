const utils = {
    makeDom(type, className, text) {
        const dom = document.createElement(type)
        dom.className = className
        dom.textContent = text

        return dom
    }
}

const SEND = {
    $targetChat: document.querySelector('.chat-contents'),
    userName: document.querySelector('#user-name'),
    userMsg: document.querySelector('#user-msg'),
    user: (txt) => utils.makeDom('div', 'chat-user', txt),
    system: (txt) => utils.makeDom('div', 'chat-system', txt),

    $targetRoom: document.querySelector('.room-list'),
    roomName: document.querySelector('#room-name'),
    roomDesc: document.querySelector('#room-desc'),
    makeRoomName: (txt) => utils.makeDom('span', 'room-name', txt),
    makeRoomDesc: (txt) => utils.makeDom('span', 'room-desc', txt),
}

const chatContents = document.querySelector('.chat-contents')
const socket = new WebSocket('ws://localhost:5501');

const chatArea = chatFnc().init()
const roomArea = roomFnc().init()

// room
function roomFnc() {
    let addBtn,
        $addBtn,
        layerWrap,
        $layerWrap,
        confirmRoom,
        $confirmRoom,
        showClass = "show";

    function init() {
        setSelector()
        setEvent()
    }
    function setSelector() {
        addBtn = '.btn-add-room'
        layerWrap = ".layer-wrap"
        confirmRoom = ".dialog-confirm"

        $addBtn = document.querySelector(addBtn)
        $layerWrap = document.querySelector(layerWrap)
        $confirmRoom = document.querySelector(confirmRoom)
    }
    function setEvent() {
        $addBtn?.addEventListener("click", () => {
            if ($layerWrap.classList.contains(showClass)) {
                $layerWrap.classList.remove(showClass)
            } else {
                $layerWrap.classList.add(showClass)
            }
        })

        $confirmRoom?.addEventListener("click", () => {
            addRoom()
            $layerWrap.classList.remove(showClass)
        })
    }
    function addRoom() {
        const container = utils.makeDom('button', 'room-item')

        container.append(SEND["makeRoomName"]?.(SEND.roomName.value))
        container.append(SEND["makeRoomDesc"]?.(SEND.roomDesc.value))
        SEND.$targetRoom?.append(container)
    }
    return { init }
}

// chatting
function chatFnc() {
    let sendBtn,
        $sendBtn;

    function init() {
        setSelector()
        setEvent()
    }
    function setSelector() {
        sendBtn = '.btn-send'
        $sendBtn = document.querySelector('.btn-send')
    }
    function setEvent() {
        socket.addEventListener("open", () => {
            socket.addEventListener("message", receiveMessage)
        })

        $sendBtn?.addEventListener('click', sendMessage)
    }

    function receiveMessage(e) {
        const data = JSON.parse(e.data)
        SEND.$targetChat?.append(SEND[data.type]?.(data.chat))
        chatContents.scrollTop = chatContents.scrollHeight;
    }

    function sendMessage(e) {
        e.preventDefault()
        SEND.userMsg.value && ecoSay(socket, "user", `${SEND.userMsg.value}`)
        SEND.userMsg.value = ''
    }

    return { init }
}



function ecoSay(server, type, text) {
    server.send(JSON.stringify({
        type: type,
        chat: text
    }))
}