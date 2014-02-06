nav = {}

nav.init = function(){

	$('#btn-login').click(function(){
		dialog.show("#login");
		return false;
	});

	$('#btn-profile').click(function(){
		dialog.show("#profile");
		return false;
	});

	$('#btn-logout').click(function(){
		$('body').removeClass('logged');
		return false;
	});

	$('#btn-pin').click(function(){
		alert('Sorry, no pinner is available yet. ;)');
		return false;
	});

}


