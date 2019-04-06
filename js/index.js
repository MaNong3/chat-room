//获取button对象
let addBtn = document.getElementById("addBtn")  // 加入按钮
let sendBtn = document.getElementById("sendBtn") // 发送按钮
let username = document.getElementById("username") // 用户名
var message = document.getElementById("message") // 发送的内容
let userNumber = document.getElementById("userNumber") // 用户数量

//定义全局
let ws = null;

// 点击添加新用户
addBtn.onclick = function () {
    //调用join函数 创建跟后台的链接
    join()
}

//给用户名文本框添加键盘点击事件
username.onkeyup = function (e) {
    //如果输入的是回车，进聊天室
    if (e.keyCode === 13) {
        //调用join函数 创建跟后台的链接
        join()
        //禁止如数文本内容
        username.disabled = true
    }
}
// 点击发送内容按钮
sendBtn.onclick = function () {
    sendMessage()
}
//给发送内容文本框 添加键盘事件
message.onkeyup = function (e) {
    // keyCode 13 就是回车键
    if (e.keyCode === 13 && !sendBtn.disabled) {
        sendMessage()
    }
}

function join() {
    addBtn.disabled = true  //禁止添加新用户按钮
    username.disabled = true //禁止如数文本内容
    sendBtn.disabled = false //给改变发送内容文本框可以编辑

    // 创建WebSocket对象，WebSocket使用的是ws协议
    ws = new WebSocket('ws://localhost:9001')
    ws.onopen = function () {
        //获取用户名
        let username = document.getElementById("username").value
        // 向服务器端发送消息
        ws.send(
            // 往后台发送json字符串
            JSON.stringify({
                username: username,
                type: 'login' //添加的对象 
            })
        )
    }
    // onmessage与ws已经绑定，接受消息回来的时候还是会回到这里来
    // 服务器发送消息后会触发
    ws.onmessage = function (e) {
        console.log(e.data)
        //字符串对象转json对象
        let data = JSON.parse(e.data)
        let show
        switch (data.type) {
            case 'login': //新用户
                show = `<div class="title"><span class="enter">${data.username} </span> 加入了房间</div>`
                onlineUsers(data.user)
                break;
            case 'msg': // 有新的聊天信息
                img = data.user.filter(item => {
                    return item.name === data.username
                })
                show = `<span class="uersImg" ><img src="${img[0].url}" /><span class="talk">${data.username} </span> ${data.time}<div class="message_box">${data.message}</div></span>`
                break
            case 'leave': //有人离开聊天室
                show = `<div class="title"><span class="leave">${data.username} </span> 离开了房间 ${data.time}</div>`
                onlineUsers(data.user)
                break;
        }
        //创建 里元素节点
        let li = document.createElement("li")
        li.innerHTML = show
        document.getElementById("msg").append(li)
        toButtom()
    }
}

// 在线用户
function onlineUsers(data = []) {
    userNumber.innerHTML = data.length;
    document.getElementById("contact").innerHTML = "";
    data.forEach(item => {
        let li = document.createElement("li")
        li.innerHTML = `<span class="uersImg" ><img src="${item.url}">${item.name}</span>`
        document.getElementById("contact").append(li)
    });
}
//保持滚动条在最底部
function toButtom() {
    let contact_list = document.getElementById("msg");
    let el_height = contact_list.scrollHeight // 获得滚动条的高度
    let box_height = contact_list.clientHeight; //获取可视窗口的高度
    if (el_height > box_height) {
        contact_list.scrollTop = contact_list.scrollHeight // 设置滚动条的位置，滚动到底部
    }
}

function sendMessage() {
    // 用户名
    let username = document.getElementById("username").value
    // 发送内容
    let msg = document.getElementById("message").value
    //发送聊天消息给服务器
    ws.send(JSON.stringify({
        username: username,
        message: msg,
        type: 'msg'
    }))
    // 发送内容置空
    document.getElementById("message").value = ''
}


