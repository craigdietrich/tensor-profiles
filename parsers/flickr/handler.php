<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once(dirname(__FILE__).'/config.php');
require_once(dirname(__FILE__).'/DPZFlickr/src/DPZ/Flickr.php');

use \DPZ\Flickr;

$flickr = new Flickr($flickrApiKey, $flickrApiSecret);
$parameters =  array(
		'text' => $query,
		'per_page' => 50,
		'extras' => 'description,license,date_upload,date_taken,owner_name,original_format,geo,tags,media,url_s,url_l',
);
$response = $flickr->call('flickr.photos.search', $parameters);
$photos = $response['photos'];

$content = json_encode($photos);
?>