<?php
	header('Access-Control-Allow-Origin:*');

	$id = urldecode($_POST["id"]);
	$url = urldecode($_POST["url"]);
	$html = urldecode($_POST["html"]);
	$css = urldecode($_POST["css"]);

	echo $id;
	echo $url;
	// echo $html;
	echo $css;
?>