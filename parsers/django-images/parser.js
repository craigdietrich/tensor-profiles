(function( $ ) {
	
    $.fn.parse = function(options) {
    	if (!options.query.length) throw "The Trans-Atlantic Slave Trade Database requires at least one search term to be entered into the search field.";
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = (options.parse) ? options.parse : parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        for (var uri in data) {
        	// What we can get from the search results page
        	results[data[uri].thumbnail] = {};
        	results[data[uri].thumbnail]['http://purl.org/dc/terms/title'] = [{type:'literal',value:data[uri].label}];
        	results[data[uri].thumbnail]['http://purl.org/dc/terms/description'] = [{type:'literal',value:data[uri].description}];
        	results[data[uri].thumbnail]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:data[uri].thumbnail}];
        	results[data[uri].thumbnail]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:data[uri].url}];
        	results[data[uri].thumbnail]['http://purl.org/dc/terms/source'] = [{type:'literal',value:archive.title}];
        	if ('undefined'!=typeof(data[uri].year)) {
        		results[data[uri].thumbnail]['http://purl.org/dc/terms/date'] = [{type:'literal',value:data[uri].year}];
        	}
        	if ('undefined'!=typeof(data[uri].source)) {
        		results[data[uri].thumbnail]['http://purl.org/dc/terms/contributor'] = [{type:'literal',value:data[uri].source}];
        	}
        	if ('undefined'!=typeof(data[uri].language)) {
        		results[data[uri].thumbnail]['http://purl.org/dc/terms/language'] = [{type:'literal',value:data[uri].language}];
        	}
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));