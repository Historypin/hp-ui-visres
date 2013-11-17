map = {
	globals: {},
	instance: {}
}

map.globals = {
	pinList: [ 7130177 ],
	//pinList: [ 7130177,6042084,6655115,7074021,7202238,6290144,6467781,6498053,2512044,7187505,7127021 ],
	curLatLng: new google.maps.LatLng(51.42802, -0.175099),
}

map.init = function(){

	var mapOptions = {
		center: map.globals.curLatLng,
		zoom: 5,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL
		},
		panControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map.instance = new google.maps.Map(document.getElementById("map-holder"), mapOptions);
	google.maps.visualRefresh = true;

	// Load a small list of pins and position them on the map.
	$.each(map.globals.pinList, function(){
		
		var pinID = this+'';

		hp.get.pin(pinID).done(function(data){

			var pin = data.data;
			var infowindow = new google.maps.InfoWindow({ content: pin.c });
			var pinLatLng = new google.maps.LatLng(pin.t, pin.g);
			var marker = new google.maps.Marker({
				position: pinLatLng,
				animation: google.maps.Animation.DROP,
				map: map.instance
			});

			google.maps.event.addListener(marker, 'click', function() {
				app.changeSection('explore pin', pin);
				app.openPin(pin);
				map.instance.setCenter(pinLatLng);
			});

		});

	});

	// Change map Center and redraw the map
	$('#map-holder').bind("webkitTransitionEnd", function(event){
		if (event.originalEvent.propertyName === "width") {
			google.maps.event.trigger(map.instance, 'resize'); 
			map.instance.setCenter(map.globals.curLatLng);
		}
	});

}

