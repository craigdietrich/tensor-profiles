<?php

$url = 'http://www.metmuseum.org/api/collection/collectionlisting?q='.$query;

// Generic HTTP handler
session_start();
$opts = array('http' => array('header'=> 'Cookie: ' . @$_SERVER['HTTP_COOKIE']."\r\n"));
$context = stream_context_create($opts);
session_write_close();
$content = file_get_contents($url, false, $context);
?>