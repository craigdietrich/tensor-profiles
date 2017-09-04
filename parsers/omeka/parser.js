(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
    $.fn.save = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.save = save;
    	model.save();	
    };
    
	function parse(data, archive) {
		var results = {};
		var domain_name = extractDomain(archive.url);
		var base_url = 'http://'+domain_name+'/';
		var show_url = base_url+'items/show/';
		for (var j = 0; j < data.length; j++) {
			// Fields from the base fields of the item
			var identifier = data[j].id.toString();
			var uri = show_url+identifier;
			var sourceLocation = show_url+identifier;
			var date = data[j].added;
			var type = data[j].item_type.name;
        	results[uri] = {
        			'http://purl.org/dc/terms/identifier':[{type:'literal',value:identifier}],
        			'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
        			'http://purl.org/dc/terms/date':[{type:'literal',value:date}],
        			'http://purl.org/dc/terms/type':[{type:'literal',value:type}]
            };				
        	// Tags 
			var subjects = [];
			for (var k = 0; k < data[j].tags.length; k++) {
				subjects.push(data[j].tags[k].name);
			};
			if (subjects.length) {
				results[uri]['http://purl.org/dc/terms/subject'] = [];
				for (var k = 0; k < subjects.length; k++) {
					results[uri]['http://purl.org/dc/terms/subject'].push( {type:'literal',value:subjects[k]} );
				}
			}
 			// Loop through Omeka's "element_texts" and add DC fields to the results object
        	// Some may overwrite the values already set above
			var prefix = 'http://purl.org/dc/terms/';
			for (var k = 0; k < data[j].element_texts.length; k++) {
				if ('dublin core' != data[j].element_texts[k].element_set.name.toLowerCase()) continue;
				var p = prefix + data[j].element_texts[k].element.name.toLowerCase();
				var o_type = (-1==data[j].element_texts[k].text.indexOf('://')) ? 'literal' : 'uri';
				if ('undefined'==typeof(results[uri][p])) results[uri][p] = [];
				results[uri][p].push({type:o_type,value:data[j].element_texts[k].text});
			};	
			// Geolocation
			if ('undefined'!=typeof(data[j].geolocation)) {
				var latlng = data[j].geolocation.latitude+','+data[j].geolocation.longitude;
				results[uri]['http://purl.org/dc/terms/spatial'] = [{type:'literal',value:latlng}];
			};
			// Files
			if ('undefined'!=typeof(data[j].file_urls)) {
				var file_urls = data[j].file_urls[0];  // TODO
				var thumbnail = file_urls.thumbnail;
				var fullsize = file_urls.fullsize;
				if (thumbnail) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumbnail}];
				if (fullsize) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:fullsize}];		
			};
		}
        console.log(results);
        this.opts.complete_callback(results, archive);
	};   
	
	function save() {
		
	};
	
	function extractDomain(url) {
	    var domain;
	    if (url.indexOf("://") > -1) {
	        domain = url.split('/')[2];
	    }
	    else {
	        domain = url.split('/')[0];
	    }
	    domain = domain.split(':')[0];
	    return domain;
	};	
    
}( jQuery ));


