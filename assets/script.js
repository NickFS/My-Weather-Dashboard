var savedLocations = [];
var currentLocation;

function kickOff() {
    //Retrive previous location from local storage
    savedLocations = JSON.parse(localStorage.getItem("weather-regions"));
    var lastSearch;
    //Show region buttons from previous search
    if (savedLocations) {
        //Grab the previous city search for display
        currentLocation = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLocation);
    }
    else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

//API geo location
function go(position) {
    var lat = position.coords.latitude;
    var ion = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=3e39950c2b1b10d2d8d3420d4e51a033";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (respone) {
        currentLocation = response.name;
        savedLoca(respone.name);
        getCurrent(currentLocation);
    });
}

 //Show the last locations based on what's in local storage
function showLast() {
    if (savedLocations) { 
    $("#previousResult").empty();
    var btns = $("div").attr("class", "previous-group");
    for (var i = 0; i < savedLocations.length; i++) {
        var locBtn = $().attr("href", "#").attr("id", "loc-btn".text(savedLocations[i]));
        if (savedLocations[i] === currentLocation) {
            locBtn.attr("class", "previous-group-item previous-group-item-action active");
        }
        else {
            locBtn.attr("class", "previous-group-item previous-group-item-action");
        }
        btns.prepend(locBtn);
    }
    $("#previousResult").append(btns);
}

}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=3e39950c2b1b10d2d8d3420d4e51a033&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function () {
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weather-regions", JSON.stringify(savedLocations));
            kickOff();
        }
    }).then(function (response) {
        //Create card
        var currCard = $("div").attr("class", "card bg-light");
        $("#newforcast").append(currCard);

        var cardRow = $("div").attr("class", "row no-gutters");
        currCard.append(cardRow);

        //Generate icon for weather conditions, city and date
        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //display city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        //display last updated
        var currdate = moment(response.dt, "X").format("M/D/YYYY");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));
        //display Temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //display Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //display Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        //get UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=3e39950c2b1b10d2d8d3420d4e51a033&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });   
}


function getForecast(city) {
    //get 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=3e39950c2b1b10d2d8d3420d4e51a033&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#newforecast").append(newrow);

        //loop through array response to find the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("M/D/YYYY"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

