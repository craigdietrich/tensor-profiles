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
		var base_url = 'https://'+domain_name;
		for (var j = 0; j < data.list.length; j++) {
			var uri = '';
			var thumb = '';
			if ('undefined'!=typeof(data.list[j].resource.img_original) && null!=data.list[j].resource.img_original) {
				uri = base_url+data.list[j].resource.img_original;
			} else if ('undefined'!=typeof(data.list[j].resource.doc_path) && null!=data.list[j].resource.doc_path) { 
				uri = base_url+data.list[j].resource.doc_path;				
			} else {
				uri = data.list[j].resource.source_url;
			};
			if (-1!=uri.indexOf('?')) uri = uri.substr(0, uri.indexOf('?'));
			if ('undefined'!=typeof(data.list[j].resource.img_thumb) && null!=data.list[j].resource.img_thumb) {
				thumb = base_url+data.list[j].resource.img_thumb;
				if (-1!=thumb.indexOf('?')) thumb = thumb.substr(0, thumb.indexOf('?'));			
			};
			var title = data.list[j].resource.excerpt;
			var desc = data.list[j].resource.credit_formatted;
			var source = archive.title;
			var sourceLocation = base_url+data.list[j].project_resource_uri;
			var format = data.list[j].resource.resource_type;
			var identifier = data.list[j].resource.id;
			var date = data.list[j].created_at;
			var contributor = data.list[j].resource.Owner.name;		
        	results[uri] = {
            		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail':[{type:'uri',value:thumb}],
            		'http://simile.mit.edu/2003/10/ontologies/artstor#url':[{type:'uri',value:uri}],
            		'http://purl.org/dc/terms/title':[{type:'literal',value:title}],
            		'http://purl.org/dc/terms/description':[{type:'literal',value:desc}],
            		'http://purl.org/dc/terms/source':[{type:'literal',value:source}],
            		'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
            		'http://purl.org/dc/terms/format':[{type:'uri',value:format}],
            		'http://purl.org/dc/terms/identifier':[{type:'uri',value:identifier}],
            		'http://purl.org/dc/terms/date':[{type:'uri',value:date}],
            		'http://purl.org/dc/terms/contributor':[{type:'uri',value:contributor}],
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


