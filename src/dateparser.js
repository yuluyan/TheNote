const weekNameArray = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const monthNameArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const beginEndSpliter = ['--', '-', '~']
const dateSpliter = ['.', '/', '\\']
const timeSpliter = [':']
const apmFlag = ['a.m.', 'a.m', 'a.', 'am', 'p.m.', 'p.m', 'p.', 'pm']

var dateParser = (function() {
  var parser = {
    now: new Date(Date.now()),
    exec: function (string) {
      var retDate = {
        err: {
          code: 0,
          msg: '',
        },
        start: {
          isSet: true,
          value: null, remainValue: null,
          week: null, weekName: null,
          isDatePartSet: null,
          year: null, isYearSet: null,
          month: null, isMonthSet: null, monthName: null,
          date: null, isDateSet: null,
          isTimePartSet: null,
          hour: null, isHourSet: null,
          minute: null, isMinuteSet: null,
          second: null, isSecondSet: null,
        },
        end: {
          isSet: false,
          value: null, remainValue: null,
          week: null, weekName: null,
          isDatePartSet: null,
          year: null, isYearSet: null,
          month: null, isMonthSet: null, monthName: null,
          date: null, isDateSet: null,
          isTimePartSet: null,
          hour: null, isHourSet: null,
          minute: null, isMinuteSet: null,
          second: null, isSecondSet: null,
        }
      }

      var dateArray = [string]
      for (var i = 0; i < beginEndSpliter.length; i++) {
        if (string.includes(beginEndSpliter[i])) {
          dateArray = string.split(beginEndSpliter[i]).filter((e) => {return e !== ''})
          if (dateArray.length > 2) {
            retDate.err.code = 1
            retDate.err.msg = 'At most two dates: begin and end.'
            console.error(retDate.err.msg)
            return retDate
          }
          break
        }
      }
      
      switch (dateArray.length) {
        case 1:
          var dateString = dateArray[0].toLowerCase()
          var stringArray = dateString.split(' ').filter((e) => {return e !== ''})
          var datePartArray = [], timePartArray = [], apmType = null
          var dateAmendmentType = 0
          
          var apmTypeIndex = this.typeIndexOfAPM(dateString)
          if (apmTypeIndex >= 0) {
            // has am/pm
            apmType = (apmTypeIndex > 4) ? 'p' : 'a'
            var apmPos = 0
            for (; apmPos < stringArray.length; apmPos++) {
              if (stringArray[apmPos].includes(apmFlag[apmTypeIndex])) break
            }
            
            if (stringArray[apmPos] === apmFlag[apmTypeIndex]) {
              // stand alone am/pm
              if (apmPos === stringArray.length - 1) {
                // date before time
                datePartArray = stringArray.slice(0, -2)
                timePartArray = stringArray.slice(-2, -1)
              } else {
                // time before date
                datePartArray = stringArray.slice(apmPos + 1)
                timePartArray = stringArray.slice(0, apmPos)
              }
            } else {
              // followed am/pm
              if (apmPos === stringArray.length - 1) {
                // date before time
                datePartArray = stringArray.slice(0, -1)
                timePartArray = stringArray.slice(-1)
              } else {
                // time before date
                datePartArray = stringArray.slice(apmPos + 1)
                timePartArray = stringArray.slice(0, apmPos + 1)
              }
              timePartArray[0] = timePartArray[0].slice(0, - apmFlag[apmTypeIndex].length)
            }
            
            dateAmendmentType = 1

            if (timePartArray.length > 1) {
              retDate.err.code = 3
              retDate.err.msg = 'Too much arguments for time.'
              console.error(retDate.err.msg)
              return retDate
            }
            timePartArray.push(apmType)
          } else {
            // no am/pm
            var timeSpliterTypeIndex = this.typeIndexOfTimeSpliter(dateString)
            if (timeSpliterTypeIndex >= 0) {
              // time includes ':'
              var timeSpliterPos = 0
              for (; timeSpliterPos < stringArray.length; timeSpliterPos++) {
                if (stringArray[timeSpliterPos].includes(timeSpliter[timeSpliterTypeIndex])) break
              }
              if (timeSpliterPos === 0) {
                // time before date
                datePartArray = stringArray.slice(1)
              } else if (timeSpliterPos === stringArray.length - 1) {
                // date before time
                datePartArray = stringArray.slice(0, -1)
              } else {
                retDate.err.code = 4
                retDate.err.msg = 'Wrong time position.'
                console.error(retDate.err.msg)
                return retDate
              }

              dateAmendmentType = 1

              timePartArray = [stringArray[timeSpliterPos]]
            } else {
              // time not includes ':'
              var dateSpliterTypeIndex = this.typeIndexOfDateSpliter(dateString)
              if (dateSpliterTypeIndex >= 0) {
                // date not splited by space
                var dateSpliterPos = 0
                for (; dateSpliterPos < stringArray.length; dateSpliterPos++) {
                  if (stringArray[dateSpliterPos].includes(dateSpliter[dateSpliterTypeIndex])) break
                }
                if (dateSpliterPos === 0) {
                  // date before time
                  datePartArray = [stringArray[0]]
                  if (stringArray.length > 1) {
                    if (this.isYear(stringArray[1])) {
                      datePartArray.unshift(stringArray[1])
                      timePartArray = stringArray.slice(2)
                    } else {
                      timePartArray = stringArray.slice(1)
                    }
                  } else {
                    timePartArray = []
                  }
                } else if (dateSpliterPos === 1) {
                  // date at second position
                  datePartArray = [stringArray[1]]
                  if (this.isYear(stringArray[0])) {
                    // year at first pos
                    datePartArray.unshift(stringArray[0])
                    timePartArray = stringArray.slice(2)
                  } else {
                    // time at first pos
                    timePartArray = [stringArray[0]]
                    if (stringArray.length > 2) {
                      if (this.isYear(stringArray[2])) {
                        datePartArray.unshift(stringArray[2])
                      } else {
                        retDate.err.code = 5
                        retDate.err.msg = 'Too much arguments.'
                        console.error(retDate.err.msg)
                        return retDate
                      }
                    }
                  }
                } else if (dateSpliterPos === 2) {
                  datePartArray = [stringArray[2]]
                  if (this.isYear(stringArray[1])) {
                    datePartArray.unshift(stringArray[1])
                    timePartArray = stringArray[0]
                  } else {
                    retDate.err.code = 6
                    retDate.err.msg = 'Wrong argument order.'
                    console.error(retDate.err.msg)
                    return retDate
                  }
                } else {
                  retDate.err.code = 7
                  retDate.err.msg = 'Too much arguments.'
                  console.error(retDate.err.msg)
                  return retDate
                }

                dateAmendmentType = 1

              } else {
                // date splited by space, no ':', no am/pm 

                var yearIndex = this.indexOfYear(stringArray)
                var monthIndex = this.indexOfMonth(stringArray)
                if (yearIndex >= 0) {
                  // has year
                  switch (stringArray.length) {
                    case 1:
                      // only year
                      datePartArray = [stringArray[0], undefined, undefined]
                      timePartArray = []
                      break
                    case 2:
                      // year and month
                      datePartArray = [stringArray[yearIndex],stringArray[1 - yearIndex], undefined]
                      timePartArray = []
                      break
                    case 3:
                      // year and month and date
                      if (monthIndex >= 0) {
                        datePartArray = [stringArray[yearIndex], stringArray[monthIndex], stringArray[3 - monthIndex - yearIndex]]
                      } else {
                        if (yearIndex === 1) {
                          retDate.err.code = 9
                          retDate.err.msg = 'Wrong year position.'
                          console.error(retDate.err.msg)
                          return retDate
                        } else {
                          datePartArray = [stringArray[yearIndex], stringArray[parseInt(1 - yearIndex / 2)], stringArray[parseInt(2 - yearIndex / 2)]]
                        }
                      }
                      timePartArray = []
                      break
                    case 4:
                      // year and month and date and time
                      if (monthIndex < 0) {
                        retDate.err.code = 11
                        retDate.err.msg = 'No month found.'
                        console.error(retDate.err.msg)
                        return retDate
                      } else {
                        switch (yearIndex) {
                          case 0:
                            if (monthIndex === 1) {
                              datePartArray = [stringArray[0], stringArray[1], stringArray[2]]
                              timePartArray = [stringArray[3]]
                            } else if(monthIndex === 2) {
                              datePartArray = [stringArray[0], stringArray[2], stringArray[1]]
                              timePartArray = [stringArray[3]]
                            } else {
                              retDate.err.code = 12
                              retDate.err.msg = 'Wrong month position.'
                              console.error(retDate.err.msg)
                              return retDate
                            }
                            break
                          case 1:
                            if (monthIndex === 2) {
                              datePartArray = [stringArray[1], stringArray[2], stringArray[3]]
                              timePartArray = [stringArray[0]]
                            } else if(monthIndex === 3) {
                              datePartArray = [stringArray[1], stringArray[3], stringArray[2]]
                              timePartArray = [stringArray[0]]
                            } else {
                              retDate.err.code = 13
                              retDate.err.msg = 'Wrong month position.'
                              console.error(retDate.err.msg)
                              return retDate
                            }
                            break
                          case 2:
                            if (monthIndex === 0) {
                              datePartArray = [stringArray[2], stringArray[0], stringArray[1]]
                              timePartArray = [stringArray[3]]
                            } else if(monthIndex === 1) {
                              datePartArray = [stringArray[2], stringArray[1], stringArray[0]]
                              timePartArray = [stringArray[3]]
                            } else {
                              retDate.err.code = 14
                              retDate.err.msg = 'Wrong month position.'
                              console.error(retDate.err.msg)
                              return retDate
                            }
                            break
                          case 3:
                            if (monthIndex === 1) {
                              datePartArray = [stringArray[3], stringArray[1], stringArray[2]]
                              timePartArray = [stringArray[0]]
                            } else if(monthIndex === 2) {
                              datePartArray = [stringArray[3], stringArray[2], stringArray[1]]
                              timePartArray = [stringArray[0]]
                            } else {
                              retDate.err.code = 15
                              retDate.err.msg = 'Wrong month position.'
                              console.error(retDate.err.msg)
                              return retDate
                            }
                            break

                          default:
                            retDate.err.code = 16
                            retDate.err.msg = 'Wrong year position.'
                            console.error(retDate.err.msg)
                            return retDate
                            break
                        }
                      }
                      break

                    default:
                      retDate.err.code = 17
                      retDate.err.msg = 'Too much arguments.'
                      console.error(retDate.err.msg)
                      return retDate
                      break
                  }
                } else {
                  // no year
                  if (monthIndex >= 0) {
                    // has month
                    switch (stringArray.length) {
                      case 1:
                        datePartArray = [undefined, stringArray[0], undefined]
                        timePartArray = []
                        break
                      case 2:
                        datePartArray = [undefined, stringArray[monthIndex], stringArray[1 - monthIndex]]
                        timePartArray = []
                        break
                      case 3:
                        switch (monthIndex) {
                          case 0:
                            datePartArray = [undefined, stringArray[0], stringArray[1]]
                            timePartArray = [stringArray[2]]
                            break
                          case 1:
                            // month in the middle
                            // this case only accept 'date month time'
                            datePartArray = [undefined, stringArray[1], stringArray[0]]
                            timePartArray = [stringArray[2]]
                            break
                          case 2:
                            datePartArray = [undefined, stringArray[2], stringArray[1]]
                            timePartArray = [stringArray[0]]
                            break

                          default:
                            retDate.err.code = 18
                            retDate.err.msg = 'Wrong month position.'
                            console.error(retDate.err.msg)
                            return retDate
                            break
                        }
                        break

                      default:
                        retDate.err.code = 19
                        retDate.err.msg = 'Too much arguments.'
                        console.error(retDate.err.msg)
                        return retDate
                        break
                    }
                  } else {
                    // no month
                    switch (stringArray.length) {
                      case 1:
                        // parse as 'date'
                        datePartArray = [undefined, undefined, stringArray[0]]
                        timePartArray = [0]
                        break
                      case 2:
                        // parse as 'date time'
                        datePartArray = [undefined, undefined, stringArray[0]]
                        timePartArray = [1]
                        break

                      default:
                        retDate.err.code = 20
                        retDate.err.msg = 'Too much arguments.'
                        console.error(retDate.err.msg)
                        return retDate
                        break
                    }
                  }
                }
              }
            }
          }

          switch (dateAmendmentType) {
            case 1:
              switch (datePartArray.length) {
                case 0:
                  datePartArray = [undefined, undefined, undefined]
                  break
                case 1:
                  var dateSpliterTypeIndex = this.typeIndexOfDateSpliter(datePartArray[0])
                  if (dateSpliterTypeIndex >= 0) {
                    // date part splited by spliters
                    var splitedDatePartArray = datePartArray[0].split(dateSpliter[dateSpliterTypeIndex]).filter((e) => {return e !== ''})
                    switch (splitedDatePartArray.length) {
                      case 1:
                        retDate.err.code = 21
                        retDate.err.msg = 'Extra date spliter.'
                        console.error(retDate.err.msg)
                        return retDate
                        break
                      case 2:
                        // month and date
                        var monthIndex = this.indexOfMonth(splitedDatePartArray)
                        if (monthIndex >= 0) {
                          datePartArray = [undefined, splitedDatePartArray[monthIndex], splitedDatePartArray[1 - monthIndex]]
                        } else {
                          datePartArray = [undefined, splitedDatePartArray[0], splitedDatePartArray[1]]
                        }
                        break
                      case 3:
                        // year and month and date
                        var yearIndex = this.indexOfYear(splitedDatePartArray)
                        var monthIndex = this.indexOfMonth(splitedDatePartArray)
                        if (yearIndex >= 0) {
                          if (monthIndex >= 0) {
                            datePartArray = [splitedDatePartArray[yearIndex], splitedDatePartArray[monthIndex], splitedDatePartArray[3 - monthIndex - yearIndex]]
                          } else {
                            if (this.isYear(splitedDatePartArray[1])) {
                              retDate.err.code = 29
                              retDate.err.msg = 'Wrong year position.'
                              console.error(retDate.err.msg)
                              return retDate
                            } else {
                              datePartArray = [splitedDatePartArray[yearIndex], splitedDatePartArray[parseInt(1 - yearIndex / 2)], splitedDatePartArray[parseInt(2 - yearIndex / 2)]]
                            }
                          }
                        } else {
                          retDate.err.code = 22
                          retDate.err.msg = 'Year not found.'
                          console.error(retDate.err.msg)
                          return retDate
                        }
                        break

                      default:
                        retDate.err.code = 23
                        retDate.err.msg = 'Too much arguments in date part.'
                        console.error(retDate.err.msg)
                        return retDate
                        break
                    }
                  } else {
                    // date part not splited by spliters, i.e., only one argument
                    var tempArg = datePartArray[0]
                    if (this.isYear(tempArg)) {
                      datePartArray = [tempArg, undefined, undefined]
                    } else if (this.isMonth(tempArg)) {
                      datePartArray = [undefined, tempArg, undefined]
                    } else {
                      datePartArray = [undefined, undefined, tempArg]
                    }
                  }
                  break
                case 2:
                  var dateSpliterTypeIndex = this.typeIndexOfDateSpliter(datePartArray.join(''))
                  if (dateSpliterTypeIndex >= 0) {
                    // contain date spliter
                    var dateSpliterPos = 0
                    for (; dateSpliterPos < datePartArray.length; dateSpliterPos++) {
                      if (datePartArray[dateSpliterPos].includes(dateSpliter[dateSpliterTypeIndex])) break
                    }
                    //var tempDatePartArray = [datePartArray[1 - dateSpliterPos]]
                    var remainPartArray = datePartArray[dateSpliterPos].split(dateSpliter[dateSpliterTypeIndex]).filter((e) => {return e !== ''})
                    if (this.isMonth(remainPartArray[0])) {
                      // 'month/date'
                      datePartArray = [datePartArray[1 - dateSpliterPos], remainPartArray[0], remainPartArray[1]]
                    } else if (this.isMonth(remainPartArray[1])) {
                      // 'date/month'
                      datePartArray = [datePartArray[1 - dateSpliterPos], remainPartArray[1], remainPartArray[0]]
                    } else {
                      // parse as 'month/date'
                      datePartArray = [datePartArray[1 - dateSpliterPos], remainPartArray[0], remainPartArray[1]]
                    }
                  } else {
                    // not contain date spliter
                    var yearIndex = this.indexOfYear(datePartArray)
                    var monthIndex = this.indexOfMonth(datePartArray)
                    if (yearIndex >= 0) {
                      if (monthIndex >= 0) {
                        datePartArray = [datePartArray[yearIndex], datePartArray[monthIndex], undefined]
                      } else {
                        retDate.err.code = 25
                        retDate.err.msg = 'Only year and date'
                        console.error(retDate.err.msg)
                        return retDate
                      }
                    } else {
                      if (monthIndex >= 0) {
                        datePartArray = [undefined, datePartArray[monthIndex], datePartArray[1 - monthIndex]]
                      } else {
                        // parse as 'month/date'
                        datePartArray = [undefined, datePartArray[monthIndex], datePartArray[1 - monthIndex]]
                      }
                    }
                  }
                  break
                case 3:
                  var dateSpliterTypeIndex = this.typeIndexOfDateSpliter(datePartArray.join(''))
                  if (dateSpliterTypeIndex >= 0) {
                    // contain date spliter, which is wrong this case
                    retDate.err.code = 26
                    retDate.err.msg = 'Extra date spliter.'
                    console.error(retDate.err.msg)
                    return retDate
                  } else {
                    // not contain date spliter
                    var yearIndex = this.indexOfYear(datePartArray)
                    var monthIndex = this.indexOfMonth(datePartArray)
                    if (yearIndex >= 0) {
                      if (monthIndex >= 0) {
                        datePartArray = [datePartArray[yearIndex], datePartArray[monthIndex], datePartArray[3 - yearIndex - monthIndex]]
                      } else {
                        // parse as 'year/month/date' or 'month/date/year'
                        if (this.isYear(datePartArray[1])) {
                          retDate.err.code = 27
                          retDate.err.msg = 'Wrong year position.'
                          console.error(retDate.err.msg)
                          return retDate
                        } else {
                          datePartArray = [datePartArray[yearIndex], datePartArray[parseInt(1 - yearIndex / 2)], datePartArray[parseInt(2 - yearIndex / 2)]]
                        }
                      }
                    } else {
                      retDate.err.code = 28
                      retDate.err.msg = 'Year not found.'
                      console.error(retDate.err.msg)
                      return retDate
                    }
                  }
                  break

                default:
                  retDate.err.code = 2
                  retDate.err.msg = 'Too much arguments for year, month and date.'
                  console.error(retDate.err.msg)
                  return retDate
                  break
              }
              break
            
            default:
              // do nothing here
              break
          }

          //console.log('Parsed result')
          //console.log(datePartArray)
          //console.log(timePartArray)

          // Fill any undefined in date part with today and verify
          var isYearSet = !(datePartArray[0] === undefined)
          var isMonthSet = !(datePartArray[1] === undefined)
          var isDateSet = !(datePartArray[2] === undefined)
          var isDatePartSet = (isYearSet || isMonthSet || isDateSet)
          var isTimePartSet = (timePartArray.length > 0)
 
          if (!isYearSet) {
            datePartArray[0] = this.now.getFullYear()
          }
          datePartArray[0] = parseInt(datePartArray[0])
          if (!this.isYear(String(datePartArray[0]))) {
            retDate.err.code = 40
            retDate.err.msg = 'Year not valid.'
            console.error(retDate.err.msg)
            return retDate
          }

          if (isMonthSet) {
            if (this.isMonth(String(datePartArray[1]).toLowerCase())) {
              for (var i = 0; i < monthNameArray.length; i++) {
                if (String(datePartArray[1]).includes(monthNameArray[i].toLowerCase())) {
                  datePartArray[1] = i + 1
                }
              }
            }
            datePartArray[1] = parseInt(datePartArray[1])
            if (isDateSet) {
              datePartArray[2] = parseInt(datePartArray[2])
            } else {
              if (isTimePartSet) {
                // wrong
                retDate.err.code = 50
                retDate.err.msg = 'Month not set but time set.'
                console.error(retDate.err.msg)
                return retDate
              } else {
                // set date to 1 but not important
                datePartArray[2] = 1
              }
            }
          } else {
            datePartArray[1] = this.now.getMonth() + 1
            if (isDateSet) {
              datePartArray[2] = parseInt(datePartArray[2])
            } else {
              if (isTimePartSet) {
                datePartArray[2] = this.now.getDate()
              } else {
                // wrong
                retDate.err.code = 51
                retDate.err.msg = 'nothing is set.'
                console.error(retDate.err.msg)
                return retDate
              }
            }
          }
          
          if (datePartArray[1] < 1 || datePartArray[1] > 12) {
            retDate.err.code = 41
            retDate.err.msg = 'Month not valid.'
            console.error(retDate.err.msg)
            return retDate
          }
          if (datePartArray[2] < 0 || datePartArray[2] > 31) {
            retDate.err.code = 42
            retDate.err.msg = 'Date not valid.'
            console.error(retDate.err.msg)
            return retDate
          }

          // Parse time part
          var isHourSet = false, isMinuteSet = false, isSecondSet = false
          switch (timePartArray.length) {
            case 0:
              timePartArray = [0, 0, 0]
              break
            case 1:
              if (this.isTime(timePartArray[0])) {
                var splitedTime = [timePartArray[0]]
                for (var i = 0; i < timeSpliter.length; i++) {
                  if (timePartArray[0].includes(timeSpliter[i])) {
                    splitedTime = timePartArray[0].split(timeSpliter[i]).filter((e) => {return e !== ''})
                    break
                  }
                }
                timePartArray = [splitedTime[0], splitedTime[1], splitedTime[2]]
                if (!(timePartArray[0] === undefined)) {
                  // only one number in time, parsed as hour
                  isHourSet = true
                  timePartArray[0] = parseInt(timePartArray[0])
                  if (!(timePartArray[1] === undefined)) {
                    // two numbers in time, hour:minute
                    isMinuteSet = true
                    timePartArray[1] = parseInt(timePartArray[1])
                    if (!(timePartArray[2] === undefined)) {
                      // three numbers in time, hour:minute:second
                      isSecondSet = true
                      timePartArray[2] = parseInt(timePartArray[2])
                    } else {
                      timePartArray[2] = 0;
                    }
                  } else {
                    timePartArray[1] = 0;
                    timePartArray[2] = 0;
                  }
                } else {
                  // should never reach here
                  retDate.err.code = 61
                  retDate.err.msg = 'Hour not set.'
                  console.error(retDate.err.msg)
                  return retDate
                }
                
              } else {
                retDate.err.code = 43
                retDate.err.msg = 'Time not valid.'
                console.error(retDate.err.msg)
                return retDate
              }
              break
            case 2:
              if (this.isTime(timePartArray[0])) {
                var splitedTime = [timePartArray[0]]
                for (var i = 0; i < timeSpliter.length; i++) {
                  if (timePartArray[0].includes(timeSpliter[i])) {
                    splitedTime = timePartArray[0].split(timeSpliter[i]).filter((e) => {return e !== ''})
                    break
                  }
                }
                var apmType = timePartArray[1]
                timePartArray = [splitedTime[0], splitedTime[1], splitedTime[2]]
                if (!(timePartArray[0] === undefined)) {
                  // only one number in time, parsed as hour
                  isHourSet = true
                  timePartArray[0] = parseInt(timePartArray[0])
                  if (timePartArray[0] === 12) {
                    if (apmType === 'a') timePartArray[0] = 0
                  } else if (timePartArray[0] < 12) {
                    if (apmType === 'p') timePartArray[0] += 12
                  }
                  if (!(timePartArray[1] === undefined)) {
                    // two numbers in time, hour:minute
                    isMinuteSet = true
                    timePartArray[1] = parseInt(timePartArray[1])
                    if (!(timePartArray[2] === undefined)) {
                      // three numbers in time, hour:minute:second
                      isSecondSet = true
                      timePartArray[2] = parseInt(timePartArray[2])
                    } else {
                      timePartArray[2] = 0;
                    }
                  } else {
                    timePartArray[1] = 0;
                    timePartArray[2] = 0;
                  }
                } else {
                  // should never reach here
                  retDate.err.code = 61
                  retDate.err.msg = 'Hour not set.'
                  console.error(retDate.err.msg)
                  return retDate
                }
                
              } else {
                retDate.err.code = 43
                retDate.err.msg = 'Time not valid.'
                console.error(retDate.err.msg)
                return retDate
              }
              break
          
            default:
              retDate.err.code = 62
              retDate.err.msg = 'Too much time arguments.'
              console.error(retDate.err.msg)
              return retDate
              break
          }
          if (timePartArray[0] < 0 || timePartArray[0] > 23) {
            retDate.err.code = 63
            retDate.err.msg = 'Hour not valid.'
            console.error(retDate.err.msg)
            return retDate
          }
          if (timePartArray[1] < 0 || timePartArray[1] > 59) {
            retDate.err.code = 64
            retDate.err.msg = 'Minute not valid.'
            console.error(retDate.err.msg)
            return retDate
          }
          if (timePartArray[2] < 0 || timePartArray[2] > 59) {
            retDate.err.code = 64
            retDate.err.msg = 'Second not valid.'
            console.error(retDate.err.msg)
            return retDate
          }

          //console.log('Verified result')
          console.log(datePartArray)
          console.log(timePartArray)

          /* Fill this return object
          start: {
            isSet: true,
            value: null, remainValue: null,
            week: null, weekName: null,
            isDatePartSet: null,
            year: null, isYearSet: null,
            month: null, isMonthSet: null, monthName: null,
            date: null, isDateSet: null,
            isTimePartSet: null,
            hour: null, isHourSet: null,
            minute: null, isMinuteSet: null,
            second: null, isSecondSet: null,
          }
          */
          retDate.start.isSet = true
          retDate.start.isDatePartSet = isDatePartSet
          retDate.start.year = datePartArray[0]
          retDate.start.isYearSet = isYearSet && (this.now.getFullYear() !== datePartArray[0])
          retDate.start.month = datePartArray[1]
          retDate.start.isMonthSet = isMonthSet
          retDate.start.monthName = monthNameArray[datePartArray[1] - 1]
          retDate.start.date = datePartArray[2]
          retDate.start.isDateSet = isDateSet
          retDate.start.isTimePartSet = isTimePartSet
          retDate.start.hour = timePartArray[0]
          retDate.start.isHourSet = isHourSet
          retDate.start.minute = timePartArray[1]
          retDate.start.isMinuteSet = isMinuteSet
          retDate.start.second = timePartArray[2]
          retDate.start.isSecondSet = isSecondSet
          // get weekday and value using Date()
          var tempDate = new Date()
          tempDate.setFullYear(datePartArray[0])
          tempDate.setMonth(datePartArray[1] - 1)
          tempDate.setDate(datePartArray[2])
          tempDate.setHours(timePartArray[0])
          tempDate.setMinutes(timePartArray[1])
          tempDate.setSeconds(timePartArray[2])
          retDate.start.week = tempDate.getDay()
          retDate.start.weekName = weekNameArray[tempDate.getDay()]
          retDate.start.value = tempDate.valueOf()
          retDate.start.remainValue = tempDate.valueOf() - this.now.valueOf()
          return retDate
          break
          
        // Two dates, recursion
        case 2:
          var startString = dateArray[0]
          var startParsed = this.exec(startString)
          if (startParsed.err.code !== 0) {
            retDate.err.code = startParsed.err.code
            retDate.err.msg = '(start date) ' + startParsed.err.msg
            console.error(retDate.err.msg)
            return retDate
          } else {
            var endString = dateArray[1]
            var endParsed = this.exec(endString)
            if (endParsed.err.code !== 0) {
              retDate.err.code = endParsed.err.code
              retDate.err.msg = '(end date) ' + endParsed.err.msg
              console.error(retDate.err.msg)
              return retDate
            } else {
              // both correct
              retDate.start = startParsed.start
              retDate.end = endParsed.start
              return retDate
            }
          }
          break
    
        default:
          retDate.err.code = 100
          retDate.err.msg = 'Too much dates.'
          console.error(retDate.err.msg)
          return retDate
          break
      }
    },

    isYear: function (string) {
      var flag = false
      for (var i = -40; i <= 100; i++) {
        if(string.includes(String(this.now.getFullYear() + i))) {
          flag = true
          break
        }
      }
      return flag
    },

    isMonth: function (string) {
      var flag = false
      for (var i = 0; i < monthNameArray.length; i++) {
        if(string.toLowerCase().includes(monthNameArray[i].toLowerCase())) {
          flag = true
          break
        }
      }
      return flag
    },
    isTime: function (string) {
      var splited = [string]
      for (var i = 0; i < timeSpliter.length; i++) {
        if (string.includes(timeSpliter[i])) {
          splited = string.split(timeSpliter[i]).filter((e) => {return e !== ''})
          break
        }
      }
      var flag = true
      for (var i = 0; i < splited.length; i++) {
        if (!(/^\d+$/.test(splited[i]))) {
          flag = false
          break
        }
      }
      return flag
    },

    typeIndexOfAPM: function (string) {
      var s = string.toLowerCase()
      for (var i = 0; i < apmFlag.length; i++) {
        if (s.includes(apmFlag[i])) {
          var index = s.indexOf(apmFlag[i])
          var isTrueAPM = false
          do {
            isTrueAPM = !('jme'.includes(s.charAt(index - 1))) && ( (index + apmFlag[i].length === s.length) || !('pu'.includes(s.charAt(index + 1))) )
            if (isTrueAPM) return i
          } while ((index = s.indexOf(apmFlag[i], index + 1)) !== -1)
        }
      }
      return -1
    },
    typeIndexOfDateSpliter: function (string) {
      for (var i = 0; i < dateSpliter.length; i++) {
        if (string.toLowerCase().includes(dateSpliter[i])) return i
      }
      return -1
    },
    typeIndexOfTimeSpliter: function (string) {
      for (var i = 0; i < timeSpliter.length; i++) {
        if (string.toLowerCase().includes(timeSpliter[i])) return i
      }
      return -1
    },

    indexOfYear: function (array) {
      for (var i = 0; i < array.length; i++) {
        if (this.isYear(array[i])) return i
      }
      return -1
    },
    indexOfMonth: function (array) {
      for (var i = 0; i < array.length; i++) {
        if (this.isMonth(array[i])) return i
      }
      return -1
    },

    //util for outside
    numberToTwoDigitString: function (num) {
      var str = num
      if (num < 10) str = '0' + String(num)
      return String(str)
    },
    getMonthName: function (num) {
      return monthNameArray[num - 1]
    },
  }
  return parser
})

module.exports = dateParser