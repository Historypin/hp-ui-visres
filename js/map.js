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

	map.instance = new GMaps({
		div: '#map-holder',
		zoom: 5,
		lat: 51.42802,
		lng: -0.175099,

		click: function(e) {
			console.log('click');
		},

		dragend: function(e) {
			console.log('dragend');
		}
	});

	map.instance.setContextMenu({
		control: 'map',
		options: [{
			title: 'Add marker',
			name: 'add_marker',
			action: function(e) {
				this.addMarker({
					lat: e.latLng.lat(),
					lng: e.latLng.lng(),
					title: 'New marker'
				});
			}
		}, {
			title: 'Center here',
			name: 'center_here',
			action: function(e) {
				this.setCenter(e.latLng.lat(), e.latLng.lng());
			}
		}]
	});

	map.instance.addControl({
		position: 'top_right',
		content: 'Geolocate',
		style: {
			margin: '5px',
			padding: '1px 6px',
			background: '#fff',
			fontFamily: 'Roboto, Arial, sans-serif',
			fontSize: '11px',
			border: '1px solid rgba(0, 0, 0, 0.3)',
			borderRadius: '2px',
			boxShadow: 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px'
		},
		events: {
			click: function(){
				console.log(this);
			}
		}
	});

	$.each(map.globals.pinList, function(){
		
		var pinID = this+'';

		hp.get.pin(pinID).done(function(data){

			var pin = data.data;
			map.instance.addMarker({
				lat: pin.t,
				lng: pin.g,
				//animation: google.maps.Animation.DROP,
				title: pin.c,
				infoWindow: {
					content: pin.c
				},
				click: function(e) {

					console.log('You clicked in this marker');

					app.changeSection('explore pin', pin);
					app.openPin(pin);

					map.instance.setCenter(pinLatLng);
				}
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

