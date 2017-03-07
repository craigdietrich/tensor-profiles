<?php

require_once(dirname(__FILE__).'/config.php');
require_once(dirname(__FILE__).'/vimeo/autoload.php');
$lib = new \Vimeo\Vimeo($client_id, $client_secret);
$token = $lib->clientCredentials();
$access_token = (isset($token['body']['access_token'])) ? $token['body']['access_token'] : null;
//echo '$access_token: '.$access_token."\n";
//echo 'query: '.$query."\n";
//echo 'page: '.$page."\n";

$lib->setToken($access_token);
$response = $lib->request('/videos', array(
										'page' => $page,
										'per_page' => 50,
										'query' => $query,
										'sort' => 'relevant'
									 ), 'GET');
$content = json_encode($response);
?>