<?php

// This provided some help: http://www.finditillinois.org/wordpress/?page_id=38
// Regardless, this is a mess ~Craig

$results_per_page = 10;
$page_num = (($page-1) * $results_per_page) + 1;
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
$api = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmQuery/all/title^'.urlencode($query).'^all^and/title!subjec!descri!thumb/nosort/'.$results_per_page.'/'.$page_num.'/1/0/0/0/xml';
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
	$contents->thumb_str = 'http://'.$hostname.'/utils/getthumbnail/collection'.$record['collection'].'/id/'.$record['pointer'];
	$contents->is_compound = strpos($contents->find, ".cpd") ? true : false;
	if ($contents->is_compound) {
		$contents->source_str = 'http://'.$hostname.'/cdm/compoundobject/collection'.$record['collection'].'/id/'.$record['pointer'].'/rec/1';
		$ext = '';
		if (is_string($contents->find) && strrpos($contents->find, '.') && !stristr($contents->find, '.cpd')) {
			$ext = substr($contents->find, strrpos($contents->find, '.'));
		} elseif (is_string($contents->fullrs) && strrpos($contents->fullrs, '.')  && !stristr($contents->fullrs, '.cpd')) {
			$ext = substr($contents->fullrs, strrpos($contents->fullrs, '.'));
		}
		$contents->url_str = 'http://'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'].$ext;
	} else {
		$contents->source_str = 'http://'.$hostname.'/cdm/ref/collection'.$record['collection'].'/id/'.$record['pointer'];
		if (stristr($hostname, '.usc.edu') && stristr($contents->find, '.jp2')) {  // USC has a custom image endpoint
			$contents->url_str = 'http://lib-app.usc.edu/assetserver/controller/item/'.$contents->filena.'.jpg?v=1024';
		} elseif (stristr($contents->find, '.jp2')) {  // Get special fields from the item's page HTML to construct a JPEG URL from a JP2 URL
			$contents->url_str = null;
			$html = file_get_contents($contents->source_str);
			$dochtml = new DOMDocument();
			libxml_use_internal_errors(true);
			$dochtml->loadHTML($html);
			libxml_clear_errors();
			$elements = array('cdm_item_width','cdm_item_height','cdm_filesize','cdm_filename','cdm_itemmapsto');
			foreach ($elements as $el) {
				$elm = $dochtml->getElementById($el);
				$contents->$el = $elm->getAttribute('value');
			}
			if (empty($contents->cdm_filename)) $contents->url_str = '';  // Missing value
			if (null === $contents->url_str) {
				$contents->url_str = 'http://'.$hostname.'/utils/getdownloaditem/';
				$contents->url_str .= 'collection'.$contents->collection.'/';
				$contents->url_str .= 'id/'.$contents->dmrecord.'/';
				$contents->url_str .= 'type/singleitem/filename/'.$contents->cdm_filename.'/';
				$contents->url_str .= 'width/'.$contents->cdm_item_width.'/height/'.$contents->cdm_item_height.'/';
				$contents->url_str .= 'mapsto/'.$contents->cdm_itemmapsto.'/filesize/'.$contents->cdm_filesize.'/size/large';
				$ext = '';
				if (isset($contents->image) && is_string($contents->image) && strrpos($contents->image, '.')) {
					$ext = substr($contents->image, strrpos($contents->image, '.'));
				} elseif (isset($contents->find) && is_string($contents->find) && strrpos($contents->find, '.')) {
					$ext = substr($contents->find, strrpos($contents->find, '.'));
				}
				if ('.jp2' == $ext) $ext = '.jpg';
				$contents->url_str .= $ext;
			}
		} else {  // The 'getfile' endpoint
			$ext = '';
			if (is_string($contents->find) && strrpos($contents->find, '.') && !stristr($contents->find, '.cpd')) {
				$ext = substr($contents->find, strrpos($contents->find, '.'));
			} elseif (is_string($contents->fullrs) && strrpos($contents->fullrs, '.')) {
				$ext = substr($contents->fullrs, strrpos($contents->fullrs, '.'));
			}
			$contents->url_str = 'http://'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'].$ext;
		}
	}
	
	if ($contents->is_compound && empty($ext)) {
		// Don't add because compound objects can't be "viewed"
	} else {
		$return[] = clone $contents;
	}
	
	// Finally, get compound filenames
	if ($contents->is_compound) {
		$cpd = 'https://server'.$server.'.contentdm.oclc.org/dmwebservices/index.php?q=dmGetCompoundObjectInfo'.$record['collection'].'/'.$record['pointer'].'/json';
		$cpd_contents = file_get_contents($cpd);
		$cpd_contents = json_decode($cpd_contents);
		$page_num = 1;
		if (isset($cpd_contents->page)) {
			if (!is_array($cpd_contents->page)) $cpd_contents->page = array($cpd_contents->page);
			foreach ($cpd_contents->page as $page) {
				$contents->is_compound = false;
				$contents->title = $contents->orig_title.' - '.$page->pagetitle;
				$contents->filena = $page->pagefile;
				$contents->pointer = $page->pageptr;
				$contents->source_str = 'http://'.$hostname.'/cdm/ref/collection'.$record['collection'].'/id/'.$page->pageptr;
				$contents->thumb_str = 'http://'.$hostname.'/utils/getthumbnail/collection'.$record['collection'].'/id/'.$page->pageptr;
				if (stristr($hostname, '.usc.edu') && stristr($contents->filena, '.jp2')) {
					$contents->url_str = 'http://lib-app.usc.edu/assetserver/controller/item/'.$page->pagetitle.'.jpg?v=1024';
				} elseif (stristr($contents->filena, '.pdfpage')) {
					$contents->url_str = 'http://'.$hostname.'/utils/getfile/collection'.$record['collection'].'/id/'.$record['pointer'].'/filename/'.$page->pagefile.'/page/'.$page_num.'.pdf';
				} else {
					$contents->url_str = null;
					$html = file_get_contents($contents->source_str);
					$dochtml = new DOMDocument();
					libxml_use_internal_errors(true);
					$dochtml->loadHTML($html);
					libxml_clear_errors();
					$elements = array('cdm_item_width','cdm_item_height','cdm_filesize','cdm_filename','cdm_itemmapsto','cdm_cpdtype');
					foreach ($elements as $el) {
						$elm = $dochtml->getElementById($el);
						$contents->$el = strtolower($elm->getAttribute('value'));
					}
					if (empty($contents->cdm_filename)) $contents->url_str = '';  // Missing value
					if (null === $contents->url_str) {
						$contents->url_str = 'http://'.$hostname.'/utils/getdownloaditem/';
						$contents->url_str .= 'collection'.$contents->collection.'/';
						$contents->url_str .= 'id/'.$contents->dmrecord.'/type/compoundobject/';
						$contents->url_str .= 'show/'.$page->pageptr.'/cpdtype/'.$contents->cdm_cpdtype.'/';
						$contents->url_str .= 'filename/'.$contents->cdm_filename.'/';
						$contents->url_str .= 'width/'.$contents->cdm_item_width.'/height/'.$contents->cdm_item_height.'/';
						$contents->url_str .= 'mapsto/'.$contents->cdm_itemmapsto.'/filesize/'.$contents->cdm_filesize;
						$ext = '';
						if (strrpos($contents->cdm_filename, '.')) $ext = substr($contents->cdm_filename, strrpos($contents->cdm_filename, '.'));
						if ('.jp2' == $ext) $ext = '.jpg';
						$contents->url_str .= $ext;
					}
				}
				$return[] = clone $contents;
				$page_num++;
			}
		}
	}
}

$content = json_encode($return);

?>