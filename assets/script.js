var savedLocations = [];
var currentLocation;

function kickOff() {
    //Retrive previous location from locale storage
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
        savedLoc(respone.name);
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
