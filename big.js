// http://www.mensus.net/brain/logic.shtml?code=FFFC3E.13C28A53
"use strict";
window.addEventListener("load", function() {
	function shuffle(arr) {
		for (var i = arr.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1)),
			    temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	};
	setData([["House", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]]].concat(
		shuffle([
			["Car", shuffle(["Renault", "Ferrari", "Volvo", "BMW", "Mercedes", "Porsche", "Rolls Royce", "Ford", "Toyota", "VW"])],
			["Colour", shuffle(["Green", "Red", "Yellow", "Brown", "Magenta", "Pink", "Grey", "Black", "White", "Blue"])],
			["Drink", shuffle(["Wine", "Tea", "Lemonade", "Espresso", "Beer", "Milk", "Water", "Icetea", "Coffee", "Soda"])],
			["Flowers", shuffle(["Daffodils", "Lilies", "Dahlias", "Cactuses", "Roses", "Geraniums", "Hyacinth", "Crocuses", "Orchids", "Tulips"])],
			["Food", shuffle(["Chocolate", "Steaks", "Waffles", "Spaghetti", "Pancakes", "Eggs", "Potatoes", "Ice Cream", "Cookies", "Cheese"])],
			["Nationality", shuffle(["Italian", "Irish", "German", "Greek", "Spanish", "British", "Swiss", "Swede", "Norwegian", "Danish"])],
			["Pet", shuffle(["Tortoise", "Horse", "Butterfly", "Bird", "Mouse", "Turtle", "Snake", "Dog", "Cat", "Fish"])],
			["Smokes", shuffle(["Kools", "Pipe", "Prince", "Marlboro", "Pall Mall", "Blend", "Chesterfields", "Bluemaster", "Dunhill", "Cubans"])],
			["Sport", shuffle(["Tennis", "Baseball", "Lacrosse", "Badminton", "Ice Hockey", "Football", "Basketball", "Rugby", "Soccer", "Volleyball"])],
			["Trees", shuffle(["Birch Trees", "Maple Trees", "Willows", "Redwoods", "Eucalyptus Trees", "Pines", "Oaks", "Firs", "Nut Trees", "Palm Trees"])]
		])
	).reduce((a, b) => {a[b[0]] = b[1];return a}, {}));
	setCell("House", "10", "Sport", "Volleyball", 1, "The person in house ten plays Volleyball.");
	setCell("Pet", "Fish", "Smokes", "Cubans", 1, "The person with the fish smokes Cubans.");
	addRule("House", "Nationality", "Swiss", "Left/Up Of", "Smokes", "Bluemaster", "The Swiss lives directly to the left of the Bluemaster smoking person.");
	addRule("House", "Trees", "Oaks", "Adjacent To", "Colour", "Pink", "The oaks grow directly next to the pink house.");
	addRule("House", "Pet", "Tortoise", "Adjacent To", "Colour", "Red", "The tortoises live directly next to the red house.");
	setCell("Car", "Ford", "House", "8", 1, "The Ford is parked in front of house eight.");
	addRule("House", "Pet", "Bird", "Left/Up Of", "Sport", "Ice Hockey", "The birds live directly to the left of the Ice Hockey player.");
	addRule("House", "Drink", "Lemonade", "Left/Up Of", "Colour", "Brown", "The person drinking lemonade lives directly to the left of the brown house.");
	addRule("House", "Trees", "Maple Trees", "Right/Down Of", "Flowers", "Daffodils", "The maple trees grow directly to the right of the daffodils.");
	addRule("House", "Nationality", "German", "Right/Down Of", "Car", "Ferrari", "The German lives directly to the right of the driver of the Ferrari.");
	addRule("House", "Flowers", "Lilies", "Adjacent To", "Car", "Renault", "The lilies grow directly next to the Renault.");
	addRule("House", "Car", "Volvo", "Right/Down Of", "Sport", "Baseball", "The Volvo driver lives directly to the right of Baseball player.");
	addRule("House", "Nationality", "Spanish", "After", "Sport", "Tennis", "The Spanish lives to the right of the Tennis player.");
	setCell("Sport", "Badminton", "Food", "Spaghetti", 1, "The person playing Badminton eats spaghetties.");
	setCell("Pet", "Bird", "Smokes", "Marlboro", 1, "The person with the birds smokes Marlboro");
	addRule("House", "Trees", "Nut Trees", "Adjacent To", "Drink", "Icetea", "The nut trees grow directly next to the person drinking icetea.");
	setCell("Pet", "Fish", "House", "10", 1, "The fish live in house ten.");
	addRule("House", "Trees", "Firs", "Left/Up Of", "Pet", "Cat", "The firs grow directly to the left of the cats.");
	setCell("Nationality", "Norwegian", "House", "5", -1, "The Norwegian does not live in house five.");
	addRule("House", "Pet", "Snake", "After", "Pet", "Butterfly", "The snakes live to the right of the butterflies.");
	setCell("Trees", "Redwoods", "House", "4", 1, "The redwoods grow in front of house four.");
	addRule("House", "Flowers", "Orchids", "Right/Down Of", "Food", "Ice Cream", "The orchids grow directly to the right of the person eating ice cream.");
	addRule("House", "Trees", "Willows", "Right/Down Of", "Colour", "Red", "The willows grow directly to the right of the red house.");
	addRule("House", "Drink", "Icetea", "Left/Up Of", "Colour", "White", "The person drinking icetea lives directly to the left of the white house.");
	setCell("Nationality", "British", "Drink", "Milk", 1, "The British drinks milk.");
	addRule("House", "Trees", "Eucalyptus Trees", "Right/Down Of", "Pet", "Bird", "The eucalyptus trees grow directly to the right of the birds.");
	setCell("House", "3", "Smokes", "Prince", 1, "The person in house three smokes Prince.");
	setCell("Car", "Mercedes", "House", "5", 1, "The Mercedes is parked in front of house five.");
	setCell("Food", "Cookies", "Drink", "Coffee", 1, "The person eating cookies drinks coffee.");
	addRule("House", "Drink", "Milk", "Right/Down Of", "Colour", "Magenta", "The person drinking milk lives directly to the right of the magenta house.");
	setCell("Smokes", "Blend", "Food", "Eggs", 1, "The person smoking Blend eats eggs.");
	setCell("House", "5", "Drink", "Beer", 1, "The person in house five drinks beer.");
	setCell("Car", "Rolls Royce", "Colour", "Grey", 1, "The person driving the Rolls Royce lives in the gray house.");
	addRule("House", "Flowers", "Tulips", "Right/Down Of", "Drink", "Coffee", "The tulips grow directly to the right of the person drinking coffee.");
	addRule("House", "Smokes", "Dunhill", "Right/Down Of", "Drink", "Icetea", "The person smoking Dunhill lives directly to the right of the person drinking icetea.");
	addRule("House", "Nationality", "British", "Right/Down Of", "Car", "Mercedes", "The British lives directly to the right of the driver of the Mercedes.");
	setCell("Flowers", "Hyacinth", "Drink", "Water", 1, "The person liking the hyacinth drinks water.");
	addRule("House", "Sport", "Basketball", "Left/Up Of", "Colour", "Black", "The person playing Basketball lives directly to the left of the black house.");
	addRule("House", "Nationality", "Irish", "Adjacent To", "Drink", "Wine", "The Irish lives directly next to the wine drinking person.");
	addRule("House", "Flowers", "Hyacinth", "Adjacent To", "Pet", "Turtle", "The hyacinth grow directly next to the turtles.");
	addRule("House", "Flowers", "Geraniums", "Right/Down Of", "Drink", "Beer", "The geraniums grow directly to the right of the person drinking beer.");
	setCell("Flowers", "Crocuses", "House", "8", 1, "The crocuses grow in front of house eight.");
	setCell("Flowers", "Dahlias", "Car", "Volvo", 1, "The person liking the dahlias drives a Volvo.");
	setCell("House", "3", "Sport", "Lacrosse", 1, "The person in house three plays Lacrosse.");
	addRule("House", "Pet", "Horse", "Right/Down Of", "Pet", "Tortoise", "The horses live directly to the right of the tortoises.");
	setCell("Nationality", "German", "Food", "Waffles", 1, "The German eats waffles.");
	addRule("House", "Nationality", "Norwegian", "After", "Car", "BMW", "The Norwegian lives to the right of the driver of the BMW.");
	addRule("House", "Food", "Potatoes", "Adjacent To", "Colour", "Black", "The person eating potatoes lives directly next to the black house.");
	addRule("House", "Flowers", "Lilies", "Adjacent To", "Food", "Chocolate", "The lilies grow directly next to the person eating chocolate.");
	setCell("Flowers", "Tulips", "House", "9", -1, "The tulips do not grow in front of house nine.");
	addRule("House", "Flowers", "Cactuses", "Right/Down Of", "Smokes", "Prince", "The cactuses grow directly to the right of the person smoking Prince.");
	addRule("House", "Sport", "Soccer", "Left/Up Of", "Colour", "Blue", "The person playing Soccer lives directly to the left of the blue house.");
	addRule("House", "Pet", "Dog", "Adjacent To", "Drink", "Coffee", "The dogs live directly next to the person drinking coffee.");
	addRule("House", "Nationality", "British", "Right/Down Of", "Pet", "Mouse", "The British lives directly to the right of the mice.");
	setCell("Pet", "Cat", "House", "9", 1, "The cats live in house nine.");
	setCell("Nationality", "Swede", "Sport", "Rugby", 1, "The Swede plays Rugby.");
	addRule("House", "Smokes", "Dunhill", "Before", "Drink", "Soda", "The person smoking Dunhill lives to the left of the person drinking soda.");
	addRule("House", "Nationality", "Danish", "Adjacent To", "Trees", "Nut Trees", "The Danish lives directly next to the nut trees.");
	addRule("House", "Trees", "Maple Trees", "Left/Up Of", "Colour", "Yellow", "The maple trees grow directly to the left of the yellow house.");
	addRule("House", "Car", "Porsche", "Left/Up Of", "Sport", "Basketball", "The Porsche driver lives directly to the left of Basketball player.");
	setCell("Pet", "Tortoise", "House", "7", -1, "The tortoises do not live in house seven.");
	addRule("House", "Smokes", "Kools", "Adjacent To", "Food", "Steaks", "The person smoking Kools lives directly next to the person eating steaks.");
	setCell("House", "1", "Smokes", "Kools", 1, "The person in house one smokes Kools.");
	addRule("House", "Pet", "Cat", "Left/Up Of", "Car", "VW", "The cats live directly to the left of the VW.");
	setCell("Flowers", "Geraniums", "Smokes", "Blend", 1, "The person liking the geraniums smokes Blend.");
	addRule("House", "Nationality", "Swiss", "Right/Down Of", "Trees", "Pines", "The Swiss lives directly to the right of the pines.");
	addRule("House", "Sport", "Badminton", "Right/Down Of", "Sport", "Lacrosse", "The Badminton player lives directly to the right of the Lacrosse player.");
	addRule("House", "Trees", "Birch Trees", "Before", "Car", "Mercedes", "The birch trees grow to the left of the Mercedes driver.");
	addRule("House", "Nationality", "German", "Before", "Colour", "Black", "The German lives to the left of the black house.");
	addRule("House", "Nationality", "Irish", "Left/Up Of", "Flowers", "Dahlias", "The Irish lives directly to the left of the dahlias.");
	setCell("Flowers", "Cactuses", "Car", "BMW", 1, "The person liking the cactuses drives a BMW.");
	setCell("Car", "Porsche", "House", "6", 1, "The Porsche is parked in front of house six.");
	addRule("House", "Smokes", "Pipe", "Adjacent To", "Drink", "Wine", "The person smoking pipe lives directly next to the person drinking wine.");
	addRule("House", "Food", "Pancakes", "Adjacent To", "Drink", "Espresso", "The person eating pancakes lives directly next to the person drinking espresso.");
	addRule("House", "Nationality", "Greek", "Adjacent To", "Smokes", "Prince", "The Greek lives directly next to the Prince smoking person.");
	addRule("House", "Sport", "Rugby", "Adjacent To", "Colour", "White", "The person playing Rugby lives directly next to the white house.");
	setCell("House", "10", "Food", "Cheese", 1, "The person in house ten eats cheese.");
	addRule("House", "Pet", "Bird", "Left/Up Of", "Smokes", "Pall Mall", "The birds live directly to the left of the person smoking Pall Mall.");
});
