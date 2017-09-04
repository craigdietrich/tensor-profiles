<?php

if (empty($url)) return self::error('Invalid URL');

// TODO: use https://stackoverflow.com/questions/26148701/file-get-contents-ssl-operation-failed-with-code-1-and-more

// Extract just the domain name along with the protocol
/*
$parse_url = parse_url($url);
if (!isset($parse_url['scheme']) || empty($parse_url['scheme'])) return self::error('Invalid URL scheme');
if (!isset($parse_url['host']) || empty($parse_url['host'])) return self::error('Invalid URL host');
$domain = $parse_url['scheme'].'://'.$parse_url['host'].'/';
*/

// The API url
if (substr($url, -1, 1) != '/') $url .= '/';
$api = $url.'api/';

// Get items
$url = $api.'items';
//$items = file_get_contents($url);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
$items = curl_exec($ch);
curl_close($ch);
$items = json_decode($items);

// Get files, etc, for each item
for ($j = 0; $j < count($items); $j++) {
	// Files
	$items[$j]->file_urls = array();
	$url = $items[$j]->files->url;
	//$files = file_get_contents($url);
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	$files = curl_exec($ch);
	curl_close($ch);
	$files = json_decode($files);
	foreach ($files as $file) {
		$items[$j]->file_urls[] = $file->file_urls;
	}
	// Geolocations
	if (isset($items[$j]->extended_resources) && isset($items[$j]->extended_resources->geolocations)) {
		$url = $items[$j]->extended_resources->geolocations->url;
		//$geo = file_get_contents($url);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$geo = curl_exec($ch);
		curl_close($ch);
		$geo = json_decode($geo);
		$items[$j]->geolocation = new stdClass();
		$items[$j]->geolocation->latitude = $geo->latitude;
		$items[$j]->geolocation->longitude = $geo->longitude;
	}
}

// Send back as JSON
$content = json_encode($items);
?>