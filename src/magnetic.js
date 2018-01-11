var magnetic = {
  trajectoryLength: 3, // Only use last 2 states.
  attractionDistance: 10,
  releaseDistance: 15,
  calc: (psArray, traj, size) => {
    var psBoundary = [[0],[0]]
    
    for(var i = 0; i < psArray.length; i++) {
      ps = psArray[i]
      psBoundary[0].push(ps.pos[0])
      psBoundary[0].push(ps.pos[0] + ps.size[0])
      psBoundary[1].push(ps.pos[1])
      psBoundary[1].push(ps.pos[1] + ps.size[1])
    }
    for(var i = 0; i < 2; i++) {
      psBoundary[i] = psBoundary[i].sort(function(obj1, obj2) {
        return obj1 - obj2
      })
    }

    var len = traj.length
    var resPos = traj[len - 1]
    var lstPos = traj[len - 2]
    var diff = _vectorMinus(resPos, lstPos)

    for(var i = 0; i < 2; i++) {
      curMin = traj[len - 1][i]
      curMax = curMin + size[i]
      aMin = nearest(psBoundary[i], curMin)
      aMax = nearest(psBoundary[i], curMax)
      marginMin = abs(aMin - curMin)
      marginMax = abs(aMax - curMax)

      if(lstPos[i] == aMin || lstPos[i] + size[i] == aMax) { // is attracted
        if(abs(diff[i]) < magnetic.getReleaseDistance) {
          resPos[i] = lstPos[i]
        }
      } else if(marginMin < marginMax) { // not attracted
        if(marginMin < magnetic.getAttractionDistance) {
          resPos[i] = aMin
        }
      } else {
        if(marginMax < magnetic.getAttractionDistance) {
          resPos[i] = aMax - size[i]
        }
      }
    }

    return resPos
  },
  get getAttractionDistance () {
    return this.attractionDistance
  },
  get getReleaseDistance () {
    return this.releaseDistance
  },
}

function _vectorMinus(now_pos, pre_pos) {
  return [now_pos[0] - pre_pos[0], now_pos[1] - pre_pos[1]]
}

function _min2(obj1, obj2) {
  return obj1 > obj2 ? obj2 : obj1
}

function nearest(array, val) {
  var inx = 0
  var miDist = -1
  for(var i = 0; i < array.length; i++) {
    if(miDist == -1 || miDist > abs(val - array[i])) {
      inx = i
      miDist = abs(val - array[i])
    }
  }
  return array[inx]
}

var abs = (x) => { return Math.abs(x) }

module.exports = magnetic