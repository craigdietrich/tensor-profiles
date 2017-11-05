<?php

if (empty($url)) return self::error('Invalid URL');

// TODO: https://stackoverflow.com/questions/26148701/file-get-contents-ssl-operation-failed-with-code-1-and-more

// The API url
if (substr($url, -1, 1) != '/') $url .= '/';
$api = $url.'api/';

// Get item or items
if ($single) {
	if (stristr($query, '://')) $query = substr($query, strrpos($query,'/')+1);
	$url = $api.'items/'.$query;
} else {
	$url = $api.'items?page='.$page.'&per_page=50';
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
$items = curl_exec($ch);
curl_close($ch);
$items = json_decode($items);

if (!is_array($items)) $items = array($items);

// If a query is present match items
if (!empty($query) && !$single) {
	for ($j = count($items)-1; $j >= 0; $j--) {
		$matched = false;
		for ($k = 0; $k < count($items[$j]->element_texts); $k++) {
			if (stristr($items[$j]->element_texts[$k]->text, $query)) {
				$matched = true;
				break;
			}
		}
		if (!$matched) {
			unset($items[$j]);		
		}
 	}
 	$items = array_values($items);
}

for ($j = 0; $j < count($items); $j++) {
	// Files
	$items[$j]->file_urls = array();
	$url = $items[$j]->files->url;
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

$content = json_encode($items);
?>