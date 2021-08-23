const { ipcRenderer } = require('electron')
const arr = ["images/m4_lying.gif", "images/m4_move.gif", "images/m4_pick.gif", "images/m4_wait.gif"]
let timer = null
let timer2 = null
let timer3 = null

//  角色移动move
function move() {

    let speed = 3
    clearInterval(timer)
    // 每6秒确定一个方向移动
    timer = setInterval(() => {

        const img = document.querySelector('img')
        if (img.src.indexOf(arr[1]) === -1) img.src = arr[1]
        let angle = Math.random() * 2 * Math.PI
        let hr = Math.cos(angle)
        let vt = Math.sin(angle)

        clearInterval(timer2)
        // 随机方向移动   遇到边界返回  img: 148 218
        timer2 = setInterval(() => {
            if (img.offsetLeft < 0 || img.offsetLeft + 70 > document.body.offsetWidth ||
                img.offsetTop < 0 || img.offsetTop + 110 > document.body.offsetHeight) {
                hr = -hr
                vt = -vt
            }

            if (hr < 0) {
                img.className = 'rotateY'
            } else {
                img.className = ''
            }

            img.style.left = img.offsetLeft + hr * speed + 'px'
            img.style.top = img.offsetTop + vt * speed + 'px'
        }, 40);

    }, 10000)
}

// lie
function lie() {
    clearInterval(timer)
    clearInterval(timer2)
    const img = document.querySelector('img')
    if (img.src.indexOf(arr[0]) === -1) {
        img.src = arr[0]
    }
}

// wait
function wait() {
    clearInterval(timer)
    clearInterval(timer2)
    const img = document.querySelector('img')
    if (img.src.indexOf(arr[3]) === -1) {
        img.src = arr[3]
    }
}

// pick(drag)
(function () {

    const element = document.querySelector('img')
    let x = 0
    let y = 0
    let l = 0
    let t = 0
    let isDown = false

    element.onmousedown = function (e) {
        clearInterval(timer)
        clearInterval(timer2)
        e.preventDefault()

        x = e.clientX
        y = e.clientY
        l = element.offsetLeft
        t = element.offsetTop

        isDown = true
        element.src = arr[2]
    };

    window.onmousemove = function (e) {
        if (isDown == false) return
        let nx = e.clientX
        let ny = e.clientY
        let nl = nx - (x - l)
        let nt = ny - (y - t)
        element.style.left = nl + "px"
        element.style.top = nt + "px"
    };

    element.onmouseup = function () {
        isDown = false;
        element.src = arr[3]
        auto()
    }
})()

// 自动随机
function start() {
    let n = Math.floor(Math.random() * 3)
    switch (n) {
        case 0:
            move()
            break
        case 1:
            lie()
            break
        case 2:
            wait()
            break
    }
}


function auto(){
    start()
    timer3 = setInterval(start, 100000);
}
auto()

ipcRenderer.on('lie',()=>{
    clearInterval(timer3)
    lie()
})

ipcRenderer.on('auto',()=>{
    clearInterval(timer3)
    auto()
})