const {remote, ipcRenderer} = require('electron')
const fs = require('fs')

const config = require('./config.js')
const interpreter = require('./interpreter.js') // Note interpreter

// Close
var closeNote = (e) => {
  e.preventDefault()
  e.stopPropagation()
  var window = remote.getCurrentWindow()
  if (document.getElementById('closecross').style.display === 'block') {
    console.log(window.isFocused())
    ipcRenderer.send('hideClicked', {
      id: getWindowId(),
    })
  }
}

// Edit title
var editTitle = () => {
  var titlebox = document.getElementById('titlebox')
  var title = document.getElementById('title')
  title.style.display = 'none'
  titlebox.style.display = 'block'
  titlebox.select()
}

// Confirm title change
var confirmTitle = () => {
  var titlebox = document.getElementById('titlebox')
  if (titlebox.style.display == 'none') return 
  var title = document.getElementById('title')
  title.style.display = 'block'
  titlebox.style.display = 'none'
  var maxWidth = window.innerWidth * 0.95 - 50.0
  var charNum = 1
  for (; charNum < titlebox.value.length; charNum++) {
    var measuretitle = document.getElementById("measuretitle");
    measuretitle.innerHTML = titlebox.value.substring(0, charNum) + '...'
    var width = measuretitle.clientWidth + 1;
    if (width < maxWidth) {
      continue
    } else {
      break
    }
  }
  var displayTitle = titlebox.value.substring(0, charNum)
  if (displayTitle.length < titlebox.value.length) {
    displayTitle += '...'
  }
  title.innerHTML = displayTitle

  // notify main process
  ipcRenderer.send('title-change', {
    id: getWindowId(),
    value: titlebox.value
  })
}

// Edit content
var editContent = (lineNumber) => {
  var notecontainer = document.getElementById('notecontainer')
  var editor = document.getElementById('editor')
  var textbox = document.getElementById('textbox')
  editor.style.display = 'block'
  notecontainer.style.display = 'none'
  textbox.focus()
  var charNumberStart = (lineNumber === 1 ? 0 : (textbox.value.split('\n').slice(0, lineNumber - 1).join('\n').length + 1))
  var charNumberEnd = textbox.value.split('\n').slice(0, lineNumber).join('\n').length
  //console.log([lineNumber, charNumberStart, charNumberEnd])
  var tempSave = textbox.value.substr(charNumberStart)
  textbox.value = textbox.value.substr(0, charNumberStart)
  textbox.scrollTop = textbox.scrollHeight;
  textbox.value += tempSave
  textbox.setSelectionRange(charNumberStart, charNumberEnd)
}

// Confirm content change
var confirmContent = () => {
  var notecontainer = document.getElementById('notecontainer')
  var editor = document.getElementById('editor')
  if (editor.style.display === 'block') {
    var textbox = document.getElementById('textbox')
    editor.style.display = 'none'
  
    notecontainer.style.display = 'block'
    updateContentFromTextbox()
    window.scrollTo(0, 0)
  
    ipcRenderer.send('content-change', {
      id: getWindowId(),
      value: textbox.value
    })
  }

}

// When focus
var onfocus = () => {
  var titlebar = document.getElementById('titlebar')
  titlebar.classList.add('titlebarfocus')
  titlebar.classList.remove('titlebarblur')

  var closecross = document.getElementById('closecross')
  closecross.style.display = 'block'

  var notecontainer = document.getElementById('notecontainer')
  notecontainer.style.overflowY = 'auto'

}

// When blur
var onblur = () => {
  var titlebar = document.getElementById('titlebar')
  titlebar.classList.remove('titlebarfocus')
  titlebar.classList.add('titlebarblur')

  var closecross = document.getElementById('closecross')
  closecross.style.display = 'none'

  var notecontainer = document.getElementById('notecontainer')
  notecontainer.style.overflowY = 'hidden'

  confirmTitle()
  confirmContent()
}

