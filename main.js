const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const path = require('path')
const electron = require('electron')
const {exec} = require('child_process');
let childProcess, appTray

// 启动node服务器
childProcess = execute('node ' + path.join(__dirname, 'server.js'))

function createWindow() {
  //获取工作区
  let area = electron.screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: area.width - 1,
    height: area.height - 1,
    resizable: false, //禁止改变大小
    alwaysOnTop: true,
    frame: false, //无边框
    transparent: true, //透明
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindow.setSkipTaskbar(true)
  // mainWindow.setIgnoreMouseEvents(true, { forward: true })
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL('http://127.0.0.1:2333/index.html')
  return mainWindow
}

//实现托盘单例
const gotTheLock = app.requestSingleInstanceLock()
let mainWindow = null
if (!gotTheLock) {
  return app.quit()
}

app.on('second-instance', () => {
  // 当运行第二个实例时,将会聚焦到myWindow这个窗口
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

// 创建 myWindow, 加载应用的其余部分, etc...
app.whenReady().then(() => {
  mainWindow = createWindow()
  //托盘最小化，右键退出菜单
  let template = [{
    label: '自动',
    click: function () {
      // auto
      mainWindow.webContents.send('auto')
    }
  },
  {
    label: '休息',
    click: function () {
      // lie
      mainWindow.webContents.send('lie')
    }
  },
  {
    label: '退出',
    click: function () {
      app.quit()
    }
  }]
  //创建托盘实例
  let iconPath = path.join(__dirname, './icon.ico')
  appTray = new Tray(iconPath)
  const menu = Menu.buildFromTemplate(template)
  appTray.setToolTip('m4a1')
  appTray.setContextMenu(menu)
  // 点击托盘显示主程序
  appTray.on('click', function () {
    mainWindow.show()
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on('min', () => {
    mainWindow.minimize()
  })
  ipcMain.on('close', () => {
    app.quit()
  })

  ipcMain.on('set-ignore-mouse-events', (event, ...args) => {
    BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(...args)
  })
})

app.on('before-quit',()=>{
  // 关闭node服务器
  if(childProcess){
    execute('taskkill /f /t /im node.exe')
  }
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function execute(cmd) {
  return exec(cmd,(error, stdout, stderr)=>{
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  })
}