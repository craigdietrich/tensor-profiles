(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
		var tkcode = function(value) {
			var obj = {
					"TK Multiple Communities":"mc",
					"TK Non-Verified":"nv",
					"TK Family":"f",
					"TK Seasonal":"s",
					"TK Outreach":"o",
					"TK Verified":"v",
					"TK Attribution":"a",
					"TK Community Use Only":"co",
					"TK Secret / Sacred":"ss",
					"TK Women General":"wg",
					"TK Women Restricted":"wr",
					"TK Men General":"mg",
					"TK Men Restricted":"mr",
					"TK Non-Commercial":"nc",
					"TK Commercial":"c",
					"TK Culturally Sensitive":"cs"
			};
			if ('undefined' != typeof(obj[value])) return obj[value];
			return '';
		};
        var results = {};
        var allowable_prefixes = ['dc','dcterms','vra'];
        var prefix_mapping = {
        	'dc' : 'http://purl.org/dc/terms/',
        	'dcterms' : 'http://purl.org/dc/terms/',
        	'vra' : 'http://purl.org/vra/'
        };
        var disallowed_metadata_keys = ['dc.identifier.uri','dc.date.accessioned','dc.date.available'];
        if ('/' != archive.url.substr(-1)) archive.url += '/';
        for (var j = 0; j < data.length; j++) {
        	for (var k = 0; k < data[j].bitstreams.length; k++) {
        		if ('license.txt' == data[j].bitstreams[k].name) continue;
        		var sourceLocation = archive.url+'handle/'+data[j].handle;
        		var url = archive.url+'bitstream/'+data[j].handle+'/'+data[j].bitstreams[k].sequenceId+'/'+encodeURIComponent(data[j].bitstreams[k].name);
        		var thumbnail = url;
	        	// Write object
	        	results[url] = {
	        		'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation': [{type:'uri',value:sourceLocation}],
	        		'http://purl.org/dc/terms/title': [{type:'literal',value:data[j].name}],
	        		'http://purl.org/dc/terms/type': [{type:'literal',value:data[j].type}],
	        	};
	        	for (var m = 0; m < data[j].metadata.length; m++) {
	        		if ('rs.tkLabel' == data[j].metadata[m].key) {
	        			if ('undefined' == typeof(results[url]['http://localcontexts.org/tk/hasLabel'])) results[url]['http://localcontexts.org/tk/hasLabel'] = [];
	        			var label = 'tk:'+tkcode(data[j].metadata[m].value);
	        			results[url]['http://localcontexts.org/tk/hasLabel'].push({type:'literal',value:label});
	        		};
	        		if (-1 != disallowed_metadata_keys.indexOf(data[j].metadata[m].key)) continue;
	        		if (-1 == allowable_prefixes.indexOf(data[j].metadata[m].schema)) continue;
	        		var key = prefix_mapping[data[j].metadata[m].schema] + data[j].metadata[m].element;
	        		results[url][key] = [{type:'literal',value:data[j].metadata[m].value}];
	        	};
	        	var exp = /^.*\.(jpg|jpeg|gif|png)$/;         
	        	if (exp.test(url, 'i')) {
	        		results[url]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:url}];
	        	};
	        	results[url]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
        	};
        }
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));