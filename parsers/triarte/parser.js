(function( $ ) {
	
    $.fn.parse = function(options) {
    	if (!options.query.length) throw "TriArte requires at least one search term to be entered into the search field.";
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = (options.parse) ? options.parse : parse;
    	model.fetch('html');
    };
    
	function parse(data, archive) {
        var results = {};
        if (!$(data).find('#filterBox').length) {  // Single
        	results = single(data, archive);
        } else {  // Search results
	        $(data).find('#content table:nth-of-type(2) td[align="center"]').each(function() {
	        	var $this = $(this);
	        	if (!$this.find('a:first').length) return;
	        	var sourceLocation = archive.url+$this.find('a:first').attr('href').split('?')[0];
	        	var thumb = ($this.find('a').length) ? archive.url+$this.find('img:first').attr('src') : '';
	        	results[sourceLocation] = {};
	        	results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
	        	if (thumb.length) results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
	        	results[sourceLocation]['http://purl.org/dc/terms/title'] = [{type:'literal',value:'Loading'}];
	        	// Get the rest of the values from each object's individual page
	        	loading(true, 'TriArte individual objects');
	        	archive.orig_url = archive.url.slice(0);
	        	if ('undefined'==typeof($.fn.parse.num_object_pages)) $.fn.parse.num_object_pages = 0;
	        	$.fn.parse.num_object_pages++;
	        	var object_page = $.extend({}, archive, {single:1,query:sourceLocation,parse:function(data, archive) {
	        		var results = single(data, archive);
	        		$.fn.parse.num_object_pages--;
	        		if (!$.fn.parse.num_object_pages) loading(false, 'TriArte individual objects');
	        		update_complete_callback(results, (($.fn.parse.num_object_pages)?false:true) );
	        	}});
	        	$.fn.parse(object_page);
	        });
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
	
	function single(data, archive) {
		var results = {};
		var $wrapper = $(data).find('#content table:nth-of-type(2)');
    	var identifier = archive.query.substr(archive.query.lastIndexOf('/Obj')).replace('/Obj','').split('?')[0];
    	var title = $wrapper.find('p.title').text();
    	if (!title || !title.length) title = '(No title)';
		var url = archive.url+$wrapper.find('.highslide').attr('href').trim();
		var thumb = url.replace('/images/','/Thumbnails/');
		var creator = $wrapper.find('td:nth-of-type(3) strong:first').text().trim();
		var date = $wrapper.find('p.title')[0].nextSibling.nodeValue.trim();
		results[archive.query] = {};
    	results[archive.query]['http://purl.org/dc/terms/identifier'] = [{type:'literal',value:identifier}];
    	results[archive.query]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
    	results[archive.query]['http://purl.org/dc/terms/source'] = [{type:'literal',value:archive.title}];	
		results[archive.query]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
		results[archive.query]['http://purl.org/dc/terms/creator'] = [{type:'literal',value:creator}];
		results[archive.query]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
		results[archive.query]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
		return results;
	};
    
}( jQuery ));