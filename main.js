const {app,BrowserWindow,ipcMain,Menu,Tray} = require('electron')
const path = require('path')
const electron = require('electron')
let appTray = null

function createWindow() {
  //获取工作区
  let area = electron.screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: area.width-1,
    height: area.height-1,
    resizable: false, //禁止改变大小
    alwaysOnTop: true,
    frame: false, //无边框
    transparent: true, //透明
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  mainWindow.setSkipTaskbar(true)
  mainWindow.setIgnoreMouseEvents(true)
  mainWindow.loadFile('index.html')
  return mainWindow
}

//实现单例
const gotTheLock = app.requestSingleInstanceLock()
let mainWindow = null
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    let menuChecked = false
    let template = [{
      label: '无视鼠标事件',
      type: 'checkbox',
      checked: 'true',
      click: function () {
        menuChecked = !menuChecked
        mainWindow.setIgnoreMouseEvents(!menuChecked)
      }
    }, {
      label: '休息',
      click: function () {
        // lie
        mainWindow.webContents.send('lie')
      }
    }, {
      label: '自动',
      click: function () {
        // auto
        mainWindow.webContents.send('auto')
      }
    }, {
      label: '退出',
      click: function () {
        app.quit()
      }
    }]
    //创建托盘实例
    let iconPath = path.join(__dirname, './icon.ico')
    appTray = new Tray(iconPath)
    const menu = Menu.buildFromTemplate(template)
    appTray.setToolTip('m4')
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
  })
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})