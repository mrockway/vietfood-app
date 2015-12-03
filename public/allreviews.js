$(function () {
	//reviews part
	var baseUrl = "/api/reviews";
	var allReviews = [];
	var $reviewList = $("#review-list");
	var source3 = $("#review-template").html();
	var template3 = Handlebars.compile(source3);
	//helper function
	function render () {
		$reviewList.empty();
		var reviewHtml = template3 ({reviews: allReviews});
		$reviewList.append(reviewHtml);
	}

	$.get(baseUrl, function (data) {
		allReviews = data.reviews;
		allReviews.sort(function(a,b){
			//Date.parse convert string date to date number
			return Date.parse(b.dateVisited) - Date.parse(a.dateVisited);
		});
		render();
	});
});