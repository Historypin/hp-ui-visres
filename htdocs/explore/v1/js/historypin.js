hp = {
	globals: {},
	urls: {},
	get: {}
}

hp.globals = {
	baseUrl: 'http://api.historypin.com',
	thumbSize: ['200','200'],
}

hp.urls = {

	featuredCollections:	hp.globals.baseUrl + '/collections/all',
	featuredTours:			hp.globals.baseUrl + '/tours/all',
	featuredChannels:		hp.globals.baseUrl + '/channels',

	image: function(id, width, height, quality, crop)
	{
		if (id && width && height)
		{	
			var url = hp.globals.baseUrl + '/services/thumb/phid/' + id + '/dim/' + parseInt(width) + 'x' + parseInt(height);

			if ((quality > 20) && (quality <= 100)) url = url + '/quality/' + parseInt(quality);
			if (crop == true) url = url + '/crop/' + 1;

			return url;
		}
		else
		{
			if (typeof console == "object") console.log('id, width, height - are required fields');
			return false;
		}
	},

	channel: function(userid)
	{
		return hp.globals.baseUrl + '/channels/feed/' + userid;
	},

	tour: function(tourid)
	{
		return hp.globals.baseUrl + '/photos/feed/tour/' + tourid;
	},

	tourStep: function(stepid)
	{
		return hp.globals.baseUrl + '/photos/info/phid/' + stepid;
	},

	pin: function(id)
	{
		return hp.globals.baseUrl + '/photos/info/phid/' + id + '/map/1/full/1';
	}

}

hp.get = {
	
	pin: function(id)
	{
		return $.getJSON( hp.urls.pin(id) );
	},

	tours: $.getJSON( hp.urls.featuredTours ),

	thumbnail: function(id)
	{
		return hp.urls.image(id, hp.globals.thumbSize[0], hp.globals.thumbSize[1], 80, true);
	}

}
