/*
    服务端代码
*/

let imgUrl = [
    "http://t-1.tuzhan.com/fe3f42e9e9e6/c-1/l/2012/09/21/15/05398a68de9948619e86e4b8090b80a3.jpg",
    "http://h.hiphotos.baidu.com/zhidao/pic/item/6a63f6246b600c3350e384cc194c510fd9f9a118.jpg",
    "http://t-1.tuzhan.com/8ff93ceaa2e8/c-1/l/2012/09/21/20/a52c7f786dff44ee98501c6d18c0309b.gif",
    "http://t-1.tuzhan.com/84212bc25ccd/c-1/l/2012/09/21/19/2015f81be35d4ce99f85a1d45bf546f5.jpg",
    "http://t-1.tuzhan.com/635520f3a124/c-1/l/2012/09/21/21/304a3db9c00e450da7904d54500dbedf.jpg"
]
function randoms(imgUrl) {
    let ind = Math.floor(Math.random() * imgUrl.length)
    return imgUrl[ind]
}
const ws = require('ws'); // 引入ws模块
// 创建ws服务器，并设置端口号为9000
let wsServer = new ws.Server({
    port: 9001
})
// 监听客户端的接入
wsServer.on('connection', connection);
// 客户端接入的事件处理函数
let user = [];
function connection(socket) {
    // 监听客户端发送消息
    socket.on('message', msg => {
        let data = JSON.parse(msg)
        //判断接受消息的类型
        switch (data.type) {
            case 'login': //新用户加入
                socket.nickname = data.username //保存用户名属性

                user.push({
                    name: data.username,
                    url: randoms(imgUrl)
                })
                broadcast(
                    //发送json字符串告诉客户端有新用户加入
                    JSON.stringify({
                        username: data.username,// 用户的名字
                        time: getTime(), // 发表的时间
                        type: data.type, // 类型
                        user: user
                    })
                )
                break
            case 'msg':
                //发送json字符串告诉客户端有新用户加入
                broadcast(
                    JSON.stringify({
                        username: data.username, // 用户的名字
                        time: getTime(), // 发表的时间
                        message: data.message, //用户发表的内容
                        type: data.type, // 类型
                        user: user
                    })
                )
                break
        }
    })
    //监听错误信息
    socket.on('error', (err) => {
        console.log(err)
    })
    //监听断开连接
    socket.on('close', () => {
        user = user.filter(item => {
            return item.name !== socket.nickname
        })
        broadcast(
            JSON.stringify({
                username: socket.nickname, // 用户的名字
                time: getTime(), // 离开的时间
                type: 'leave', // 离开的类型
                user: user
            })
        )
    })
}


//给所有客户端连接发送消息
function broadcast(str) {
    //遍历所有的客户端连接
    wsServer.clients.forEach((conn) => {
        //发送消息
        conn.send(str)
    })
}


function getTime() {
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes()
    var sec = date.getSeconds()
    min = min < 10 ? "0" + min : min
    sec = sec < 10 ? "0" + sec : sec
    return hour + ":" + min + ":" + sec
}