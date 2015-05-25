var testDatas = [
	"Map Pantone PMS Colors to HTML Codes.html",
	"Facebook.html"
]
// "오늘의유머 - [스압] 그냥 이게 뭔가 싶어서 어처구니 없는 움짤들.html",
// "오늘의유머 - 어벤저스 피규어.html",
// "오늘의유머 - 잠잤시유.html",
// "오늘의유머 - 초 고퀄 헤스티아 코스프레.html",

function init() {
	for(var i in testDatas) {
		var text = "<div class=\"menuItem\">"
		var name = testDatas[i]
		text += name+"</div>";

		$menuItem = $(text)
			.click(function(name) {
					return function() {loadHtml(name)};
				}(name)
			)
		$("#menuDiv").append($menuItem);
	}
}

function loadHtml(name) {
	console.log("./resource/"+name)
	$("#frameView").attr("src","./resource/"+name)
	/*
	$.ajax({ 
		url: "./resource/"+name, dataType: "html" 
	}).done(function( responseHtml ) {
		// console.log(responseHtml)

		x = responseHtml.split("src=\"").join("src=\"./resource/").split("show_ads.js").join("").split("href=\"").join("href=\"./resource/")
		// console.log(resHtml)
		$("#previewDiv")
						.html(x)
		// console.log($children)
		// for(var i in $children) {
		// 	console.log(i, $children[i])
		// }
	});
	*/
}

$(document).ready(init);