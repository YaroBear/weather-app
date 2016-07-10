	$(document).ready(function() {

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
			var animate = setInterval(frame, 2000);
			var angle = 180;
			var radius = 400;
			var maxY = 400;
			var maxX = 800;
			var frameCount = 0;
			var left = 0;
			var top = 0;

			function frame(){
				if (frameCount === stop){
					clearInterval(animate);
					frameCount = 0;
				}
				$("#sun").css("left", left);
				$("#sun").css ("top", top);
				angle += 1;
				left = (Math.cos(angle)*radius); 
				top = (Math.sin(angle)*radius);
				frameCount +=1;
				
			}
		}

		$("#change_to_c").click(function(){
			defaultUnits = "celsius";
			fetchWeather();
		});

		$("#change_to_f").click(function(){
			defaultUnits = "fahrenheit";
			fetchWeather();
		});

		$('.sun-animation').css('width', '50%');
		$('.sun-symbol-path').css('-webkit-transform', 'rotateZ(25deg)');

		fetchLocation();
		//dayCycle(100);

});