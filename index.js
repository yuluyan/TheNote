var dev__ = false
var debug = (arg) => {
  if (dev__) console.log(arg)
}

const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu, Tray, dialog} = electron

// Make sure only one instance
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  dialog.showMessageBox({
    type: 'error',
    title: 'Error',
    message: 'Application is already running!',
   })
})
if (isSecondInstance) app.quit()

// Require nodejs utility here
const path = require('path')
const url = require('url')
const fs = require('fs')

// Load config file
const config = require('./src/config.js')

// Initialize notes if non exist
let catalog
if (!fs.existsSync(config.path.root + config.path.category.app + config.path.file.catalog)) {
  console.log('empty')
  catalog = [{
    id: 0,
    titleText: 'TheNote Tutorial', 
    contentFile: '0.note', 
    width: 700, height: 1000, 
    posX: 0.8, posY: 0.2,
    ontop: true,
  }]
  fs.writeFileSync(config.path.root + config.path.category.app + config.path.file.catalog, JSON.stringify(catalog), 'utf8')
  var tutoralNote = fs.readFileSync(config.path.root + config.path.category.app + config.path.file.tutorial, 'utf8')
  fs.writeFileSync(config.path.root + config.path.category.app + config.path.category.notes + '0.note', tutoralNote, 'utf8')
} else {
  catalog = JSON.parse(fs.readFileSync(config.path.root + config.path.category.app + config.path.file.catalog, 'utf8'));
}

// Load catalog file
/*
var catalog = JSON.parse(fs.readFileSync('./../../saves/catalog.json', 'utf8'))
var indexPath = path.dirname(app.getPath('exe'))
var testpath = (path) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      dialog.showMessageBox({
        type: 'warning',
        title: 'warning!',
        message: path,
       })
    } else {
      dialog.showMessageBox({
        type: 'info',
        title: 'info!',
        message: path + data,
       })
    }
  })
}
//testpath('./resources/saves/catalog.json')
//testpath('./saves/catalog.json')
//testpath('./../saves/catalog.json')
//testpath('./../../saves/catalog.json')
//testpath('./../../../saves/catalog.json')
*/



var magnetic = require('./src/magnetic.js')

let tray = null
let wins = []

let lastPosArrayArray = []

var loadNote = (noteConfig) => {
  var mainScreen = electron.screen.getPrimaryDisplay().size
  var win = new BrowserWindow({
    width: dev__ ? 1000 : noteConfig.width,
    height: dev__ ? 500 : noteConfig.height, 
    x: parseInt(noteConfig.posX * mainScreen.width),
    y: parseInt(noteConfig.posY * mainScreen.height),
    certer: false,
    show: false,
    frame: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: noteConfig.ontop,
    minWidth: 300, minHeight: 150,
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/template.html'),
    protocol: 'file:',
    slashes: true
  }))

  //win.webContents.send('loadTitle', { title: parseTitle(noteConfig.titleText) })
  //win.webContents.send('loadContent', { contentFilePath: config.path.category.app + config.path.category.notes + noteConfig.contentFile })
  //win.webContents.send('setWindowId', { id: noteConfig.id })
  
  win.webContents.executeJavaScript('loadTitle("' + parseTitle(noteConfig.titleText) + '")')
  //win.webContents.executeJavaScript('loadTitle("aaa\"")')
  win.webContents.executeJavaScript('loadContent("' + config.path.category.app + config.path.category.notes + noteConfig.contentFile + '")')
  win.webContents.executeJavaScript('setWindowId("' + noteConfig.id + '")')

  wins[noteConfig.id] = win
  lastPosArrayArray[noteConfig.id] = [win.getPosition()]

  win.once('ready-to-show', () => {
    win.show()
    if (dev__) {
      win.webContents.openDevTools()
    }
  })

  win.on('resize', () => { 
    if (!dev__) {
      win.webContents.executeJavaScript('confirmTitle()')
      modifyCatalogEntryById(noteConfig.id, 'width', win.getSize()[0])
      modifyCatalogEntryById(noteConfig.id, 'height', win.getSize()[1])
    } 
  })
  win.on('move', (moveEvent) => { 
    if (!dev__) {
      var mainScreen = electron.screen.getPrimaryDisplay().size
      modifyCatalogEntryById(noteConfig.id, 'posX', win.getPosition()[0]/mainScreen.width)
      modifyCatalogEntryById(noteConfig.id, 'posY', win.getPosition()[1]/mainScreen.height)
    }
  })
  win.on('focus', () => { win.webContents.executeJavaScript('onfocus()') })
  win.on('blur', () => { win.webContents.executeJavaScript('onblur()') })
  win.on('minimize', () => { 
    updateTray(wins)
  })
  win.on('close', (e) => { 
    e.preventDefault()
    hideNote(noteConfig.id)
    var isAllHidden = true
    for (var i = 0; i < catalog.length; i++) {
      if (wins[catalog[i].id] && wins[catalog[i].id].isVisible()) {
        isAllHidden = false
        break
      }
    } 
    if (isAllHidden) app.exit()
  })
}

