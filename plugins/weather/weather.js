(function() {
  var weather = {
    superagent: require("superagent"),
    city: 'Austin',
    cityLat: 30,
    timer: null,
    updateInterval: 60000,
    routine: () => {
      var today = new Date()
      var week = today.getDay()
      var h = today.getHours()
      var m = today.getMinutes()
      weather.superagent.get(weather.getUrl(weather.city, weather.cityLat)).end(function(err, res){
        if (err) {
          console.error('fetch error')
          //display.innerHTML = "Gym hour failed."
        } else {
          weatherData = JSON.parse(res.text)
          if (weatherData.cod === 200) {
            //console.log(weatherData)
            var temperature = weatherData.main.temp
            var maxTemperature = weatherData.main.temp_max
            var minTemperature = weatherData.main.temp_min
            var humidity = weatherData.main.humidity
            var weatherType = weatherData.weather[0].main
            var weatherDescription = weatherData.weather[0].description
            var weatherIconCode = weatherData.weather[0].icon
    
            document.getElementById('cityname').innerHTML = weather.city
            document.getElementById('tempnum').innerHTML = Math.round(temperature)  
            document.getElementById('mintemp').innerHTML = Math.round(minTemperature)
            document.getElementById('maxtemp').innerHTML = Math.round(maxTemperature)
            document.getElementById('weatherimg').src = weather.iconUrl(weatherIconCode)
            document.getElementById('weathertype').innerHTML = weatherType 
            document.getElementById('weatherdesp').innerHTML = 'You can expect ' + weatherDescription + '.' 
          } else {
            console.error('response error')
          }
        }
        weather.timer = setTimeout(weather.routine, weather.updateInterval)
      });
    },
    iconUrl: (code) => {
      return 'http://openweathermap.org/img/w/' + code + '.png'
    },
    getCityId: (city, lat) => {
      var cityId = require("../plugins/weather/citylist.json").filter((c) => {
        return (c.country.toLowerCase() === 'us' && c.name.toLowerCase() === city.toLowerCase() && parseInt(c.coord.lat) === lat)
      })
      if (cityId.length > 0) {
        //console.log(cityId)
        cityId = cityId[0].id
        return cityId
      } else {
        console.error('City not found.')
        return undefined
      }
    },
    getUrl: (city, lat) => {
      return 'api.openweathermap.org/data/2.5/weather?id=' + weather.getCityId(city, lat) + '&units=metric&APPID=fb1283426fdadc596eb83068ec22a862'
    },
    init: () => {
      clearTimeout(weather.timer)
      weather.routine()
    }
  }
  weather.init()
})()