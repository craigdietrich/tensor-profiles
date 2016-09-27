<?php

if (empty($url)) return self::error('Could not find the Scalar book');
if ('/' != substr($url, -1, 1)) $url .= '/';
$url .= 'rdf/instancesof/media?format=json&sq='.$query;

// Generic HTTP handler
session_start();
$opts = array('http' => array('header'=> 'Cookie: ' . @$_SERVER['HTTP_COOKIE']."\r\n"));
$context = stream_context_create($opts);
session_write_close();
$content = file_get_contents($url, false, $context);
?>