// Edit JS
var removeHeadJS = () => {
  var head = document.getElementsByTagName('head')[0]
  var node = head.firstChild
  while (node) {
    if (node.tagName == 'SCRIPT') {
      var tmp = node.nextSibling
      head.removeChild(node)
      node = tmp
    } else {
      node = node.nextSibling
    }
  }
}
var appendHeadJS = (str) => {
  var head = document.getElementsByTagName('head')[0]
  var newJS = document.createElement('script')
  var inlineScript = document.createTextNode(str)
  newJS.appendChild(inlineScript)
  head.appendChild(newJS)
}
var appendHeadJSFile = (pathArray) => {
  var head = document.getElementsByTagName('head')[0]
  for (var i = 0; i < pathArray.length; i++) {
    var newJS = document.createElement('script')
    newJS.src = pathArray[i]
    head.appendChild(newJS)
  }
}

// Edit CSS
var removeHeadCSS = () => {
  var head = document.getElementsByTagName('head')[0]
  var node = head.firstChild
  while (node) {
    if (node.tagName == 'LINK') {
      var tmp = node.nextSibling
      head.removeChild(node)
      node = tmp
    } else {
      node = node.nextSibling
    }
  }
}
var appendHeadCSSFile = (pathArray) => {
  var head = document.getElementsByTagName('head')[0]
  for (var i = 0; i < pathArray.length; i++) {
    var newCSS = document.createElement('link')
    newCSS.rel = 'stylesheet'
    newCSS.href = pathArray[i]
    head.appendChild(newCSS)
  }
}

var updateContentFromTextbox = () => {
  //clear all timer
  var maxtimer = setTimeout(function(){}, 0)
  for(var i = 0; i < maxtimer; i += 1) { 
    clearTimeout(i)
  }

  var textbox = document.getElementById('textbox')
  var notecontainer = document.getElementById('notecontainer')
  var interpretedResult = interpreter(textbox.value)
  notecontainer.innerHTML = interpretedResult.html
  removeHeadJS()
  removeHeadCSS()
  appendHeadJS(interpretedResult.js)
  appendHeadJSFile(interpretedResult.jsfile)
  appendHeadCSSFile(interpretedResult.cssfile)

  // Update date entry
  var dateEntries = document.getElementsByClassName('dateentry')
  for (var i = 0; i < dateEntries.length; i++) {
    if (dateEntries[i].hasAttribute('data-datevalue')) {
      dateEntryUpdater(dateEntries[i].id)
    }
  }
}

var setWindowId = (id) => {
  var windowid = document.getElementById('windowid')
  windowid.innerHTML = id
}

var getWindowId = () => {
  return parseInt(windowid.innerHTML)
}

var loadContent = (path) => {
  //console.log(path)
  fs.readFile(path, 'utf8', (err, text) => {
    textbox.value = text
    updateContentFromTextbox()
    confirmContent()
  })
}

var loadTitle = (titleText) => {
  console.log(titleText)
  var titlebox = document.getElementById('titlebox')
  var title = document.getElementById('title')
  titlebox.value = titleText
  title.innerHTML = titleText
}

var refreshNote = () => {
  updateContentFromTextbox()
}

var openDevTool = (detached) => {
  var event = 'devtool'
  if (detached) event += '-detach'
  ipcRenderer.send(event, {
    id: getWindowId(),
  })
}

var editorCatchKey = (e) => {
  var keyCode = e.keyCode
  var textbox = document.getElementById('textbox')
  if (keyCode === 9) { // tab 
    e.preventDefault()
    var val = textbox.value,
        start = textbox.selectionStart,
        end = textbox.selectionEnd;
    var tabStr = '    '
    textbox.value = val.substring(0, start) + tabStr + val.substring(end);
    textbox.selectionStart = textbox.selectionEnd = start + tabStr.length;
    // prevent the focus lose
    return false;
  }
  if (keyCode === 27) { // esc
    e.preventDefault()
    confirmContent()
    return false;
  }
}

