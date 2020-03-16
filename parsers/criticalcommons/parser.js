(function( $ ) {
	
	$.fn.parse = function(options) {
		if (!options.query.length) throw "Critical Commons requires at least one search term to be entered into the search field.";
		var model = new $.fn.spreadsheet_model(options);
		model.parse = parse;
		model.fetch('json');
	};
		
		
	function parse(data, archive) {
	  let results = data.results.reduce( (obj, vid) => {
		  let thumb = 'https://criticalcommons.org' + vid.thumbnail_url;
		  let embedLink = vid.url.replace('view', 'embed');
		  obj[vid.url] = {
			  'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail':[{type:'uri',value:thumb}],
			  'http://simile.mit.edu/2003/10/ontologies/artstor#url':[{type:'uri',value:embedLink}],
			  'http://purl.org/dc/terms/title':[{type:'literal',value:vid.title}],
			  'http://purl.org/dc/terms/source':[{type:'literal',value:archive.title}],
			  'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:vid.url}],
			  'http://purl.org/dc/terms/date':[{type:'uri',value:vid.add_date}],
			  'http://purl.org/dc/terms/creator':[{type:'uri',value:vid.author_name}],
		  }
		  if(vid.description && vid.description.length) {
			  obj[vid.url]['http://purl.org/dc/terms/description'] = [{type:'literal',value:vid.description}];
		  }
		  return obj;
	  }, {});
	  console.log(results);
    this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));
