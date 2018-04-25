(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
    
        /*
        var html = document.createElement('div');
        html.innerHTML = data;
        eval( $(html).find('#content').find('script:first').text() );
        data = current_json_data.results.content;
        */
        data = data.results.content;
        console.log(data);
        
        for (var j = 0; j < data.length; j++) {
        	var sourceLocation = data[j].specimenUrl;
        	var title = data[j].commonName;
        	var alternate = data[j].sciName;
        	var thumb = data[j].previewUrl;
        	var url = data[j].mediaUrl;
        	var source = data[j].source + ' / ' + data[j].userDisplayName;
        	var identifier = data[j].catalogId;
        	var license = data[j].licenseType;
        	var description = data[j].location;
        	var type = data[j].mediaType;
        	var date = data[j].obsDttm;
        	// Write object
	        results[sourceLocation] = {};
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
	        results[sourceLocation]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
	        results[sourceLocation]['http://purl.org/dc/terms/description'] = [{type:'literal',value:description}];
	        results[sourceLocation]['http://purl.org/dc/terms/alternate'] = [{type:'literal',value:alternate}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
	        results[sourceLocation]['http://purl.org/dc/terms/source'] = [{type:'literal',value:source}];
	        results[sourceLocation]['http://purl.org/dc/terms/identifier'] = [{type:'literal',value:identifier}];
	        results[sourceLocation]['http://purl.org/dc/terms/license'] = [{type:'literal',value:license}];
	        results[sourceLocation]['http://purl.org/dc/terms/type'] = [{type:'literal',value:type}];
	        results[sourceLocation]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));