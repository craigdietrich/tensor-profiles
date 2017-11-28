<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once(dirname(__FILE__).'/config.php');
require_once(dirname(__FILE__).'/DPZFlickr/src/DPZ/Flickr.php');

use \DPZ\Flickr;

$flickr = new Flickr($flickrApiKey, $flickrApiSecret);
$extras = 'description,license,date_upload,date_taken,owner_name,original_format,geo,tags,media,url_s,url_l';

if ($single) {  // Doesn't seem to be a way to get a single image in a way that returns the same info as flickr.photos.search; this is unsafe in that the search results might change, but ...
	$query = substr($query, strpos($query, '?')+1);
	parse_str($query, $parameters);
	$parameters['extras'] = $extras;
	$response = $flickr->call('flickr.photos.search', $parameters);
	$photos = $response['photos'];
	$photos['_tensorQuery'] = $parameters;
} else {
	$parameters =  array(
			'text' => $query,
			'per_page' => 50,
			'page' => $page,
			'extras' => $extras,
	);
	$response = $flickr->call('flickr.photos.search', $parameters);
	$photos = $response['photos'];
	$photos['_tensorQuery'] = array(
			'text' => $query,
			'per_page' => 50,
			'page' => $page
	);
}

$content = json_encode($photos);
?>