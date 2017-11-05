<?php
if ($single) {
	$contents = file_get_contents($query);
	$dom = new DOMDocument;
	libxml_use_internal_errors(true);
	$dom->loadHTML($contents);
	$xpath = new DOMXPath($dom);
	$nodes = $xpath->query("//*[contains(@class, 'collection-details__tombstone--value')]");
	$accession = trim($nodes->item(6)->nodeValue);
	$url = 'http://www.metmuseum.org/api/collection/collectionlisting?q='.$accession;
} else {
	$url = 'http://www.metmuseum.org/api/collection/collectionlisting?q='.$query;
}

// Generic HTTP handler
session_start();
$opts = array('http' => array('header'=> 'Cookie: ' . @$_SERVER['HTTP_COOKIE']."\r\n"));
$context = stream_context_create($opts);
session_write_close();
$content = file_get_contents($url, false, $context);
?>