var bodyCatchKey = (e) => {
  var keyCode = e.keyCode
  if (keyCode === 13) { // enter
    if (document.getElementById('editor').style.display == 'none') {
      e.preventDefault()
      editContent(1)
    }
    return false;
  }
  if (keyCode === 116) { // f5
    e.preventDefault()
    refreshNote()
    return false;
  }
  if (keyCode === 122) { // f12
    e.preventDefault()
    openDevTool(true)
    return false;
  }
  if (keyCode === 123) { // f12
    e.preventDefault()
    openDevTool()
    return false;
  }
}

document.getElementsByTagName('body')[0].addEventListener('keydown', bodyCatchKey)
document.getElementById('closecross').addEventListener('click', closeNote)
//document.getElementById('closecross').addEventListener('mousedown', closeNoteBefore)
document.getElementById('textbox').addEventListener('keydown', editorCatchKey)
document.getElementById('title').addEventListener('click', confirmContent)
document.getElementById('title').addEventListener('dblclick', editTitle)
document.getElementById('notecontainer').addEventListener('click', confirmTitle)
document.getElementById('notecontainer').addEventListener('dblclick', (e) => {
  var containerRect = document.getElementById('notecontainer').getBoundingClientRect()
  var clickPageY = document.body.scrollTop + e.clientY - (document.getElementById('titlebar').getBoundingClientRect().bottom - document.getElementById('titlebar').getBoundingClientRect().top) 
  var noteItemList = document.getElementById('notecontainer').getElementsByTagName("*")
  if (noteItemList.length > 0) {
    var targetItem = noteItemList[0]
    var closestDist = Math.abs((targetItem.getBoundingClientRect().top + 3 * targetItem.getBoundingClientRect().top) / 4 - containerRect.top - clickPageY)
    for(var i = 0; i < noteItemList.length; i++) {
      if (noteItemList[i].hasAttribute && noteItemList[i].hasAttribute('data-linenumber')) {
        var noteItemRect = noteItemList[i].getBoundingClientRect()
        var offset = Math.abs((noteItemRect.top + 3 * noteItemRect.bottom) / 4 - containerRect.top - clickPageY)
        if (offset < closestDist) {
          closestDist = offset
          targetItem = noteItemList[i]
        }
        //console.log([offset, noteItemList[i].getAttribute('data-linenumber')])
      }
    }
    editContent(parseInt(targetItem.getAttribute('data-linenumber')))
  } else {
    editContent(1)
  }
})

/*
var noteItemList = document.getElementById('notecontainer').children
for(var i = 0; i < noteItemList.length; i++) {
  noteItemList[i].addEventListener('dblclick', (e) => {
    editContent(parseInt(e.target.getAttribute('data-linenumber')))
  })
}
*/


let mouseWindowPos = [];
var updateMousePos = (e) => {
  mouseWindowPos[0] = e.pageX
  mouseWindowPos[1] = e.pageY
}

let isDrag = false
let isOut = false
var moveStart = (e) => {
  isDrag = true
  updateMousePos(e)
}
var moveStop = (e) => {
  if (isDrag) isDrag = false;
}

var moveCalc = (e) => {
  e.stopPropagation();
  e.preventDefault();
  if (isDrag && !isOut) {
    var newWinPos = []
    newWinPos[0] = e.screenX - mouseWindowPos[0];
    newWinPos[1] = e.screenY - mouseWindowPos[1];
    var calc = ipcRenderer.sendSync('moving', {id: getWindowId(), pos: newWinPos})
    var size = remote.getCurrentWindow().getSize()
    try {
      remote.getCurrentWindow().setPosition(calc.pos[0], calc.pos[1]);
      remote.getCurrentWindow().setSize(size[0], size[1]);
      if (calc.attracted) {
        //updateMousePos(e)
      }
    } catch (err) {
      console.log(err);
    }
    //updateMousePos(e)
  }
}

var moveOut = (e) => {
  isOut = true
  if (isDrag) {
    var newWinPos = []
    updateMousePos(e)
    newWinPos[0] = e.screenX - mouseWindowPos[0];
    newWinPos[1] = e.screenY - mouseWindowPos[1];
    var size = remote.getCurrentWindow().getSize()
    try {
      remote.getCurrentWindow().setPosition(newWinPos[0], newWinPos[1]);
      remote.getCurrentWindow().setSize(size[0], size[1]);
    } catch (err) {
      console.log(err);
    }
    //updateMousePos(e)
  }
}

