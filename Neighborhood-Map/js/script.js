// Model
var locations = [
      {title: "Los Hermanos", location: {lat: 38.930501, lng: -77.033808}, category: "Restaurant", selected: 0, PlaceID: "ChIJy1RS5yHIt4kRtXgclpLhQTk", FourSquareID: "4d55921d9e508cfaa9cc019b"},
      {title: "Beau Thai", location: {lat: 38.930303, lng: -77.038255}, category: "Restaurant", selected: 0, PlaceID: "ChIJR3mNPCHIt4kRg7lh0btyMNA", FourSquareID: "5130e9bae4b0ba0714cdaf1f"},
      {title: "Each Peach Market", location: {lat: 38.928581, lng: -77.037516}, category: "Grocery", selected: 0, PlaceID: "ChIJlRD66yDIt4kRDygS3Io3H0E", FourSquareID: "51b62e1c498e1f35fa361e6e"},
      {title: "Purple Patch", location: {lat: 38.930581, lng: -77.037669}, category: "Restaurant", selected: 0, PlaceID: "ChIJE_TYPSHIt4kR5Lt4xEUwrGY", FourSquareID: "5508c4ac498ee1716001d28c"},
      {title: "Irving Wine and Spirits", location: {lat: 38.928924, lng: -77.037665}, category: "Grocery", selected: 0, PlaceID: "ChIJtenW5yDIt4kRwptMo1pMypE", FourSquareID: "4b04aa56f964a520095622e3"},
      {title: "Elle", location: {lat: 38.931912, lng: -77.038392}, category: "Bar", selected: 0, PlaceID: "ChIJlfHBWyHIt4kROJ7C5CD7Kr4", FourSquareID: "5a66e4a4018cbb2eb2f8b1ee"}
];


// Blank map variable
var map;

// Create a new blank array for all the listing markers.
var markers = [];


initMap = function() {
    var viewModel = function() {
        var self = this;

        // Create a styles array to use with the map.

        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 38.931085, lng: -77.038206},
          zoom: 16,
          mapTypeControl: false
        });

        // Create the infowindow for each marker
        var largeInfowindow = new google.maps.InfoWindow();

        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('B42020');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;
            var title = locations[i].title;
            var placeID = locations[i].FourSquareID;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                id: i,
                placeID: placeID
                });

            // Push the marker to our array of markers.
            markers.push(marker);

            // Create an onclick event to open the large infowindow at each marker.
            marker.addListener('click', function() {
                self.markerSelect(this);
                self.populateInfoWindow(this, largeInfowindow);
                self.openInfoWindow(this, largeInfowindow);
                self.bounce();
            });

            // Two event listeners - one for mouseover, one for mouseout,
            // to change the colors back and forth.
            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });
        };

        self.bounce = function() {
            //var b = locations.map(function(e) { return e.title; }).indexOf(marker.title);
            for (var i = 0; i < locations.length; i++) {
                if (locations[i].selected===0){
                    markers[i].setAnimation(null);
                } else {
                    markers[i].setAnimation(google.maps.Animation.BOUNCE);
                }
            }
        }

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        self.populateInfoWindow = function(marker, infowindow) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker != marker) {
                infowindow.marker = marker;
                infowindow.setContent('');
                
                var ID = marker.placeID;
                
                
                //Foursquare ajax request
                $.ajax({
                            url:'https://api.foursquare.com/v2/venues/' + ID,
                            dataType: 'json',
                            data: '&client_id=V440BDTSXAO41M41IOBQNCEZZSQVCN5K5WLBLDRVHYS2UDRU' +
                            '&client_secret=TLKIFHF0DOTFQZEOPNPL04RURC2GZBDDPAQ2MDFKYBNDUD4N' +
                            '&v=20180323',
                async: true,

                success: function (data) {
                    var result = data.response;
                    var category = result.venue.categories[0].shortName;
                    var addr1 = result.venue.location.formattedAddress[0];
                    var addr2 = result.venue.location.formattedAddress[1];
                    var addr3 = result.venue.location.formattedAddress[2];
                    var rating = result.venue.rating;
                    
                  infowindow.setContent('<div style="font-weight:bold;">' + marker.title + '</div>' + '<br>' + '<div>' + addr1 + '<br>' + addr2 + '<br>' + addr3 + '</div>'+ '<br>' + '<div>Foursquare Rating: ' + rating + '<br>Type: ' + category + '</div>');
  
                        }
                        });
                
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        };

        //Open the infowindow
        self.openInfoWindow = function(marker, infowindow){
            // Close all markers
            for (var i = 0; i < markers.length; i++) {
                infowindow.close(map, marker[i]);        
            }
            //Open the infowindow if the marker is for a newly selected location, close it if you are deselecting a location
            var b = locations.map(function(e) { return e.title; }).indexOf(marker.title);
            if (locations[b].selected===0){
                infowindow.close(map, marker);
            } else {
                infowindow.open(map, marker);
            }
        };

        // Identify the the location as selected if the marker for the location is clicked
        self.markerSelect = function(marker) {
            var b = locations.map(function(e) { return e.title; }).indexOf(marker.title);
            if (locations[b].selected===1){
                locations[b].selected=0;
            } else {
                for (var i = 0; i < locations.length; i++) {
                    locations[i].selected=0;
                }
                locations[b].selected=1;
            }
        };

        //Show the locations
        for (i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
        }

        // This function takes in a COLOR, and then creates a new marker
        // icon of that color. The icon will be 21 px wide by 34 high, have an origin
        // of 0, 0 and be anchored at 10, 34).
        function makeMarkerIcon(markerColor) {
            var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
            return markerImage;
            }


        // Knockout code for the ViewModel
        self.containsObject= function(obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i].title === obj) {
                return true;
                }
            }
            return false;
        };

        self.places = ko.observableArray([]);
        self.categories = ko.observableArray([]);

        locations.forEach(function(locationItem){
            self.categories.push(locationItem.category);
        });

        self.categories.push('All');

        self.categories = ko.dependentObservable(function() {
            return ko.utils.arrayGetDistinctValues(self.categories()).sort();
        }, viewModel);

        locations.forEach(function(locationItem){
            self.places.push({title: locationItem.title});
        });

        var id;
        self.selectLocation = function(item, event) {
            markers.forEach(function(thing){
                if(thing.title===item.title){
                    id = thing.id;
                    if(locations[thing.id].selected===1) {
                        locations[thing.id].selected = 0;
                    } else {
                        locations[thing.id].selected = 1;
                    }
                } else {
                    locations[thing.id].selected = 0;
                }
            });
            self.populateInfoWindow(markers[id], largeInfowindow);
            self.openInfoWindow(markers[id], largeInfowindow);
            self.bounce();
        };

        self.x = ko.observable();
        self.selectCategory = function() {
            self.places([]);
            if (self.x() != 'All') {
                locations.forEach(function(locationItem){
                    if (locationItem.category == self.x()) {
                        self.places.push(locationItem);
                    }
                });
                markers.forEach(function(thing){
                    if(self.containsObject(thing.title, self.places())){
                        thing.setMap(map);
                    } else {
                        thing.setMap(null);
                    }
                });
            } else {
                    locations.forEach(function(locationItem){
                        self.places.push({title: locationItem.title});
                        });
                    markers.forEach(function(thing1){
                        thing1.setMap(map);
                    });
                }
        };
        
    };

    ko.applyBindings(new viewModel());


};

googleError = function() {
    alert("Error, Google Maps API did not load properly");
};