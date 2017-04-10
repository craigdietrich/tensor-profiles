(function( $ ) {
	
    $.fn.parse = function(options) {
    	console.log(options);
    	if (!options.query.length) throw "SoundCloud requires at least one search term to be entered into the search field.";
    	$.getJSON( $('link#base_url').attr('href')+'parsers/'+options.parser+'/config.json', function(json) {
	    	$.getScript('https://connect.soundcloud.com/sdk/sdk-3.1.2.js', function() {
	    		SC.initialize({
	    		  client_id: json.client_id
	    		});
	    		SC.get('/tracks', {
	    		  q: options.query,
	    		  limit:50
	    		}).then(function(tracks) {
	    		  parse(tracks, options);
	    		});
	    	});
    	});
    };
    
	function parse(tracks, options) {
        var results = {};
        for (var j = 0; j < tracks.length; j++) {
    	    var thumb = tracks[j].artwork_url;
    	    if (!thumb || !thumb.length || -1!=thumb.indexOf('missing_thumb')) thumb = tracks[j].user.avatar_url;
    	    var created = tracks[j].created_at;
    	    var description = tracks[j].description;
    	    var AudioDuration = tracks[j].duration;
    	    var genre = tracks[j].genre;
    	    var identifier = tracks[j].id;
    	    var license = tracks[j].license;
    	    var format = tracks[j].original_format;
        	var sourceLocation = tracks[j].permalink_url;
        	var uri = tracks[j].permalink_url;  // Scalar understands this
        	var title = tracks[j].title;
        	var creator = tracks[j].user.username;
        	results[uri] = {};
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
        	results[uri]['http://purl.org/dc/terms/created'] = [{type:'literal',value:created}];
        	results[uri]['http://purl.org/dc/terms/description'] = [{type:'literal',value:description}];
        	results[uri]['http://ns.exiftool.ca/IPTC/IPTC/1.0/AudioDuration'] = [{type:'literal',value:AudioDuration}];
        	results[uri]['http://id3.org/id3v2.4.0#Genre'] = [{type:'literal',value:genre}];
        	results[uri]['http://purl.org/dc/terms/identifier'] = [{type:'literal',value:identifier}];
        	results[uri]['http://purl.org/dc/terms/license'] = [{type:'literal',value:license}];
        	results[uri]['http://purl.org/dc/terms/format'] = [{type:'literal',value:format}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:uri}];
        	results[uri]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
        	results[uri]['http://purl.org/dc/terms/creator'] = [{type:'literal',value:creator}];
        	results[uri]['http://purl.org/dc/terms/source'] = [{type:'literal',value:options.title}];
        };
        console.log(results);
        options.complete_callback(results, options);
	};
    
}( jQuery ));