var moveIn = (e) => {
  isOut = false
  if (isDrag) {
    isDrag = false
  }
}

document.getElementById('titlebar').addEventListener('mousedown', moveStart)
document.getElementById('titlebar').addEventListener('mousemove', moveCalc)
document.getElementById('titlebar').addEventListener('mouseup', moveStop)
//document.getElementById('titlebar').addEventListener('mouseout', moveOut)
//document.getElementById('titlebar').addEventListener('mouseover', moveIn)


ipcRenderer.on('loadTitle', (e, msg) => {
  console.log('xxx')
  loadTitle(msg.title)
})
ipcRenderer.on('loadContent', (e, msg) => {
  loadContent(msg.contentFilePath)
})
ipcRenderer.on('setWindowId', (e, msg) => {
  setWindowId(msg.id)
})


// Date entry
var dateEntryUpdater = function (id) {
  var updateDate = {
    timer: null,
    update: () => {
      var entry = document.getElementById(id)
      console.log("update left")
      var isPast = entry.getAttribute("data-datevalue") < Date.now().valueOf()
      var leftSecond = Math.abs(parseInt((entry.getAttribute("data-datevalue")- Date.now()) / 1000))
      var leftCountPrimary, leftUnitPrimary
      var leftCountSecondary, leftUnitSecondary
      var hasSecondaryUnit = false
      var updateInterval
      if (leftSecond >= 86400 * 5) {
        leftCountPrimary = Math.floor(leftSecond / (60 * 60 * 24))
        leftUnitPrimary = "day"
        updateInterval = 3600000
      } else if (leftSecond >= 86400) {
        hasSecondaryUnit = true
        leftCountPrimary = Math.floor(leftSecond / (60 * 60 * 24))
        leftUnitPrimary = "day"
        leftCountSecondary = Math.floor((leftSecond - leftCountPrimary * 86400) / (60 * 60))
        leftUnitSecondary = "hour"
        updateInterval = 60000
      } else if (leftSecond >= 3600 * 12) {
        leftCountPrimary = Math.floor(leftSecond / (60 * 60))
        leftUnitPrimary = "hour"
        updateInterval = 60000
      } else if (leftSecond >= 3600) {
        hasSecondaryUnit = true
        leftCountPrimary = Math.floor(leftSecond / (60 * 60))
        leftUnitPrimary = "hour"
        leftCountSecondary = Math.floor((leftSecond - leftCountPrimary * 3600) / (60))
        leftUnitSecondary = "min"
        updateInterval = 5000
      } else if (leftSecond >= 60) {
        hasSecondaryUnit = true
        leftCountPrimary = Math.floor(leftSecond / (60))
        leftUnitPrimary = "min"
        leftCountSecondary = Math.floor((leftSecond - leftCountPrimary * 60) / (1))
        leftUnitSecondary = "sec"
        updateInterval = 200
      } else {
        // <60s
        leftCountPrimary = Math.floor(leftSecond / (1))
        leftUnitPrimary = "sec"
        updateInterval = 200
      }
      entry.firstChild.nextSibling.innerHTML = (
        (isPast ? "" : "in ") + 
        leftCountPrimary + " " + updateDate.pluralize(leftUnitPrimary, leftCountPrimary) + 
        (hasSecondaryUnit ? " " + leftCountSecondary + " " + updateDate.pluralize(leftUnitSecondary, leftCountSecondary) : "") + 
        (isPast ? " ago" : "")
      )
      updateDate.timer = setTimeout(updateDate.update, updateInterval)
    },
    pluralize: (word, count) => {
      return (count > 1 ? word + 's' : word)
    },
    init: () => { clearTimeout(updateDate.timer); updateDate.update() }
  }
  updateDate.init() 
};

var openLink = (link) => {
  ipcRenderer.send('openlink', {
    link: link,
  })
}