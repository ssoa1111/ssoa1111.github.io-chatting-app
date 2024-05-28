const utils = {
    makeDom(type, className, text) {
        const dom = document.createElement(type)
        dom.className = className
        dom.textContent = text

        return dom
    },
    setRandomID(prefix) {
        const randomId = Math.random().toString(32).substring(2, 5)
        return `${prefix}-${randomId}`
    },
    setQueryString(obj) {
        const baseURL = window.location.href
        const urlParam = new URLSearchParams(obj)

        return `${baseURL.replace('room', 'chat')}?${urlParam}`
    },
    getQueryString(key) {
        const urlParam = new URLSearchParams(window.location.search)

        return urlParam.get(key)
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
        showClass = "show",

        roomList,
        $roomList,
        roomItem,

        actions = {};

    function init() {
        setSelector()
        setActions()
        setEvent()
    }
    function setSelector() {
        addBtn = '.btn-add-room'
        layerWrap = ".layer-wrap"
        confirmRoom = ".dialog-confirm"

        roomList = ".room-list"
        roomItem = ".room-item"

        $addBtn = document.querySelector(addBtn)
        $layerWrap = document.querySelector(layerWrap)
        $confirmRoom = document.querySelector(confirmRoom)
        $roomList = document.querySelector(roomList)
    }
    function setActions() {
        actions.enterRoom = (target) => {
            const $roomItem = target.closest(roomItem)
            if (!$roomItem) return

            window.location = utils.setQueryString($roomItem.roomInfo)
        }
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

        $roomList.addEventListener("click", (e) => actions.enterRoom(e.target))
    }
    function addRoom() {
        const container = utils.makeDom('button', 'room-item')

        container.append(SEND["makeRoomName"]?.(SEND.roomName.value))
        container.append(SEND["makeRoomDesc"]?.(SEND.roomDesc.value))
        SEND.$targetRoom?.append(container)

        container.roomInfo = {
            roomId: utils.setRandomID("room"),
            roomName: SEND.roomName.value,
            // makeUser : 
        }
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
        SEND.userMsg.value && ecoSay(socket, {
            type: "user",
            text: `${SEND.userMsg.value}`,
            roomId: utils.getQueryString("roomId")
        })
        SEND.userMsg.value = ''
    }

    return { init }
}



function ecoSay(server, data) {
    server.send(JSON.stringify({
        type: data.type,
        chat: data.text,
        roomId: data.roomId
    }))
}