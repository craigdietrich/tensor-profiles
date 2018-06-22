<?php

if (empty($url)) return self::error('Invalid URL');

// The API url
if (substr($url, -1, 1) != '/') $url .= '/';
$api = $url.'api/';

if ('_item_sets' == $query) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $api.'item_sets');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	$items = curl_exec($ch);
	curl_close($ch);
	$items = json_decode($items);
} elseif ($single) {
	// TODO
	// http://206.12.100.68/omeka-s/api/items/40
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $query);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	$item = curl_exec($ch);
	curl_close($ch);
	$item= json_decode($item);
	if (is_null($item)) {
		return self::error('There was something wrong with the individual item\'s URL.');
	}
	for ($k = 0; $k < count($item->{'o:media'}); $k++) {
		$media = $item->{'o:media'}[$k]->{'@id'};
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $media);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$media = curl_exec($ch);
		curl_close($ch);
		$item->media = json_decode($media);
	}
	$items = array($item);
	unset($item);
} else {
	// Look for special paraemters in the query string
	$query = trim($query);
	$item_set_id = 0;
	if (!empty($query)) {
		$arr = explode(' ', trim($query));
		if ('item_set_id:' == substr(end($arr), 0, 12)) {
			$item_set_id = array_pop($arr);
			$item_set_id = (int) substr($item_set_id, 12);
		}
		reset($arr);
		$query = implode(' ', $arr);
	}
	// Construct the search URL
	$items = $api.'items';
	$getvars = '';
	if (!empty($query)) $getvars .= 'search='.rawurlencode($query);
	if (!empty($item_set_id)) $getvars .= ((!empty($getvars))?'&':'').'item_set_id='.$item_set_id;
	$getvars .= ((!empty($getvars))?'&':'').'page='.$page;
	if (!empty($getvars)) $items .= '?'.$getvars;
	// Go get the items
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $items);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	$items = curl_exec($ch);
	curl_close($ch);
	$items = json_decode($items);
	if (is_null($items)) {
		return self::error('The archive URL provided is not a valid Omeka S root URL. Make sure that the URL points to the Omeka S root rather than a specific Omeka S "Site".');
	}
	$count = 0;
	$return = array();
	for ($j = 0; $j < count($items); $j++) {
		for ($k = 0; $k < count($items[$j]->{'o:media'}); $k++) {
			$return[$count] = $items[$j];
			$media = $items[$j]->{'o:media'}[$k]->{'@id'};
			// Go get the media
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $media);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
			$media = curl_exec($ch);
			curl_close($ch);
			$return[$count]->media = json_decode($media);
			$count++;
		}
	}
}

$content = json_encode($items);
?>