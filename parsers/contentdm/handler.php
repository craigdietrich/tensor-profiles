<?php

// See http://www.finditillinois.org/wordpress/?page_id=38

// First, get the server number
$contents = file_get_contents($url);
$dom = new DOMDocument;
libxml_use_internal_errors(true);
$dom->loadHTML($contents);
$xpath = new DOMXPath($dom);
$nodes = $xpath->query("//a[@id='skip_nav']");  // This might be USC-specific?
$col_str = trim($nodes->item(0)->getAttribute('href'));
$server = substr($col_str, strpos($col_str,'p')+1);
$server = (int) substr($server, 0, strpos($server,'col'));

// Second, run API search
$api = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmQuery/all/title^'.rawurlencode($query).'^all^and/title!subjec!descri!thumb/nosort/100/1/0/0/0/0/xml';
$contents = file_get_contents($api);
$dom = new DOMDocument;
libxml_use_internal_errors(true);
$dom->loadXML($contents);
$elements = $dom->getElementsByTagName('record');
$records = array();
$count = 0;
foreach($elements as $node){
	$records[$count] = array();
	foreach($node->childNodes as $child) {
		$records[$count][$child->nodeName] = $child->nodeValue;
	}
	$count++;
}

// Finally, call each record individually
$return = array();
foreach ($records as $record) {
	$api = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmGetItemInfo'.$record['collection'].'/'.$record['pointer'].'/json';
	$contents = file_get_contents($api);
	$contents = json_decode($contents);
	$contents->server = $server;
	$contents->collection = $record['collection'];
	$contents->pointer = $record['pointer'];
	$return[] = $contents;
}

$content = json_encode($return);

?>