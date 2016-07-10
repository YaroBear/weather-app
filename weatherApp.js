	$(document).ready(function() {

		function convertTemp(temp, units){
			if (units === "celsius")
			{
				return temp - 213.15;
			}
			else if (units === "fahrenheit")
			{
				return (temp * (9/5) - 459.67);
			}
		}

		function convertUnixTime(timestamp){
			var date = new Date(timestamp*1000);
			var hours = date.getHours();
			var minutes = "0" + date.getMinutes();
			var seconds = "0" + date.getSeconds();
			var formattedTime = hours + ':' + minutes.substr(-2) + ':' +seconds.substr(-2);
			return formattedTime;
		}


		function displayCachedWeather(c)
		{
			var temp = c.main.temp;
			var minTemp = c.main.temp_min;
			var maxTemp = c.main.temp_max;
			var clouds = c.clouds.all; //percentage
			var icon = c.weather[0].icon;
			var humidity = c.main.humidity; //percentage
			var description = c.weather[0].description;
			var sunriseTime = convertUnixTime(c.sys.sunrise);
			var sunsetTime = convertUnixTime(c.sys.sunset);


			$("#current").text(temp);
			$("#min").text(minTemp);
			$("#max").text(maxTemp);
			$("#condition").text(description);
			$("#humidity").text(humidity + "%");
			$("#sunrise").text(sunriseTime);
			$("#sunset").text(sunsetTime);

			console.log(convertTemp(temp, "fahrenheit"));


		}

		function fetchWeather(zip, country) {
			var weatherCache = JSON.parse(localStorage.getItem('weatherCache'));
			var timeout = JSON.parse(localStorage.getItem('timeout'));

			console.log(convertUnixTime(timeout));

			if (!weatherCache || (new Date().getTime() > timeout)){
				// if no cached weather or 60 minutes has passed since last json call
				console.log("no cached weather or needs update. grabbing json");
				var timeout = new Date().getTime() + 60*60*100; // add 60 minutes
				timeout = localStorage.setItem('timeout', timeout);

				var weatherCall = "http://api.openweathermap.org/data/2.5/weather?APPID=7f1fdde8d184ed9e52c57ba51a41ff26";

				$.getJSON(weatherCall + "&zip=" + zip + "," + country.toLowerCase()  , function(data){
					weatherCache  = localStorage.setItem('weatherCache', JSON.stringify(data));

				});
				displayCachedWeather(weatherCache);
			}
			else {
				displayCachedWeather(weatherCache);
			}
		}


		function fetchLocation(){
			$.getJSON("http://ip-api.com/json/?callback=?", function(data) {
				var city = data.city;
				var state = data.regionName;
				var country = data.countryCode;
				var zip = data.zip;

				$("#location").text(city + ", " + state + " " + country);
				fetchWeather(zip, country);
			});
		}

		function dayCycle(stop){
			var frameCount = 0;
			var top = 325;
			var left = 400;
			var animate = setInterval(frame, 100);
			var angle = 3 * Math.PI / 180;

			function frame(){
				if (frameCount === stop){
					clearInterval(animate);
					frameCount = 0;
				}
				$("#sun").css("left", left);
				$("#sun").css ("top", top);
				angle += 3 * Math.PI/180;
				left = (left + 10 * Math.cos(angle)); 
				top = (top + 10 * Math.sin(angle));
				frameCount +=1;
				
			}
		}



		fetchLocation();
		//dayCycle(300);

});