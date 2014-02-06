nav = {}

nav.init = function(){

	$('#btn-login').click(function(){
		dialog.show("#login");
	});

	$('#btn-profile').click(function(){
		dialog.show("#profile");
	});

	$('#btn-logout').click(function(){
		$('body').removeClass('logged');
	});

}


