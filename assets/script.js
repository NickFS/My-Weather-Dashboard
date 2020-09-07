var savedLocations = [];
var currentLoc;

function initialize() {
    //grab previous locations from local storage
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    //display buttons for previous searches
    if (savedLocations) {
        //get the last city searched so we can display it
        currentLoc = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLoc);
    }
    else {
        //try to geolocate, otherwise set city to raleigh
        if (!navigator.geolocation) {
            //can't geolocate and no previous searches, so just give them one
            getCurrent("Salt Lake City");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=1d6f1ba46964a47625a0af4e5c095640";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLoc = response.name;
        saveLoc(response.name);
        getCurrent(currentLoc);
    });

}

function error(){
    //can't geolocate and no previous searches, so just give them one
    currentLoc = "Raleigh"
    getCurrent(currentLoc);
}

function showPrevious() {
    //show the previously searched for locations based on what is in local storage
    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=1d6f1ba46964a47625a0af4e5c095640&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {
        //create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthforecast").append(currCard);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        //get icon for weather conditions
        var iconURL = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

        var imgDiv = $("<div>").attr("class", "col-md-1").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);
        

        var textDiv = $("<div>").attr("class", "col-md-11");
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
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=1d6f1ba46964a47625a0af4e5c095640&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
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
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=1d6f1ba46964a47625a0af4e5c095640&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#earthforecast").append(newrow);

        //loop through array response to find the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("M/D/YYYY"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    //clear all the weather
    $("#earthforecast").empty();
}

function saveLoc(loc){
    //add this to the saved locations array
    if (savedLocations === null) {
        savedLocations = [loc];
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc);
    }
    //save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    //don't refresh the screen
    event.preventDefault();
    //grab the value of the input field
    var loc = $("#searchinput").val().trim();
    //if loc wasn't empty
    if (loc !== "") {
        //clear the previous forecast
        clear();
        currentLoc = loc;
        saveLoc(loc);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();