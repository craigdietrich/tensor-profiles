(function( $ ) {
	
    $.fn.parse = function(options) {
    	if (!options.query.length) throw options.title+" requires at least one search term to be entered into the search field.";
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        for (var j = 0; j < data.length; j++) {
        	var url = data[j].url_str;
        	var sourceLocation = data[j].source_str;
        	var thumb = data[j].thumb_str;
        	var title = data[j].title;
        	var source = null;
        	if ('undefined'!=typeof(data[j].publia)) {
        		source = data[j].publia;
        	};
        	var lang = null;
        	if ('undefined'!=typeof(data[j].langua)) {
        		lang = data[j].langua;
        	};
        	var type = null;
        	if ('undefined'!=typeof(data[j].typea)) {
        		type = data[j].typea;
        	} else if ('undefined'!=typeof(data[j].type)) {
        		type = data[j].type;
        	};
        	var rights = null;
        	if ('undefined'!=typeof(data[j].rights)) {
        		rights = data[j].rights;
        	};
        	var created = null;
        	if ('undefined'!=typeof(data[j].dmcreated)) {
        		created = data[j].dmcreated;
        	}
        	var coverage = null;
        	if ('undefined'!=typeof(data[j].datea)) {
        		coverage = data[j].datea;
        	} else if ('undefined'!=typeof(data[j].coveraa)) {
        		coverage = data[j].coveraa;
        	};
        	if (coverage && coverage.length && -1 != coverage.indexOf(',')) {
        		coverage = coverage.split(',')[1].trim() + ',' + coverage.split(',')[0].trim();
        	}
        	var format = null;
        	if ('undefined'!=typeof(data[j].format)) {
        		format = data[j].format;
        	} else if ('undefined'!=typeof(data[j].formab)) {
        		format = data[j].formab;
        	};
        	var format = data[j].format;
	        results[sourceLocation] = {};
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
	        results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
	        results[sourceLocation]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
	        if (source && !$.isEmptyObject(source)) results[sourceLocation]['http://purl.org/dc/terms/source'] = [{type:'literal',value:source}];
	        if (lang && !$.isEmptyObject(lang)) results[sourceLocation]['http://purl.org/dc/terms/language'] = [{type:'literal',value:lang}];
	        if (type && !$.isEmptyObject(type)) results[sourceLocation]['http://purl.org/dc/terms/type'] = [{type:'literal',value:type}];
	        if (rights && !$.isEmptyObject(rights)) results[sourceLocation]['http://purl.org/dc/terms/rights'] = [{type:'literal',value:rights}];
	        if (created && !$.isEmptyObject(created)) results[sourceLocation]['http://purl.org/dc/terms/created'] = [{type:'literal',value:created}];
	        if (coverage && !$.isEmptyObject(coverage)) results[sourceLocation]['http://purl.org/dc/terms/coverage'] = [{type:'literal',value:coverage}];
	        if (format && !$.isEmptyObject(format)) results[sourceLocation]['http://purl.org/dc/terms/format'] = [{type:'literal',value:format}];
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));