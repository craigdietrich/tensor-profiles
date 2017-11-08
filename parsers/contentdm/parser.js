(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        for (var j = 0; j < data.length; j++) {
        	// TODO: This is specific to USC because they have a image rendering utility
        	var url = 'http://lib-app.usc.edu/assetserver/controller/item/'+data[j].filena+'.jpg?v=1024';  // TODO: USC-specific utility
        	var thumb = 'http://lib-app.usc.edu/assetserver/controller/item/'+data[j].filena+'.jpg?v=300';
        	var sourceLocation = 'http://digitallibrary.usc.edu/cdm/compoundobject/collection'+data[j].collection+'/id/'+data[j].pointer+'/rec/1';
        	var title = data[j].title;
        	var source = data[j].publia;
        	var lang = data[j].langua;
        	var type = data[j].type;
        	var rights = data[j].rights;
        	var created = data[j].dmcreated;
        	var coverage = data[j].coveraa;
        	var format = data[j].format;
	        results[url] = {};
	        results[url]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
	        results[url]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
	        results[url]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
	        results[url]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
	        results[url]['http://purl.org/dc/terms/source'] = [{type:'literal',value:source}];
	        results[url]['http://purl.org/dc/terms/language'] = [{type:'literal',value:lang}];
	        results[url]['http://purl.org/dc/terms/type'] = [{type:'literal',value:type}];
	        results[url]['http://purl.org/dc/terms/rights'] = [{type:'literal',value:rights}];
	        results[url]['http://purl.org/dc/terms/created'] = [{type:'literal',value:created}];
	        results[url]['http://purl.org/dc/terms/coverage'] = [{type:'literal',value:coverage}];
	        results[url]['http://purl.org/dc/terms/format'] = [{type:'literal',value:format}];
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));