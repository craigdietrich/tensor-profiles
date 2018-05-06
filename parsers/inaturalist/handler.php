<?php
if ($single) {
	// TODO
} else {
	$url = 'https://www.inaturalist.org/observations.dwc?q='.rawurlencode($query).'&page='.$page.'&per_page=50';
}

// Generic HTTPS handler
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
$content = curl_exec($ch);
curl_close($ch);
?>