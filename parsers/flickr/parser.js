(function( $ ) {
	
    $.fn.parse = function(options) {
    	if (!options.query.length) throw "Flickr requires at least one search term to be entered into the search field.";
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        for (j = 0; j < data.photo.length; j++) {
        	var uri = data.photo[j].url_l;
        	var date = data.photo[j].datetaken;
        	var description = data.photo[j].description._content;
        	var width = data.photo[j].width_l;
        	var height = data.photo[j].height_l;
        	var identifier = data.photo[j].id;
        	var license = ("0" != data.photo[j].license) ? data.photo[j].license : '';
        	var _type = data.photo[j].media;
        	var format = data.photo[j].originalformat;
        	var creator = data.photo[j].ownername;
        	var subject = data.photo[j].tags;
        	var title = data.photo[j].title;
        	var thumbnail = data.photo[j].url_s;
        	if ('undefined'==typeof(uri)) continue;  // API returns bad images?
        	results[uri] = {};
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:uri}];
        	if ('undefined'!=typeof(date)) results[uri]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
        	if ('undefined'!=typeof(description)) results[uri]['http://purl.org/dc/terms/description'] = [{type:'literal',value:description}];
        	if ('undefined'!=typeof(width)) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#width'] = [{type:'literal',value:width}];
        	if ('undefined'!=typeof(height)) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#height'] = [{type:'literal',value:height}];
        	if ('undefined'!=typeof(identifier)) results[uri]['http://purl.org/dc/terms/identifier'] =  [{type:'literal',value:identifier}];
        	if ('undefined'!=typeof(license)) results[uri]['http://purl.org/dc/terms/license'] = [{type:'literal',value:license}];
        	if ('undefined'!=typeof(_type)) results[uri]['http://purl.org/dc/terms/type'] = [{type:'literal',value:_type}];
        	if ('undefined'!=typeof(format)) results[uri]['http://purl.org/dc/terms/format'] = [{type:'literal',value:format}];
        	if ('undefined'!=typeof(creator)) results[uri]['http://purl.org/dc/terms/creator'] = [{type:'literal',value:creator}];
        	if ('undefined'!=typeof(subject)) results[uri]['http://purl.org/dc/terms/subject'] = [{type:'literal',value:subject}];
        	results[uri]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumbnail}];
        	results[uri]['http://purl.org/dc/terms/source'] = [{type:'literal',value:archive.title}];     
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));