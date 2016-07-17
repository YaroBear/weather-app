	$(document).ready(function() {

// Unit and and time conversions ***********************************************************

		var defaultUnits = "fahrenheit";

		var Temperature = function(k) {
			this.k = k;

			this.fahrenheit = function()
			{
				return ((9/5)*(k - 273.15) + 32).toFixed(2);
			}
			this.celsius = function()
			{
				return (k - 273.15).toFixed(2);
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

// Sundial animation ***********************************************************

		function sunDial(sunset)
		{	
			var begin = new Date(Date.now());
			var end = new Date(sunset*1000);
			var dayPercent = (begin.getHours()/end.getHours())*100;
			//console.log(dayPercent);
			dayCycle(dayPercent);
		}

		function dayCycle(stop)
		{
			var animate = setInterval(frame, 30);
			var percentage = 0;
			var green = 202;
			var blue = 225;

			function frame(){
				if (percentage >= stop){
					clearInterval(animate);
					frameCount = 0;
				}

				$('.sun-animation').css('width', percentage +"%");
				$('.weather-box').css('background-color', "rgb(126,"+ green +" ,"+ blue +")");

				if (green < 140){
					blue -= 2;
				}

				percentage += 1;
				green -= 1;
			}
		}


// Weather and locations APIs ***********************************************************

		function fetchWeather(zip, country) {
			var weatherCache = JSON.parse(localStorage.getItem('weatherCache'));
			var timeout = JSON.parse(localStorage.getItem('timeout'));

			//console.log(convertUnixTime(timeout));
			//console.log(new Date(Date.now()));

			if (weatherCache === null || (new Date(Date.now()) > timeout)){
				// if no cached weather or 60 minutes has passed since last json call
				console.log("no cached weather or needs update. grabbing json");
				var timeout = (new Date().getTime() + 60*60*1000); // add 60 minutes
				timeout = localStorage.setItem('timeout', timeout);

				const weatherCall = "http://api.openweathermap.org/data/2.5/weather?APPID=7f1fdde8d184ed9e52c57ba51a41ff26";

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

// Display Weather ***********************************************************

		function displayCachedWeather(c)
		{
			var temp = new Temperature(c.main.temp);
			var minTemp = new Temperature(c.main.temp_min);
			var maxTemp = new Temperature(c.main.temp_max);
			var clouds = c.clouds.all; //percentage
			var icon = c.weather[0].icon;
			var humidity = c.main.humidity; //percentage
			var description = c.weather[0].description;
			var sunriseTime = convertUnixTime(c.sys.sunrise);
			var sunsetTime = convertUnixTime(c.sys.sunset);

			sunDial(c.sys.sunset);

			animateWeather(description);


			if (defaultUnits === "fahrenheit")
			{
				$("#current").text(temp.fahrenheit() + " F");
				$("#min").text(minTemp.fahrenheit() + " F");
				$("#max").text(maxTemp.fahrenheit()+ " F");
			}
			else if (defaultUnits === "celsius")
			{
				$("#current").text(temp.celsius() + " C");
				$("#min").text(minTemp.celsius() + " C");
				$("#max").text(maxTemp.celsius() + " C");
			}

			$("#condition").text(description);
			$("#humidity").text(humidity + "%");
			$("#sunrise").text(sunriseTime);
			$("#sunset").text(sunsetTime);
			$("#sunrise-footer").text(sunriseTime);
			$("#sunset-footer").text(sunsetTime);


		}

		function animateWeather(description)
		{
			var cloudy = "<div class='icon cloudy'><div class='cloud'></div><div class='cloud'></div></div>";
			var sunShower = "<div class='icon sun-shower'><div class='cloud'></div><div class='sun'><div class='rays'></div></div><div class='rain'></div></div>";
			var thunderStorm = "<div class='icon thunder-storm'><div class='cloud'></div><div class='lightning'><div class='bolt'></div><div class='bolt'></div></div></div>";
			var snow = "<div class='icon flurries'><div class='cloud'></div><div class='snow'><div class='flake'></div><div class='flake'></div></div></div>"
			var sunny = "<div class='icon sunny'><div class='sun'><div class='rays'></div></div></div>";
			var rainy = "<div class='icon rainy'><div class='cloud'></div><div class='rain'></div></div>";

			if ($(".weather-panel > div").length <= 1) // so multiple weather animations don't stack
			{
				if (description === "few clouds" || description === "scattered clouds" || description === "broken clouds"){
					$(".weather-panel").append(cloudy);
				}
				else if (description === "rain")
				{
					$(".weather-panel").append(sunShower);
				}
				else if (description === "thunder storm")
				{
					$(".weather-panel").append(thunderStorm);
				}
				else if (description === "snow")
				{
					$(".weather-panel").append(snow);
				}
				else if (description === "clear sky")
				{
					$(".weather-panel").append(sunny);
				}
				else if (description === "shower rain")
				{
					$(".weather-panel").append(rainy);
				}
			}
		}


// Buttons ***********************************************************

		$("#change_to_c").click(function(){
			defaultUnits = "celsius";
			fetchWeather();
		});

		$("#change_to_f").click(function(){
			defaultUnits = "fahrenheit";
			fetchWeather();
		});

		$("#clear_cache").click(function(){
			localStorage.clear();
			console.log("local storage cleared");
			document.location.reload(true);
		});

		fetchLocation();

});