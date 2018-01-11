var superagent = require("superagent"),
    cheerio = require("cheerio")
var citylist = require("../plugins/weather/citylist.json")

var city = 'Austin'
var cityId = citylist.filter((c) => {
  return (c.country.toLowerCase() === 'us' && c.name.toLowerCase() === city.toLowerCase() && parseInt(c.coord.lat) === 30)
})
if (cityId.length > 0) {
  //console.log(cityId)
  cityId = cityId[0].id
} else {
  console.error('City not found.')
}

var weatherTimeout

var initializeWeather = () => {
  var weatherUrl = 'api.openweathermap.org/data/2.5/weather?id=' + cityId + '&units=metric&APPID=fb1283426fdadc596eb83068ec22a862'  
  weatherRountine(weatherUrl)
  clearTimeout(weatherTimeout)
}

var weatherRountine = (url) => {
  var today = new Date()
  var week = today.getDay()
  var h = today.getHours()
  var m = today.getMinutes()
  superagent.get(url).end(function(err, res){
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

        document.getElementById('cityname').innerHTML = city
        document.getElementById('tempnum').innerHTML = Math.round(temperature)  
        document.getElementById('mintemp').innerHTML = Math.round(minTemperature)
        document.getElementById('maxtemp').innerHTML = Math.round(maxTemperature)
        document.getElementById('weatherimg').src = iconUrl(weatherIconCode)
        document.getElementById('weathertype').innerHTML = weatherType 
        document.getElementById('weatherdesp').innerHTML = 'You can expect ' + weatherDescription + '.' 
      } else {
        console.error('response error')
      }
    }
    weatherTimeout = setTimeout(() => {weatherRountine(url)}, 60000)
  });
}

var iconUrl = (code) => {
  return 'http://openweathermap.org/img/w/' + code + '.png'
}

initializeWeather()