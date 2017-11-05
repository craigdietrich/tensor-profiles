<?php
require_once(dirname(__FILE__).'/config.php');
require_once(dirname(__FILE__).'/vimeo/autoload.php');
$lib = new \Vimeo\Vimeo($client_id, $client_secret);
$token = $lib->clientCredentials();
$access_token = (isset($token['body']['access_token'])) ? $token['body']['access_token'] : null;
$lib->setToken($access_token);
if ($single) {
	if (stristr($query, '://')) $query = substr($query, strrpos($query,'/')+1);
	$single = $lib->request('/videos/'.$query, array(), 'GET');
	$response = array();
	$response['body'] = array();
	$response['body']['data'] = array();
	$response['body']['data'][] = $single['body'];
} else {
	$response = $lib->request('/videos', array(
											'page' => $page,
											'per_page' => 50,
											'query' => $query,
											'sort' => 'relevant'
										 ), 'GET');
}
$content = json_encode($response);
?>