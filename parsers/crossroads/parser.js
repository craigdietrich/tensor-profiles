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
			} else if ('undefined'!=typeof(data.list[j].resource.source_url) && null!=data.list[j].resource.source_url) {
				uri = data.list[j].resource.source_url;				
			} else if ('undefined'!=typeof(data.list[j].resource.doc_path) && null!=data.list[j].resource.doc_path) { 
				uri = base_url+data.list[j].resource.doc_path;				
			} else {
				continue;  // TODO
			};
			if (-1!=uri.indexOf('?')) uri = uri.substr(0, uri.indexOf('?'));
			if ('undefined'!=typeof(data.list[j].resource.img_thumb) && null!=data.list[j].resource.img_thumb) {
				thumb = base_url+data.list[j].resource.img_thumb;
				if (-1!=thumb.indexOf('?')) thumb = thumb.substr(0, thumb.indexOf('?'));			
			};
			var title = data.list[j].resource.excerpt;
			var desc = data.list[j].resource.credit_formatted;
			var source = archive.title;
			//var sourceLocation = base_url+data.list[j].project_resource_uri;
			var sourceLocation = uri;
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


