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
		var self = this;
		var results = {};
		var base_url = ('/'==archive.url.substr(archive.url.length-1,1)) ? archive.url : archive.url += '/';
		var show_url = base_url+'items/show/';
		var ontologies_url = $('link#base_url').attr('href')+'wb/ontologies';
		var camelize = function(str) {
			return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
			}).replace(/\s+/g, '');
		};
		$.getJSON(ontologies_url, function(ontologies) {
			console.log(ontologies);
			for (var j = 0; j < data.length; j++) {
				// Fields from the base fields of the item
				var identifier = data[j].id.toString();
				var uri = show_url+identifier;
				var sourceLocation = show_url+identifier;
				var created = data[j].added;
				/* var type = data[j].item_type.name; */
	        	results[uri] = {
	        			'http://purl.org/dc/terms/identifier':[{type:'literal',value:identifier}],
	        			'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
	        			'http://purl.org/dc/terms/created':[{type:'literal',value:created}],
	        			/* 'http://purl.org/dc/terms/type':[{type:'literal',value:type}] */
	            };				
	        	// Tags 
				var subjects = [];  // This might conflict with dcterms:subject's coming in as element_texts
				for (var k = 0; k < data[j].tags.length; k++) {
					subjects.push(data[j].tags[k].name);
				};
				if (subjects.length) {
					results[uri]['http://purl.org/dc/terms/subject'] = [];
					for (var k = 0; k < subjects.length; k++) {
						results[uri]['http://purl.org/dc/terms/subject'].push( {type:'literal',value:subjects[k]} );
					}
				}
	 			// Loop through Omeka's "element_texts" and add fields to the results object
				var sets = {
					"dublin core": {pnode:'dcterms', prefix:'http://purl.org/dc/terms/'},
					"item type metadata": {pnode:'bibo', prefix:'http://purl.org/ontology/bibo/'}
				};
				var transforms = {
					'spatial coverage': 'spatial',
					'date created': 'date',
					'temporal coverage': 'temporal'
				}
				for (var k = 0; k < data[j].element_texts.length; k++) {
					var element_set = sets[data[j].element_texts[k].element_set.name.toLowerCase()];
					if ('undefined'==typeof(element_set)) continue;  // set doesn't exist
					var pnode = sets[data[j].element_texts[k].element_set.name.toLowerCase()].pnode;
					if ('undefined'==typeof(ontologies[pnode])) continue;  // ontology doesn't exist 
					var ontology = ontologies[pnode];
					var fieldname = data[j].element_texts[k].element.name;
					if ('undefined'!=typeof(transforms[fieldname.toLowerCase()])) fieldname = transforms[fieldname.toLowerCase()];
					var fieldname = camelize(fieldname);
					if (-1==ontology.indexOf(fieldname)) continue;  // field doesn't exist in the ontology
					var p = sets[data[j].element_texts[k].element_set.name.toLowerCase()].prefix + fieldname;
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
				if ('undefined'!=typeof(data[j].file_urls) && 'undefined'!=typeof(data[j].file_urls[0])) {
					var file_urls = data[j].file_urls[0];  // TODO: this is where a complex object would be sort out
					var thumbnail = file_urls.thumbnail;
					var fullsize = file_urls.fullsize;
					if (!fullsize) fullsize = file_urls.original;
					if (thumbnail) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumbnail}];
					if (fullsize) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:fullsize}];		
				};
				// Protect title
				if (results[uri]['http://purl.org/dc/terms/title'].length > 1) {
					results[uri]['http://purl.org/dc/terms/title'] = [ results[uri]['http://purl.org/dc/terms/title'][0] ];
				};
			}
	        console.log(results);
	        self.opts.complete_callback(results, archive);
		});
	};   
	
	function save() {
		
	};
    
}( jQuery ));


