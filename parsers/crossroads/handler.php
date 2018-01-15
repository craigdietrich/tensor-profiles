<?php

if ($single) {
	$url = substr_replace($query, 'srv/', 27, 0) . '.json';
} else {
	if (empty($url)) return self::error('Invalid URL');
	preg_match_all('/\d+/', $url, $matches);
	$numbers = $matches[0];
	if (!isset($numbers[0])) return self::error('URL not formatted correctly');
	$project_num = (int) $numbers[0];
	$url = 'https://crossroads.oxy.edu/srv/projects/'.$project_num.'/resources.json?page=1&itemsPerPage=all&sortBy=sequence&sortOrder=asc';
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
$content = curl_exec($ch);
curl_close($ch);

if ($single) {
	$content = json_decode($content);
	$content = array('list' => array(0 => array('resource' => $content)));
	$content = json_encode($content);
}
?>