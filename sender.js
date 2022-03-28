const { ipcRenderer } = require('electron')

// 设置鼠标移动到图片上有鼠标事件，移开无视鼠标事件
let intervalTimer = setInterval(()=>{
  if (window.app && window.lie && window.auto) {
    clearInterval(intervalTimer)
    window.app.stage.on('pointerover',()=>{
      ipcRenderer.send('set-ignore-mouse-events', false)
    })
    
    window.app.stage.on('pointerout',()=>{
      ipcRenderer.send('set-ignore-mouse-events', true, { forward: true })
    })

    ipcRenderer.on('lie',()=>{
      lie(true)
    })

    ipcRenderer.on('auto',()=>{
      auto()
    })
  }
},100)