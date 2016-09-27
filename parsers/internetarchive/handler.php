<?php

$url = 'http://archive.org/advancedsearch.php?q='.$query.'&fl[]=avg_rating&fl[]=call_number&fl[]=collection&fl[]=contributor&fl[]=coverage&fl[]=creator&fl[]=date&fl[]=description&fl[]=downloads&fl[]=foldoutcount&fl[]=format&fl[]=headerImage&fl[]=identifier&fl[]=imagecount&fl[]=language&fl[]=licenseurl&fl[]=mediatype&fl[]=month&fl[]=num_reviews&fl[]=oai_updatedate&fl[]=publicdate&fl[]=publisher&fl[]=rights&fl[]=scanningcentre&fl[]=source&fl[]=subject&fl[]=title&fl[]=type&fl[]=volume&fl[]=week&fl[]=year&sort[]=&sort[]=&sort[]=&rows=50&page='.$page.'&callback=callback&output=xml#raw';

// Generic HTTP handler
session_start();
$opts = array('http' => array('header'=> 'Cookie: ' . @$_SERVER['HTTP_COOKIE']."\r\n"));
$context = stream_context_create($opts);
session_write_close();
$content = file_get_contents($url, false, $context);
?>