app.on('ready', () => {
  for (var i = 0; i < catalog.length; i++)
    loadNote(catalog[i])

  initializeTray(wins)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (wins === null) {
    for (var i = 0; i < catalog.length; i++) 
      loadNote(catalog[i])
  }
})

var focusNote = (id) => {
  if (wins[id].isVisible()) 
    wins[id].focus()
  else 
    wins[id].show() 
}

var showNote = (id) => {
  if (wins[id]) {
    if (wins[id].isVisible()) {
      if (wins[id].isMinimized()) {
        wins[id].restore()
      } else {
        wins[id].focus()
      }
    } else {
      wins[id].showInactive()
    }
    updateTray(wins)
  }
}
var showAllNotes = () => {
  for (var i = 0; i < catalog.length; i++)
    showNote(catalog[i].id)
}

var hideNote = (id) => {
  if (wins[id] && wins[id].isVisible()) {
    wins[id].hide()
    updateTray(wins)
  }
}
var hideAllNotes = () => {
  for (var i = 0; i < wins.length; i++)
    hideNote(i)
}

var toggleNoteDisplay = (id) => {
  if (wins[id]) {
    if (wins[id].isVisible()) {
      if (wins[id].isMinimized()) {
        wins[id].restore()
      } else {
        hideNote(id)
      }
    } else {
      wins[id].showInactive()
    }
    updateTray(wins)
  }
}

var createNewNote = () => {
  var newId = 0
  for (var i = 0; i < catalog.length; i++) {
    if (catalog[i].id > newId) newId = catalog[i].id
  }
  newId += 1

  var mainScreen = electron.screen.getPrimaryDisplay().size
  var newConfig = {
    id: newId,
    titleText: 'New Note', 
    contentFile: newId + '.note', 
    width: 300, height: 300, 
    posX: 0.8, posY: 0.2,
    ontop: false,
  }
  fs.writeFileSync(config.path.root + config.path.category.app + config.path.category.notes + newId + '.note', '', 'utf8')
  catalog.push(newConfig)
  saveCatalog(catalog)
  loadNote(newConfig)
  updateTray(wins)
}

var deleteNote = (id) => {
  focusNote(id)
  dialog.showMessageBox({
    type: 'warning',
    title: 'Warning!',
    message: 'Once deleted, the contents of the note will be discarded forever.\nAre you sure to delete note：' + getCatalogEntryById(id).titleText + ' ?',
    buttons: ['I want to delete it.', 'Never mind.'],
  }, (res) => { 
    if (res === 0) {
      deleteCatalogById(id)
      hideNote(id)
    }
   })
}

var toggleOnTop = (id) => {
  if (wins[id]) {
    var ontopFlag = wins[id].isAlwaysOnTop() ? false : true
    wins[id].setAlwaysOnTop(ontopFlag)
    if (ontopFlag) focusNote(id)
    modifyCatalogEntryById(id, 'ontop', ontopFlag)
    saveCatalog(catalog)
    updateTray(wins)
  }
}

var showAboutMessage = () => {
  hideAllNotes()
  dialog.showMessageBox({
    type: 'info',
    title: 'About Smart Note',
    message: 'Created by Luyan Yu with Electron. Copyright reserved @ 2018.',
  }, () => { showAllNotes() })
}

var saveCatalog = (catalog) => {
  var json = JSON.stringify(catalog)
  fs.writeFile(config.path.root + config.path.category.app + config.path.file.catalog, json, 'utf8', (err) => {
    debug(err)
  })
}

var modifyCatalogEntryById = (id, keyword, value) => {
  var targetId = getCatalogIndexById(id)
  if (targetId >= 0) {
    if (keyword in catalog[targetId]) {
      if (!(catalog[targetId][keyword] == value)) {
        catalog[targetId][keyword] = value
        saveCatalog(catalog)
      }
    } else {
      debug('Key: ' + keyword + ' not exist')
    }
  } else {
    debug('Id: ' + id + ' not exist')
  }
}

var getCatalogEntryById = (id) => {
  var targetId = getCatalogIndexById(id)
  if (targetId >= 0) {
    return catalog[targetId]
  } else {
    debug('Id: ' + id + ' not exist')
    return undefined
  }
}

var deleteCatalogById = (id) => {
  var targetId = getCatalogIndexById(id)
  if (targetId >= 0) {
    fs.unlink(config.path.root + config.path.category.app + config.path.category.notes + catalog[targetId].contentFile, (err) => {
      debug('file not exist')
    })
    catalog.splice(targetId, 1)
    saveCatalog(catalog)
  } else {
    debug('Id: ' + id + ' not exist')
  }
}

var getCatalogIndexById = (id) => {
  var targetId = -1
  for (var i = 0; i < catalog.length; i++) {
    if (catalog[i].id == id) {
      targetId = i
      break
    }
  }
  return targetId
}

