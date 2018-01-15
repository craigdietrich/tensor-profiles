<?php

// See http://www.finditillinois.org/wordpress/?page_id=38
$results_per_page = 10;
$scheme = parse_url($url, PHP_URL_SCHEME);
$hostname = parse_url($url, PHP_URL_HOST);

// First, get the server number
$diagnostics = $scheme.'://'.$hostname.'/utils/diagnostics';
$contents = file_get_contents($diagnostics);
if (!strstr($contents, 'Website is configured to access server at')) {
	http_response_code(404);
	echo 'The URL to this contentDM site is not the correct URL to access the site\'s API.';
	exit;
}
$server = strstr($contents, '//server');
$server = str_replace('//server', '', $server);
$server = (int) substr($server, 0, strpos($server, '.contentdm'));
if ($server <= 0) {
	http_response_code(404);
	echo 'Could not determine the server number fo this contentDM site or the API for the site is\'t activated.';
	exit;
}

// Second, run API search
$api = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmQuery/all/title^'.urlencode($query).'^all^and/title!subjec!descri!thumb/nosort/'.$results_per_page.'/'.$page.'/1/0/0/0/xml';
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

// Third, call each record individually
$return = array();
foreach ($records as $record) {
	$api = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmGetItemInfo'.$record['collection'].'/'.$record['pointer'].'/json';
	$contents = file_get_contents($api);
	$contents = json_decode($contents);
	$contents->orig_title = $contents->title;
	$contents->server = $server;
	$contents->collection = $record['collection'];
	$contents->pointer = $record['pointer'];
	$contents->thumb_str = '//'.$hostname.'/utils/getthumbnail/collection'.$record['collection'].'/id/'.$record['pointer'];
	$contents->is_compound = strpos($contents->find, ".cpd") ? true : false;
	if ($contents->is_compound) {
		$contents->source_str = '//'.$hostname.'/cdm/compoundobject/collection'.$record['collection'].'/id/'.$record['pointer'].'/rec/1';
		$contents->url_str = 'http://'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'];
	} else {
		$contents->source_str = '//'.$hostname.'/cdm/ref/collection'.$record['collection'].'/id/'.$record['pointer'];
		if (stristr($hostname, '.usc.edu') && stristr($contents->find, '.jp2')) {
			$contents->url_str = '//lib-app.usc.edu/assetserver/controller/item/'.$contents->filena.'.jpg?v=1024';
		} elseif (stristr($contents->find, '.jp2')) {
			$contents->url_str = 'CONTENTDM IMAGE URL';
		} else {
			$contents->url_str = '//'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'];
		}
	}
	$return[] = clone $contents;
	// Finally, get compound filenames
	if ($contents->is_compound) {
		$cpd = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmGetCompoundObjectInfo'.$record['collection'].'/'.$record['pointer'].'/json';
		$cpd_contents = file_get_contents($cpd);
		$cpd_contents = json_decode($cpd_contents);
		$page_num = 1;
		foreach ($cpd_contents->page as $page) {
			$contents->is_compound = false;
			$contents->title = $contents->orig_title.' - '.$page->pagetitle;
			$contents->filena = $page->pagefile;
			$contents->pointer = $page->pageptr;
			$contents->source_str = '//'.$hostname.'/cdm/ref/collection'.$record['collection'].'/id/'.$page->pageptr;
			$contents->thumb_str = '//'.$hostname.'/utils/getthumbnail/collection'.$record['collection'].'/id/'.$page->pageptr;
			if (stristr($hostname, '.usc.edu') && stristr($contents->filena, '.jp2')) {
				$contents->url_str = '//lib-app.usc.edu/assetserver/controller/item/'.$page->pagetitle.'.jpg?v=1024';
			} elseif (stristr($contents->filena, '.jp2')) {
				$contents->url_str = 'CONTENTDM IMAGE URL';
			} elseif (stristr($contents->filena, '.pdfpage')) {
				$contents->url_str = '//'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'].'/filename/'.$page->pagefile.'/page/'.$page_num;
			} else {
				$contents->url_str = '//'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'].'/filename/'.$page->pagefile.'/page/'.$page_num;
			}
			$return[] = clone $contents;
			$page_num++;
		}
	}
}

$content = json_encode($return);

?>