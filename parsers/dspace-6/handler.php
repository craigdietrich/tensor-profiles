<?php

if (empty($url)) return self::error('Invalid URL');

if ($single) {
	// TODO
} else {
	$limit = 50;
	$get_str = '?offset='.(($page-1) * $limit).'&limit='.$limit;
	if (substr($url, -1, 1) != '/') $url.= '/';
	// Validate URL
	$api_url = false;
	$dspace_frontends = array(null, 'jspui/', 'xmlui/');
	foreach ($dspace_frontends as $frontend) {
		$test_url = $url;
		if (null != $frontend) $test_url = str_replace($frontend, '', $test_url);
		$test =@ file_get_contents($test_url.'rest/test');
		if ('REST api is running.' == $test) {
			$api_url = $test_url;
			break;
		}
	}
	if (!$api_url) return self::error('The archive URL isn\'t a valid DSpace 6 archive or its REST API isn\'t enabled.');
	// User is asking for all items
	if (empty($query)) {
		$items_url = $api_url.'rest/items'.$get_str;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $items_url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$items = curl_exec($ch);;
		curl_close($ch);
	// User is searching for items
	} else {
		$items_url = $api_url.'rest/items/find-by-metadata-field';
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $items_url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/json',
				'Content-Length: '.strlen('{"key": "dc.title","value": "'.str_replace('"','\"',$query).'","language": "en_US"}')
		));
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, '{"key": "dc.title","value": "'.str_replace('"','\"',$query).'","language": "en_US"}');
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$items = curl_exec($ch);
		curl_close($ch);
	}
	$items = json_decode($items);
	if (is_null($items)) {
		return self::error('Nothing was returned.');
	}
	for ($j = 0; $j < count($items); $j++) {
		// Metadata
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, rtrim($api_url,'/').$items[$j]->link.'/metadata');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$headers = ['Accept: application/json'];
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_POST, false);
		$metadata = curl_exec($ch);
		curl_close($ch);
		$items[$j]->metadata = json_decode($metadata);
		// Bitstreams
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, rtrim($api_url,'/').$items[$j]->link.'/bitstreams');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$headers = ['Accept: application/json'];
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_POST, false);
		$bitstreams = curl_exec($ch);
		curl_close($ch);
		$items[$j]->bitstreams = json_decode($bitstreams);
	}
}

$content = json_encode($items);
?>