var generateTrayTemplate = (wins) => {
  var templateTrayMenu = [
    {label: 'Notes', submenu: [] },
    {label: 'New', click () { createNewNote() }},
    {label: 'Destroy', submenu: [] },
    {type: 'separator'},
    {label: 'On top', submenu: [] },
    {label: 'Show all', click () { showAllNotes() }},
    {label: 'Hide all', click () { hideAllNotes() } },
    {type: 'separator'},
    {label: 'About', click () { showAboutMessage() } },
    {role: 'quit'},
  ]
  
  // Notes submenu
  for (var i = 0; i < catalog.length; i++) {
    templateTrayMenu[0].submenu.push({
      label: catalog[i].titleText,
      type: 'checkbox',
      checked: wins[catalog[i].id] && (wins[catalog[i].id].isVisible() && !wins[catalog[i].id].isMinimized()),
      id: catalog[i].id,
      click (item, win, e) { toggleNoteDisplay(item.id) }
    })
  }
  // Destroy submenu
  for (var i = 0; i < catalog.length; i++) {
    templateTrayMenu[2].submenu.push({
      label: catalog[i].titleText,
      id: catalog[i].id,
      click (item, win, e) { deleteNote(item.id) }
    })
  }
  // On top submenu
  for (var i = 0; i < catalog.length; i++) {
    templateTrayMenu[4].submenu.push({
      label: catalog[i].titleText,
      type: 'checkbox',
      checked: catalog[i].ontop,
      id: catalog[i].id,
      click (item, win, e) { toggleOnTop(item.id) }
    })
  }
  return templateTrayMenu
}

var initializeTray = (wins) => {
  var templateTrayMenu = generateTrayTemplate(wins)
  if (tray) tray.destroy()
  tray = new Tray(config.path.root + config.path.file.icon)
  tray.setToolTip('You have ' + catalog.length + ' note' + (catalog.length > 1 ? 's' : '') + '.')
  tray.setContextMenu(Menu.buildFromTemplate(templateTrayMenu))
  tray.on('double-click', showAllNotes)
}

var updateTray = (wins) => {
  var templateTrayMenu = generateTrayTemplate(wins)
  tray.setToolTip('You have ' + catalog.length + ' note' + (catalog.length > 1 ? 's' : '') + '.')
  tray.setContextMenu(Menu.buildFromTemplate(templateTrayMenu))
}



var parseTitle = (title) => {
  console.log(title)
  return title
}

var moveMagnetic = (id, newPos) => {
  if (wins[id] && wins[id].isVisible()) {
    var movedWin = wins[id]
    if (lastPosArrayArray[id].length < magnetic.trajectoryLength) {
      // keep moving
      lastPosArrayArray[id].push(newPos)
      return {pos: newPos, attracted: false}
    } else {
      lastPosArrayArray[id].push(newPos)
      var psArray = []
      for (var i = 0; i < catalog.length; i++) {
        if (catalog[i].id != id) {
          if (wins[catalog[i].id] && wins[catalog[i].id].isVisible()) {
            psArray.push({
              pos: wins[catalog[i].id].getPosition(),
              size: wins[catalog[i].id].getSize(),
            })
          }
        }
      }
      var traj
      if (lastPosArrayArray[id].length > magnetic.trajectoryLength) {
        traj = lastPosArrayArray[id].slice(Math.max(lastPosArrayArray[id].length - magnetic.trajectoryLength, 0))
      } else {
        traj = lastPosArrayArray[id]
      }
      var calcPos = magnetic.calc(psArray, traj, movedWin.getSize())
      return {pos: calcPos, attracted: true}
    }
  } else {
    console.log('move win error')
      return {pos: [0, 0], attracted: false}
  }
}

ipcMain.on('title-change', (e, msg) => {
  debug(msg)
  modifyCatalogEntryById(msg.id, 'titleText', msg.value)
  console.log(msg.value)
  updateTray(wins)
})

ipcMain.on('content-change', (e, msg) => {
  debug(msg)
  const entry = getCatalogEntryById(msg.id)
  if (entry) {
    var contentPath = config.path.root + config.path.category.app + config.path.category.notes + entry.contentFile
    fs.readFile(contentPath, (err, data) => {
      if (!(data == msg.value)) {
        console.log(contentPath)
        fs.writeFile(contentPath, msg.value, 'utf8', (err) => {
          if (err) debug('file write error')
        })
      } else {
        debug('note not modified')
      }
    })
  }
})

ipcMain.on('devtool-detach', (e, msg) => {
  wins[msg.id].openDevTools({detach: true})
})
ipcMain.on('devtool', (e, msg) => {
  wins[msg.id].setSize(wins[msg.id].getSize()[0] + 550, wins[msg.id].getSize()[1])
  wins[msg.id].openDevTools()
})

ipcMain.on('moving', (e, msg) => {
  var movedWinId = msg.id
  var movedPos = msg.pos
  var calcPos
  //if (Number.isInteger(electron.screen.getPrimaryDisplay().scaleFactor)) {
  if (true) {
    calcPos = moveMagnetic(movedWinId, movedPos)
  } else {
    calcPos = {pos: movedPos, attracted: false}
  }
  e.returnValue = calcPos
})

ipcMain.on('hideClicked', (e, msg) => {
  hideNote(msg.id)
})
