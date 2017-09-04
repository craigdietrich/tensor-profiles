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
		for (var uri in data) {
			if ('http://scalar.usc.edu/2012/01/scalar-ns#Version'==data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
				var resource = uri.substr(0, uri.lastIndexOf('.'));
				var thumb = false;
				if ('undefined'!=typeof(data[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) {
					thumb = data[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value;
				}
				results[resource] = data[uri];
				if (thumb) results[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
			};
		};
        console.log(results);
        this.opts.complete_callback(results, archive);
	};   
	
	function save() {
		var opts = this.opts;
		var commit = function(obj) {
			var to_send = $.extend({}, obj, {rdf:opts.data});
			$('#sync').rdfimporter(to_send, function() {
				opts.complete_callback(to_send);
			});
		};
		$.getScript( $('link#base_url').attr('href')+'parsers/'+opts.parser+'/jquery.importrdf.js', function() {
			$.getScript( $('link#base_url').attr('href')+'parsers/'+opts.parser+'/papaparse.min.js', function() {
				// Validate the destination book
				$.fn.rdfimporter('book_rdf', {url:opts.url}, function(obj) {
					if ('undefined'!=typeof(obj.err)) {
						var err = (obj.err.length) ? obj.err : 'Either the destination URL is incorrect or the Scalar book isn\'t public';
						return;
					}
					var to_send = {};
					to_send.dest_url = obj.uri;  // This ensures that the URL is to the book regardless of whether the user inputted a page in that book
					to_send.dest_urn = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});	
					to_send.dest_id = 'craigdietrich@gmail.com';
					to_send.source_url = '';
					commit(to_send);
				});
			});
		});
	};
    
}( jQuery ));