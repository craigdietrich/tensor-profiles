<?php
if ($single) {
	// TODO
} else {
	$media_type = 'all';
	if (stristr($query, 'audio')) {
		$media_type = 'a';
		$query = str_replace('audio', '', $query);
	} elseif (stristr($query, 'video')) {
		$media_type = 'v';
		$query = str_replace('video', '', $query);
	}
	$count = 50;
	$start = ($page-1) * 50;
	$url = 'https://ebird.org/media/catalog.json?searchField=species&q='.rawurlencode($query).'&taxonCode=&hotspotCode=&regionCode=&customRegionCode=&userId=&_mediaType=on&mediaType='.$media_type.'&species=&region=&hotspot=&customRegion=&mr=M1TO12&bmo=1&emo=12&yr=YALL&by=1900&ey=2018&user=&view=Gallery&sort=upload_date_desc&_tag=on&_tag=on&_req=on&subId=&catId=&_spec=on&specId=&dsu=-1&count='.$count.'&start='.$start;
	// https://ebird.org/media/catalog.json?searchField=species&q=&taxonCode=&hotspotCode=&regionCode=&customRegionCode=&userId=&_mediaType=on&mediaType=v&species=&region=&hotspot=&customRegion=&mr=M1TO12&bmo=1&emo=12&yr=YALL&by=1900&ey=2018&user=&view=Gallery&sort=upload_date_desc&_tag=on&_tag=on&_req=on&subId=&catId=&_spec=on&specId=&dsu=-1&start=0&_=1525726278306
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