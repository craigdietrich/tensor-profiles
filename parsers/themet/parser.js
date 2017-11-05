(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        for (var j = 0; j < data.results.length; j++) {
        	var image_base = 'http://images.metmuseum.org/CRDImages/'
        	if (archive.single) {
        		var sourceLocation = archive.query;
        	} else {
        		var sourceLocation = archive.url + data.results[j].url;
        	};
        	var title = data.results[j].title;
        	var description = data.results[j].description;
        	var thumb = image_base + data.results[j].regularImage;
        	if (-1 != thumb.indexOf('placeholders')) thumb = '';
        	var url = image_base + data.results[j].largeImage;
        	if (-1 != url.indexOf('placeholders')) url = '';
        	var date = data.results[j].date;
        	var medium = data.results[j].medium;
        	var id = data.results[j].accessionNumber;
        	var source = 'The Metropolitan Museum of Art';
        	// Write object
	        results[sourceLocation] = {};
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
	        results[sourceLocation]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
	        results[sourceLocation]['http://purl.org/dc/terms/description'] = [{type:'literal',value:description}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
	        results[sourceLocation]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
	        results[sourceLocation]['http://purl.org/dc/terms/medium'] = [{type:'literal',value:medium}];
	        results[sourceLocation]['http://purl.org/dc/terms/identifier'] = [{type:'literal',value:id}];
	        results[sourceLocation]['http://purl.org/dc/terms/source'] = [{type:'literal',value:source}];
	        if (archive.single) break;
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));