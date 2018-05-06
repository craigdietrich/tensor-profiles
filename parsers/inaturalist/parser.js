(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('xml');
    };
    
	function parse(data, archive) {
        $data = $(data);
        var rows = [];
        $data.find('dwr\\:SimpleDarwinRecord').each(function() {
        	var $this = $(this);
        	var row = {};
        	$this.children().each(function() {
        		var $field = $(this);
        		var name = $field.get(0).nodeName;
        		if ('dcterms:references' == name) return;  // Same as art:sourceLocation
        		var pass = false;
        		if ('dwc:' == name.substr(0, 4)) pass = true;
        		if ('dcterms:' == name.substr(0, 8)) pass = true;
        		if (!pass) return;
        		row[name] = $field.text();
        	});
        	row['dcterms:title'] = $this.find('dwc\\:scientificName').text();
        	row['dcterms:source'] = 'iNaturalist / '+$this.find('dwc\\:recordedBy').text();
        	row['dcterms:spatial'] = $this.find('dwc\\:decimalLatitude').text() + ', ' + $this.find('dwc\\:decimalLongitude').text();
        	row['dcterms:temporal'] = $this.find('dwc\\:eventDate').text();
        	row['art:sourceLocation'] = $this.find('dwc\\:occurrenceID:first').text();
        	var $do = $this.find('eol\\:dataObject');
        	$do.children().each(function() {
        		var $field = $(this);
        		var name = $field.get(0).nodeName;
        		if ('dcterms:' != name.substr(0, 8)) return;
        		row[name] = $field.text();        		
        	});
        	row['art:thumbnail'] = $do.find('media\\:thumbnailURL').text();
        	if (-1 != row['art:thumbnail'].indexOf('?')) row['art:thumbnail'] = row['art:thumbnail'].substr(0, row['art:thumbnail'].indexOf('?'));
        	row['art:url'] = $do.find('ac\\:accessURI').text();
        	if (-1 != row['art:url'].indexOf('?')) row['art:url'] = row['art:url'].substr(0, row['art:url'].indexOf('?'));
        	rows.push(row);
        });
        var results = {};
        for (var j = 0; j < rows.length; j++) {
        	results[rows[j]['art:sourceLocation']] = {};
        	for (var field in rows[j]) {
        		var type = (-1 != rows[j][field].indexOf('://')) ? 'uri' : 'literal';
        		if ('art:'==field.substr(0, 4)) results[rows[j]['art:sourceLocation']]['http://simile.mit.edu/2003/10/ontologies/artstor#'+field.substr(4)] = [{type:type,value:rows[j][field]}];
        		if ('dcterms:'==field.substr(0, 8)) results[rows[j]['art:sourceLocation']]['http://purl.org/dc/terms/'+field.substr(8)] = [{type:type,value:rows[j][field]}];
        		if ('dwc:'==field.substr(0, 4)) results[rows[j]['art:sourceLocation']]['http://rs.tdwg.org/dwc/terms/'+field.substr(4)] = [{type:type,value:rows[j][field]}];
        	};
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));