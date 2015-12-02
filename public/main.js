$(function() {
	var commonDishes = ["banh mi", "bun bo hue", "pho", "bun thit nuong", "bo luc lac", "cha gio", "goi cuon", "cafe sua da", "bun rieu", "che ba mau", "goi du du", "com tam bi suon cha", "hu tieu nam vang", "bo kho", "banh xeo"].sort();
	var dried_non_noddle = ["Bo Luc Lac", "Com Tam Bi Suon Cha"];
	var dried_noddle = ["Bun Thit Nuong"];
	var spicy_soup = ["Bun Bo Hue"];
	var non_spicy_soup = ["Pho", "Bun Rieu", "Hu Tieu Nam Vang", "Bo Kho"];
	var apertizer = ["Cha Gio", "Goi Cuon", "Goi Du Du" ];
	var non_apertizer = ["Banh Mi", "Banh Xeo"];
	var drink = ["Che Ba Mau", "Cafe Sua Da"];
	commonDishes.forEach(function (dish) {
		var capitalize = dish.replace(/^.|\s./g, function(x) {
			return x.toUpperCase();
		});
		$("#dropdown-list").append("<li><a href='#'>"+ capitalize +"</a></li>");
	});
	var createMap = function() {
    	map = new google.maps.Map(document.getElementById('map'), {
      	center: { lat: 37.78, lng: -122.44 },
      	zoom: 13
    	});
  	};
  //helper functions
	function restaurantsSellThisDish(dish, keyword) {
		$("#answerMe").hide();
		$("#map").show();
		$.get("/api/" + dish, function(data) {
			var restaurants = data.restaurants;
			var leftResult = restaurants.slice(0, 5);
			var rightResult = restaurants.slice(-5);
			$("#restaurantList").empty();
			var restaurantHtmlLeft = template2({
				lefts: leftResult
			});
			$("#restaurantList").append(restaurantHtmlLeft);
			var restaurantHtmlRight = template2({
				rights: rightResult
			});
			$("#restaurantList").append(restaurantHtmlRight);
			restaurants.forEach(function(restaurant) {
				var contentString = '<div id="content">' +
					'<div id="siteNo(tice">' +
					'</div>' +
					'<h4 id="firstHeading" class="firstHeading">' + restaurant.name + '</h4>' +
					'<div id="bodyContent">' +
					'<p>' + restaurant.location.display_address[0] +
					', ' + restaurant.location.display_address[1] +
					'<br>' + restaurant.location.display_address[2] + '</p>' +
					'</div>' +
					'</div>';
				var infowindow = new google.maps.InfoWindow({
					content: contentString
				});
				var latitude = restaurant.location.coordinate.latitude;
				var longitude = restaurant.location.coordinate.longitude;
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(latitude, longitude),
					map: map,
					title: restaurant.name,
					icon: 'restaurant.png'
				});
				marker.addListener("click", function() {
					infowindow.open(map, marker);
				});
			});
		});

		//get description of dish from manually built api then append to the page
		$.get("/api/description", function(data) {
			var dishes = data.dishes;
			var foundDish;
			dishes.forEach(function(dish) {
				if (dish.name.toLowerCase() == keyword) {
					foundDish = dish;
				}
			});
			$("#foodDescription").empty();
			var descriptionHtml = template1({
				dish: foundDish
			});
			$description.append(descriptionHtml);
		});
		createMap();
	}
  //for food description
  var $description = $("#foodDescription");
  var source1 = $("#description-template").html();
  var template1 = Handlebars.compile(source1);

  // for restaurants result
  var source2 = $("#restaurant-template").html();
  var template2 = Handlebars.compile(source2);

  function hidden() {
  	$("#map").hide();
 		$("#foodDescription").empty();
 		$("#restaurantList").empty();
  }

  //Top Dishes option trial
	$(".topOption").click(function() {
		$("#panel").slideToggle("slow");
		$("#lower").toggle();
	});
	$(".topOption2").click(function() {
		$('#picsHolder2').hide();
		$('#picsHolder1').show();
		$("#panel").slideToggle("slow");
		$("#lower").toggle();
	});

	$(".next").click(function(){
		$('#picsHolder1').hide();
		$('#picsHolder2').slideToggle("slow");
	});
	$(".back").click(function(){
		$('#picsHolder2').hide();
		$('#picsHolder1').slideToggle("slow");
	});

	$("#picsHolder1, #picsHolder2").on("click", "img", function(event) {
		event.preventDefault();
		hidden();
		var picsHolder = $(this).parent().parent().parent();
		var keyword = $(this).attr("id").replace(/_/g, " ");
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$("#result").show();
		picsHolder.toggle();
		$(".goBack").click(function () {
			picsHolder.show();
			hidden();
		});
	});

	//need to DELETE
 //  //Top Dishes Option chosen
 // 	$("#top").on("click", function (event) {
 // 		hidden();
 // 		$("#answerMe").hide();
 // 		$("#commonDishes").show();
	//   $(".dropdown-menu li").click(function (event) {
	//   	var keyword = $(this).text();
	//   	$("span[data-bind='label']").html(keyword);
	// 		keyword = keyword.toLowerCase();
	// 		var dish = keyword.replace(/\s/g, "");
	// 		restaurantsSellThisDish(dish, keyword);
	// 		$("#result").show();
	// 	});
	// });
	
	//helper function
	//generation random number from 0 to less than array.length
	function randomNum (array) {
		return Math.floor(Math.random() * array.length);
	}

	//helper function 
	//Random Options Chosen
	$("#random").click(function () {
		$("#answerMe").hide();
		$("#commonDishes").hide();
		$("#result").show();
		var random = randomNum(commonDishes);
		keyword = commonDishes[random];
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
	});

	//function helper 
	function questionMaker (question, answer1, answer2) {
		$("#question-holder").append("<div class='question'><h2>"+question+"</h2></div>");
		$(".question").append("<button type='button' class='btn btn-danger left'>"+ answer1 +"</button>")
			.append("<button type='button' class='btn btn-danger right'>"+ answer2 +"</button>");
	}

	//helper function 
	function guruChoice (message, category) {
		var random = randomNum(category);
		$("#question-holder").append("<h2>" + message +"<br>"+category[random]+"</h2>")
			.append("<button type='button' class='btn btn-danger find'>Find Restaurants</button>");
		keyword = category[random].toLowerCase();
		var dish = keyword.replace(/\s/g, "");
		$(".find").click(function () {
			restaurantsSellThisDish(dish, keyword);
			$("#result").show();
		});
	}
	//Favorite Options Chosen
	$("#favorite").click(function () {
		hidden();
		$("#question-holder").empty();
		$("#commonDishes").hide();
		$("#answerMe").show();
		$("#clickAnswer").on("click", function() {
			//clear all questions first
			$("#question-holder").empty();
			questionMaker("Are You Really Hungry?", "Yes", "No");
			$(".left").click(function() {
				$(this).parent().remove();
				questionMaker("Do You Like Soup or Non-Soup?", "Non-Soup", "Soup");
				$(".left").click(function() {
					$(this).parent().remove();
					questionMaker("Do You Like To Eat Noodle or Non-Noodle?", "Non-Noodle", "Noddle");
					//case 1
					$(".left").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", dried_non_noddle);
					});
					//case 2
					$(".right").click(function () {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", dried_noddle);
					});
				});
				$(".right").click(function() {
					$(this).parent().remove();
					questionMaker("Do You Like Spicy Soup or Non Spice Soup?", "Spicy", "Non-Spicy");
					//case 3
					$(".left").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", spicy_soup);
					});
					//case 4
					$(".right").click(function () {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", non_spicy_soup);
					});
				});
			});
			$(".right").click(function() {
				$(this).parent().remove();
				questionMaker("Do You Just Like Apertizer or Sandwich?", "Apertizer", "Sandwich");
				//case 5
				$(".left").click(function() {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", apertizer);
					guruChoice("Or If You Just Want A Drink, Try", drink);
				});
				//case 6
				$(".right").click(function () {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", non_apertizer);
					guruChoice("Or If You Just Want A Drink, Try", drink);
				});
			});
		});
	});
	
	//save name in of restaurant user chose to go in review database
	$("#restaurantList").on("click", ".btn", function (event) {
		event.preventDefault();
		var name = $(this).attr("id");
		console.log(name);
		var reviewNeedToBeWritten = {
			business: name, 
			thought: "Review for this visit has not been posted yet.",
			dateVisited: (new Date()).toDateString()
		};
		$.post("/api/reviews", reviewNeedToBeWritten, function (data) {
		});
	});
});