app = {}

app.views = {
	explore: {}
}

app.changeSection = function(section, pin){

	if ( section )
	{
		$('body').attr('class', section);
	}

}

app.openPin = function(data){
	
	var pin = data;
	var sectionPinView = $('#pin');

	map.globals.curLatLng = new google.maps.LatLng(pin.t, pin.g);
	map.instance.setZoom(17);

	sectionPinView.find('article').remove();

	$pin = 
	'<article>' +
		'<div class="image">' +
			'<img src="' + hp.urls.image(pin.i, 600, 600, 80, false) + '">' +
		'</div>' +
		'<header>' +
			'<h2>' + pin.c + '</h2>' +
			'<p><strong>' + pin.d + '</strong>, Pinned by <a href="#">' + pin.u + '</a></p>' +
		'</header>' +
		'<section>' +
			'<p>' + pin.C + '</p>' +
		'</section>' +
		'<footer>' +
			'<p><strong>Archive:</strong> ' + pin.u + '</p>' +
			//'<p><strong>Author:</strong> ' + data.info.author + '</p>' +
			//'<p><strong>License:</strong> ' + data.info.license + '</p>' +
			//'<p><strong>Copyright:</strong> ' + data.info.copyright + '</p>' +
			'<p><strong>Tags:</strong> ' + pin.K + '</p>' +
		'</footer>' +
	'</article>';
	
	sectionPinView.append($pin);

}


$(function(){

	if (navigator.onLine) {
		
		//console.log('ONLINE!');

		//dialog.init();
		//map.init();
		//nav.init();

		//introJs().start();

	} else {
		//console.log('Connection flaky');
	}

});
