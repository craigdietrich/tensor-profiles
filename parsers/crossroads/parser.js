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
			var title = '';
			var url = null;
			var thumb = null;
			var content = null;
			var source = null;
			var sourceLocation = null;
			var type = data.list[j].resource.resource_type;
			if ('quote' == data.list[j].resource.resource_type) {
				title = 'Quote by '+data.list[j].resource.credit;
				content = data.list[j].resource.excerpt;
				source = data.list[j].resource.source_url;
			} else if ('image' == data.list[j].resource.resource_type) {
				title = data.list[j].resource.excerpt;
				url = base_url+data.list[j].resource.img_original.substr(0, data.list[j].resource.img_original.indexOf('?'));
				thumb = base_url+data.list[j].resource.img_thumb.substr(0, data.list[j].resource.img_thumb.indexOf('?'));
				source = data.list[j].resource.credit;
				sourceLocation = data.list[j].resource.source_url;
			} else if ('video' == data.list[j].resource.resource_type) {
				title = data.list[j].resource.excerpt;
				url = data.list[j].resource.source_url;
				source = data.list[j].resource.credit;					
			} else if ('audio' == data.list[j].resource.resource_type) {
				title = data.list[j].resource.excerpt;
				url = data.list[j].resource.source_url;
				source = data.list[j].resource.credit;			
			} else if ('link' == data.list[j].resource.resource_type) {
				title = data.list[j].resource.excerpt;
				url = data.list[j].resource.source_url;
				source = data.list[j].resource.credit;					
			} else if ('document' == data.list[j].resource.resource_type) {
				title = data.list[j].resource.excerpt;
				url = base_url+data.list[j].resource.doc_path.substr(0, data.list[j].resource.doc_path.indexOf('?'));
				source = data.list[j].resource.credit;
				sourceLocation = data.list[j].resource.source_url;				
			} else if ('data' == data.list[j].resource.resource_type) {	
				if (data.list[j].resource.img_original && data.list[j].resource.img_original.length) {
					title = data.list[j].resource.excerpt;
					url = base_url+data.list[j].resource.img_original.substr(0, data.list[j].resource.img_original.indexOf('?'));
					thumb = base_url+data.list[j].resource.img_thumb.substr(0, data.list[j].resource.img_thumb.indexOf('?'));
					source = data.list[j].resource.credit;
					sourceLocation = data.list[j].resource.source_url;
					type = 'image';
				} else {
					title = 'Quote by '+data.list[j].resource.credit;
					content = data.list[j].resource.excerpt;
					source = data.list[j].resource.source_url;
					type = 'quote';
				};
			} else if ('assertion' == data.list[j].resource.resource_type) {
				title = 'Assertion by '+data.list[j].resource.credit;
				content = data.list[j].resource.excerpt;
				source = data.list[j].resource.source_url;				
			} else if ('dispatch' == data.list[j].resource.resource_type) {
				if (data.list[j].resource.img_original && data.list[j].resource.img_original.length) {
					title = data.list[j].resource.excerpt;
					url = base_url+data.list[j].resource.img_original.substr(0, data.list[j].resource.img_original.indexOf('?'));
					thumb = base_url+data.list[j].resource.img_thumb.substr(0, data.list[j].resource.img_thumb.indexOf('?'));
					source = data.list[j].resource.credit;
					sourceLocation = base_url+data.list[j].resource.source_url;
					type = 'image';
				} else {
					title = 'Quote by '+data.list[j].resource.credit;
					content = data.list[j].resource.excerpt;
					source = data.list[j].resource.source_url;
					type = 'quote';
				};
			};
			title = title.replace(/\*/g, '');  // Crossroads' brand of italics
			var uri = base_url+'/resources/'+data.list[j].resource_id;
			var contributor = data.list[j].resource.Owner.name;
			// TODO: location
			// TODO: lat/lng
        	results[uri] = {};
        	results[uri]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
        	if (null!=url) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:url}];
        	if (null!=thumb) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
        	if (null!=content) results[uri]['http://rdfs.org/sioc/ns#content'] = [{type:'literal',value:content}];
        	if (null!=source) results[uri]['http://purl.org/dc/terms/source'] = [{type:'literal',value:source}];
        	if (null!=sourceLocation) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
        	results[uri]['http://purl.org/dc/terms/contributor'] = [{type:'literal',value:contributor}];
        	results[uri]['http://purl.org/dc/terms/type'] = [{type:'literal',value:type}];
		}
        console.log(results);
        this.opts.complete_callback(results, archive);
	};   
	
	function save() {
		var opts = this.opts;
		var count = 1;
		var total = 1;
		for (var uri in opts.data) {
			var formData = new FormData();   
			var url = opts.data[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
			console.log(url);
			var request = new XMLHttpRequest();
			request.responseType = "blob";
			request.onload = function() {
			  formData.append("resource[image_file]", request.response);  // https://stackoverflow.com/questions/37241882/how-to-append-an-image-from-url-to-a-formdata-javascript
			  formData.append("resource[resource_type]", 'image');
			  formData.append("resource[image_crop_x]", '');
			  formData.append("resource[image_crop_y]", '');
			  formData.append("resource[image_crop_w]", '');
			  formData.append("resource[image_crop_h]", '');
			  formData.append("resource[image_crop_x2]", '');
			  formData.append("resource[image_crop_y2]", '');
			  formData.append("resource[doc_file]", '');
			  formData.append("resource[excerpt]", 'This is the title');
			  formData.append("resource[credit]", 'This is the credit');
			  formData.append("resource[source_url]", '');
			  formData.append("resource[start_time]", '');
			  formData.append("resource[end_time]", '');
			  formData.append("resource[video_thumb]", '');
			  formData.append("resource[video_id]", '');
			  formData.append("resource[video_type]", '');
			  formData.append("resource[address]", '');
			  formData.append("resource[lng]", '');
			  formData.append("resource[lat]", '');
			  formData.append("resource[courses_list]", '1');
			  formData.append("resource[topics_list]", '15');
			  formData.append("resource[keywords_list]", '4286');
			  $.ajax({
				    url: 'https://'+extractDomain(opts.url)+'/srv/resources.json',
				    data: formData,
				    cache: false,
				    contentType: false,
				    processData: false,
				    /* crossDomain: true, */
				    xhrFields: {
				        withCredentials: true
				    },
				    type: 'POST',
				    success: function(data) {
				        console.log('success');
				        console.log(data);
				        $('#content_progress').width(((count/total)*100)+'%').find('span').text('Content '+count+' of '+total);
				    },
				    error: function(err) {
				    	console.log('error');
				    	console.log(err);
				    	$('#content_progress').width(((count/total)*100)+'%').find('span').text('Content '+count+' of '+total);
				    }
				});			  
			};
			request.onerror = function(e) {
				alert('Something went wrong attempting to get the media file');
			};
			request.open("GET", url);
			request.send();
			count++;
		};
	};
	
	function extractDomain(url) {
	    var domain;
	    if (url.indexOf("://") > -1) {
	        domain = url.split('/')[2];
	    } else {
	        domain = url.split('/')[0];
	    }
	    domain = domain.split(':')[0];
	    return domain;
	};
    
}( jQuery ));


