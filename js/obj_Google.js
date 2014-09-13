function googleMapsWrapper($map, lat, lng)
{
    this.kml = null;
    this.overlays = [];

    this.center = new google.maps.LatLng(lat, lng);
    this.mapOptions = {
        zoom: 10,
        center: this.center
    };
    this.map = new google.maps.Map($map.get(0), this.mapOptions); //puts a new map in #map, applies some options, and also stores it in a variable;
    
    this.geocoder = new google.maps.Geocoder();;
    this.infoWindow = new google.maps.InfoWindow({ maxWidth: '20em' });

    this.circle = new google.maps.Circle({
        strokeColor: "#00FF00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.35,
        map: this.map,
        radius: 500
    });

    this.myPlace = null;
    this.addInfoEvent(this);
}

googleMapsWrapper.prototype.addInfoEvent = function (self) {
    google.maps.event.addListener(self.map, 'click', function () {
        self.infoWindow.close();
    });
}

//Add KML boundaries
googleMapsWrapper.prototype.addKML = function (kml){
    this.kml = new google.maps.KmlLayer({
        url: kml,
        map: this.map
    });
}

//while there are still pins on the map, remove them from the map and the array
googleMapsWrapper.prototype.clearPins = function(){
    while (this.overlays[0]) {
        this.overlays.pop().setMap(null);
    }
}


googleMapsWrapper.prototype.clearAll = function () {
    this.clearPins();
    this.kml = null;
}

googleMapsWrapper.prototype.updateRadius = function(rad) {
    this.circle.setRadius(rad);
}

googleMapsWrapper.prototype.makeMarker = function(latLng, title, id, clase) {
    var self = this;
    var marker = new google.maps.Marker({
        map: self.map,
        position: latLng,
        //title: location.name
        title: title
    });
    marker.set("unico", id);
    ////////////////////////////////////////////////////////////////////////////////////
    google.maps.event.addListener(marker, 'click', function () {
        self.popPin(this, clase);
    });
    self.overlays.push(marker); //store marker so it can be deleted later
    return marker;
}

googleMapsWrapper.prototype.popPin = function(marker, clase) {
    var unique = marker.get("unico");
    this.infoWindow.setContent($(clase + ' .' + unique).parent().clone().get(0));
    this.infoWindow.open(marker.get("map"), marker);
}

googleMapsWrapper.prototype.updateMyPlace = function (loc) {
    if (this.myPlace != null) this.myPlace.setMap(null);
    this.myPlace = null;
    this.myPlace = new google.maps.Marker({
        map: this.map,
        position: loc,
        //title: location.name
        title: 'My Place',
        icon: 'img/sandCastle.gif'
    });
    this.circle.bindTo('center', this.myPlace, 'position');
}

googleMapsWrapper.prototype.setCenter = function (centre) { this.map.setCenter(centre); }