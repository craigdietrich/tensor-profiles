<?php

if ($single) {
	$url = $query;
	$myvars = '';
} else {
	$url = $url.'/4DACTION/HANDLECGI/CTN3?display=POR';
	$myvars = 'SearchType=all&WholeWord=0&RefineSearch=NewSelection&theKW='.rawurlencode($query);
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $myvars);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$content = curl_exec($ch);

?>