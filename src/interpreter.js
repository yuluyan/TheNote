const command = require('./command.js')

var debug = (arg) => {
  //console.error(arg)
}

var interpreter = (text) => {
  // Make a array by lines
  textArray = text.split('\n')

  // Remove front and end empty line
  while (textArray.length > 0) {
    if (isEmptyLine(textArray[0])) {
      textArray.splice(0, 1)
    } if (textArray.length > 0 && isEmptyLine(textArray[textArray.length - 1])) {
      textArray.splice(-1, 1)
    } else {
      break
    }
  }

  var lineCount = textArray.length
  var resultArray = []
  var tempLine
  for (var i = 0; i < lineCount; i++) {
    tempLine = textArray[i].trim()
    var commandLineNumber = i + 1
    if (isCommandStart(tempLine)) {
      // Process command line
      var commandType = tempLine.slice(1)
      var commandBlock = []
      var isReachCommandEnd = false;
      while (++i < lineCount) {
        if (!isCommandEnd(textArray[i])) {
          commandBlock.push(textArray[i])
        } else {
          isReachCommandEnd = true
          break
        }
      }
      if (!isReachCommandEnd) {
        commandBlock.push(new ErrorInfo('syntax', 'Missing closing # for #' + commandType))
      }
      resultArray.push(renderBlockCommand(commandType, commandBlock, commandLineNumber))
    } else if (isInlineCommand(tempLine)) {
      var commandType = tempLine.slice(1)
      resultArray.push(renderInlineCommand(commandType, commandLineNumber))
    } else {
      // Process normal text
      resultArray.push(renderText(tempLine, commandLineNumber))
    }
  }
  
  var result = {
    html: [],
    js: [],
    jsfile: [],
    cssfile: [],
  }
  for (var i = 0; i < resultArray.length; i++) {
    for (var entry in resultArray[i]) {
      if (resultArray[i][entry]) {
        result[entry].push(resultArray[i][entry])
      }
    }
  }
  result.html = result.html.join('\n')
  result.js = result.js.join('\n\n')

  return result
}

var isEmptyLine = (line) => {
  if (!line.replace(/\s/g, '').length) {
    return true
  } else {
    return false
  }
}

var isCommandStart = (line) => {
  return (line.charAt(0) == '#') && (line.length > 1)
}
var isCommandEnd = (line) => {
  return (line == '#')
}
var isInlineCommand = (line) => {
  return (line.charAt(0) == '!') && (line.length > 1)
}
var isEscapedText = (line) => {
  return (line.charAt(0) == '\\') && (line.length > 1)
}

// Renderers
var renderBlockCommand = (commandLine, block, commandLineNumber) => {
  var renderResult = {
    html: '',
    js: '',
    jsfile: '',
    cssfile: '',
  }

  var err = undefined
  if (block[block.length - 1] instanceof ErrorInfo) {
    err = block[block.length - 1]
    block.splice(-1, 1)
  }

  var commandArray = commandLine.split(' ')
  var commandType = commandArray[0]
  commandArray.splice(0, 1)

  const supportedBlockCommand = Object.keys(command.block)
  if (supportedBlockCommand.includes(commandType)) {
    command.block[commandType].exec(err, renderResult, block, commandArray, commandLineNumber)
  } else {
    // no such command
    command.block.default.exec(err, renderResult, block, [commandType], commandLineNumber)
  }
  return renderResult
}

var renderInlineCommand = (commandLine, commandLineNumber) => {
  var renderResult = {
    html: '',
    js: '',
    jsfile: '',
    cssfile: ''
  }
  
  var commandType, commandRest
  if (commandLine.includes(' ')) {
    commandType = commandLine.substr(0, commandLine.indexOf(' '))
    commandRest = commandLine.substr(commandLine.indexOf(' ') + 1).trim();
  } else {
    commandType = commandLine
    commandRest = ''
  }
  var commandArray = commandLine.match(/\S+/g) || []
  commandArray.splice(0, 1)

  const supportedInlineCommand = Object.keys(command.inline)
  if (supportedInlineCommand.includes(commandType)) {
    const argc = command.inline[commandType].argc
    if (argc === 'any' || argc.includes(commandArray.length)) {
      command.inline[commandType].exec(renderResult, commandArray, commandRest, commandLineNumber)
    } else {
      var err = new ErrorInfo('command', commandType + ' accepts ' + argc.join(', ') + ' argument(s).')
      renderResult.html = err.toHTML()
    }
  } else {
    // no such command
    command.inline.default.exec(renderResult, [commandType], '', commandLineNumber)
  }

  return renderResult
}

var renderText = (textLine, commandLineNumber) => {
  if (isEscapedText(textLine)) {
    textLine = textLine.slice(1)
  }
  textLine = textLine.replace(/\s/g, '&nbsp;')
  return {
    html: '<p data-linenumber=' + commandLineNumber + '>' + textLine + '</p>',
    js: ''
  }
}

function ErrorInfo (errType, errMessage) {
  this.errType = errType
  this.errMessage = errMessage
  this.toHTML = () => {
    switch (errType) {
      default:
        return "<p style='color:red;'> " + this.capitalizeWord(errType) + " Error: " + errMessage + "</p>" 
        break
    } 
  }
  this.capitalizeWord = (w) => {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
}

module.exports = interpreter