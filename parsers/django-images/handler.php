<?php
	
	$archive_url = $url;
	$url = $url.'/resources/images/';
	$search_url = $url . 'search/';
	$start = "<input type='hidden' name='csrfmiddlewaretoken' value='";
	$end = "' />";
	$cookie = tempnam("/tmp", 'djangoimagecookie');
	$return = array();
	
	// Load the search page with no query to gain a token
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_COOKIESESSION, true);
	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
	curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$content = curl_exec($ch);
	curl_close($ch);
	$content = substr($content, (strpos($content, $start) + strlen($start)));
	$token = substr($content, 0, strpos($content, $end));
	
	// Run the query with the token
	$post = 'csrfmiddlewaretoken='.$token.'&q='.rawurlencode($query).'&time_start=&time_end=&checkbox4=Manuscripts&checkbox3=Places&checkbox2=Slaves&checkbox1=Vessels';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
	curl_setopt($ch, CURLOPT_COOKIESESSION, true);
	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
	curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
	curl_setopt($ch, CURLOPT_URL, $search_url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
	$content = curl_exec($ch);
	
	// Get basic info from the query
	$doc = new DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTML($content);
	$xpath = new DOMXPath($doc);
	$nlist = $xpath->query("//td[@class='gallery-image']");
	foreach ($nlist as $node) {
		foreach ($node->childNodes as $child) {
			if ('a' == $child->nodeName) {
				$href = trim($archive_url.$child->getAttribute('href'));
				$return[$href] = array();
				$return[$href]['thumbnail'] = $archive_url.$child->getElementsByTagName('img')->item(0)->getAttribute('src');
			} elseif ('div' == $child->nodeName) {
				foreach ($child->getElementsByTagName('div') as $div) {
					if ('gallery-image-label' == $div->getAttribute('class')) $return[$href]['label'] = trim($div->nodeValue);
					if ('gallery-image-description' == $div->getAttribute('class')) $return[$href]['description'] = trim($div->nodeValue);
				}
			}
		}
	}
	
	// Load the individual page for each item in the search results
	foreach ($return as $sub_url => $arr) {
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_COOKIESESSION, true);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
		curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
		curl_setopt($ch, CURLOPT_URL, $sub_url);
		$sub_content = curl_exec($ch);
		// Get advanced info from the individual page
		$doc = new DOMDocument();
		libxml_use_internal_errors(true);
		$doc->loadHTML($sub_content);
		$xpath = new DOMXPath($doc);
		$nlist = $xpath->query("//td[@class='image-detail-link']");
		$return[$sub_url]['thumbnail'] = $archive_url.$nlist->item(0)->getElementsByTagName('img')->item(0)->getAttribute('src');
		$return[$sub_url]['url'] = $archive_url.$nlist->item(0)->getElementsByTagName('img')->item(0)->getAttribute('src');  // Get the actual high-res URL later
		$xpath = new DOMXPath($doc);
		$nlist = $xpath->query("//div[@class='image-description']");
		$return[$sub_url]['description'] = trim($nlist->item(0)->nodeValue);
		$xpath = new DOMXPath($doc);
		$nlist = $xpath->query("//table[@class='image-detail-info']/tbody/tr");
		foreach ($nlist as $node) {
			$field = strtolower(str_replace(':','',trim($node->getElementsByTagName('div')->item(0)->nodeValue)));
			$value = trim($node->getElementsByTagName('td')->item(1)->nodeValue);
			$return[$sub_url][$field] = $value;
		}
		// Get the detail, which has the highres image
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_COOKIESESSION, true);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
		curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
		curl_setopt($ch, CURLOPT_URL, $sub_url.'/detail');
		$detail_content = curl_exec($ch);
		$doc = new DOMDocument();
		libxml_use_internal_errors(true);
		$doc->loadHTML($detail_content);
		$xpath = new DOMXPath($doc);
		$image = $archive_url.$xpath->query("//img")->item(0)->getAttribute('src');
		$return[$sub_url]['url'] = $image;
	}
	
	curl_close($ch);
	unlink($cookie);
	
	$content = json_encode($return);
	
?>