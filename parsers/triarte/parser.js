(function( $ ) {
	
    $.fn.parse = function(options) {
    	if (!options.query.length) throw "TriArte requires at least one search term to be entered into the search field.";
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = (options.parse) ? options.parse : parse;
    	model.fetch('html');
    };
    
	function parse(data, archive) {
        var results = {};
        $(data).find('#content table:nth-of-type(2) td[align="center"]').each(function() {
        	// What we can get from the search results page
        	var $this = $(this);
        	var $info = $this.next().next();
        	var sourceLocation = archive.url+$info.find('a:first').attr('href').split('?')[0];
        	var identifier = $info.find('a:first').attr('href').replace('/Obj','').split('?')[0];
        	var title = $info.find('a:first').text();
        	var thumb = ($this.find('a').length) ? archive.url+$this.find('img:first').attr('src') : '';
        	results[sourceLocation] = {};
        	results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
        	results[sourceLocation]['http://purl.org/dc/terms/identifier'] = [{type:'literal',value:identifier}];
        	results[sourceLocation]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
        	if (thumb.length) results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
        	results[sourceLocation]['http://purl.org/dc/terms/source'] = [{type:'literal',value:archive.title}];
        	results[sourceLocation]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:''}];
        	// Get the rest of the values from each object's individual page
        	loading(true, 'TriArte individual objects');
        	if ('undefined'==typeof($.fn.parse.num_object_pages)) $.fn.parse.num_object_pages = 0;
        	$.fn.parse.num_object_pages++;
        	var object_page = $.extend({}, archive, {recursion:1,url_override:sourceLocation,parse:function(data, archive) {
        		var results = {};
        		var $wrapper = $(data).find('#content table:nth-of-type(2)');
        		var url = archive.url+$wrapper.find('.highslide').attr('href');
        		var creator = $wrapper.find('td:nth-of-type(3) strong:first').text();
        		var date = $wrapper.find('p.title')[0].nextSibling.nodeValue;
        		results[archive.url_override] = {};
        		results[archive.url_override]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
        		results[archive.url_override]['http://purl.org/dc/terms/creator'] = [{type:'literal',value:creator}];
        		results[archive.url_override]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
        		$.fn.parse.num_object_pages--;
        		if (!$.fn.parse.num_object_pages) loading(false, 'TriArte individual objects');
        		update_complete_callback(results, (($.fn.parse.num_object_pages)?false:true) );
        	}});
        	$.fn.parse(object_page);
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));