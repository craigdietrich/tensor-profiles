(function( $ ) {
	
	$.fn.preload = function(options) {
		var $el = $('<div class="btn-group parser_add_on" id="item_sets_pulldown" data-item-set-id="0" style="float:left;padding-right:4px;"></div>').insertBefore('#search_form');
		$el.append('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Item Set</span> <span class="caret"></span></button>');
		var $menu = $('<ul class="dropdown-menu"><li class="disabled"><a href="javascript:void(null);">Loading...</a></li></ul>').appendTo($el);
		options.query = '_item_sets';
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = function(data, archive) {
    		$menu.empty();
    		if (!data.length) {
    			$menu.append('<li><a href="javascript:void(null);">There are no Item Sets</a></li>');
    			return;
    		};
    		$('<li><a href="javascript:void(null);" data-item-set-id="0"><i>No Item Set</i></a></li>').appendTo($menu);
    		for (var j = 0; j < data.length; j++) {
    			var id = parseInt(data[j]['o:id']);
    			var title = '[Untitled id '+id+'];';
    			if ('undefined' != typeof(data[j]['dcterms:title'])) title = data[j]['dcterms:title'][0]['@value'];
    			$('<li><a href="javascript:void(null);" data-item-set-id="'+id+'">'+title+'</a></li>').appendTo($menu);
    		};
    		$menu.find('a').click(function() {
    			$menu.find('li').removeClass('active');
    			var id = parseInt($(this).data('item-set-id'));
    			$el.data('item-set-id', id);
    			if (!id) {
    				$el.find('button:first span:first').text('Item Sets');
    				return;
    			};
    			$(this).parent().addClass('active');
    			$el.find('button:first span:first').text('Item Set '+id);
    		});
    	};
    	model.fetch('json');
	};
	
    $.fn.parse = function(options) {
    	var id = parseInt($('#item_sets_pulldown').data('item-set-id'));
    	if (id) options.query += ' item_set_id:'+id;
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
		var ontologies_url = $('link#base_url').attr('href')+'wb/ontologies';
		var namespaces_url = $('link#base_url').attr('href')+'wb/namespaces';
		$.when(
			$.getJSON(ontologies_url),
			$.getJSON(namespaces_url)
		).done(function(ontologies, namespaces) {
			ontologies = ontologies[0];
			namespaces = namespaces[0];
			for (var j = 0; j < data.length; j++) {
				// Omeka base properties
				var uri = data[j]['@id'];
				var identifier = data[j]['o:id'];
				var sourceLocation = base_url;  // This doesn't seem right but not sure there's a way to get to any URLs for Site items
				var created = data[j]['o:created']['@value'];
	        	results[uri] = {
	        			'http://purl.org/dc/terms/identifier':[{type:'literal',value:identifier}],
	        			'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
	        			'http://purl.org/dc/terms/created':[{type:'literal',value:created}]
	            };
	        	var modified = ('undefined' != typeof(data[j]['o:modified']) && null != data[j]['o:modified']) ? data[j]['o:modified']['@value'] : null;
	        	if (modified) results[uri]['http://purl.org/dc/terms/modified'] = [{type:'literal',value:modified}]
	        	// Various media URL fields are either used or not used based on media type it seems
	        	var thumb = null;
	        	var url = '';
	        	if ('undefined' != typeof(data[j]['media'])) {
		        	if ('undefined' != typeof(data[j]['media']['o:thumbnail_urls']['medium'])) thumb = data[j]['media']['o:thumbnail_urls']['medium'];
		        	var url = data[j]['media']['o:original_url'];
		        	if (!url || !url.length) url = data[j]['media']['o:source'];
	        	};
				if (thumb && thumb.length) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
				results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
				// Grab all of the namespaced properties (e.g., Dublin Core)
	        	for (var p in data[j]) {
	        		if ('o:' == p.substr(0, 2)) continue;
	        		if ('@' == p.substr(0, 1)) continue;
	        		if (-1 == p.indexOf(':')) continue;
	        		var arr = p.split(':');
	        		var prefix = arr[0];
	        		var field = arr[1];
	        		if ('undefined' == typeof(namespaces[prefix])) continue;  // Not a supported ontology prefix
	        		if ('undefined' == typeof(ontologies[prefix]) || -1 == ontologies[prefix].indexOf(field)) continue;  // Predicate isn't in the ontology
	        		if ('undefined'==typeof(results[uri][namespaces[prefix]+field])) results[uri][namespaces[prefix]+field] = [];
	        		for (var k = 0; k < data[j][p].length; k++) {
	        			var type = data[j][p][k].type;
	        			var value = data[j][p][k]['@value'];
	        			if ('undefined' == typeof(value)) continue;
	        			results[uri][namespaces[prefix]+field].push({type:type,value:value});
	        		};
	        	};
	        	// Make sure there's a title and try to fill in the description
        		if ('undefined' == typeof(results[uri]['http://purl.org/dc/terms/title'])) {
        			results[uri]['http://purl.org/dc/terms/title'] = [{type:'literal',value:'[Untitled]'}];
        		} else if (results[uri]['http://purl.org/dc/terms/title'].length > 1) {
					results[uri]['http://purl.org/dc/terms/title'] = [ results[uri]['http://purl.org/dc/terms/title'][0] ];
				};
				if ('undefined' == typeof(results[uri]['http://purl.org/dc/terms/descriptiion']) && 'undefined' != typeof(data[j]['media']) && 'undefined' != typeof(data[j]['media']['data']) && 'undefined' != typeof(data[j]['media']['data']['description']) ) {
					results[uri]['http://purl.org/dc/terms/descriptiion'] = [{type:'literal',value:data[j]['media']['data']['description']}];
				} else if ('undefined' != typeof(results[uri]['http://purl.org/dc/terms/descriptiion']) && results[uri]['http://purl.org/dc/terms/descriptiion'].length > 1) {
					results[uri]['http://purl.org/dc/terms/title'] = [ results[uri]['http://purl.org/dc/terms/title'][0] ];
				};
			};
	        console.log(results);
	        self.opts.complete_callback(results, archive);
		});
	};   
	
	function save() {
		
	};
    
}( jQuery ));


