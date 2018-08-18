"use strict";
window.addEventListener("load", function() {
	function shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			let temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	};
	setData([["House", ["1", "2", "3", "4", "5"]]].concat(
		shuffle([
			["Colour", shuffle(["Yellow", "Blue", "Red", "Ivory", "Green"])],
			["Nationality", shuffle(["Norwegian", "Ukranian", "Englishman", "Spaniard", "Japanese"])],
			["Drink", shuffle(["Water", "Tea", "Milk", "Orange Juice", "Coffee"])],
			["Smoke", shuffle(["Kools", "Chesterfields", "Old Gold", "Lucky Strike", "Parliaments"])],
			["Pet", shuffle(["Fox", "Horse", "Snails", "Dog", "Zebra"])]
		])
	).reduce((a, b) => {a[b[0]] = b[1];return a}, {}));
	setCell("Nationality", "Englishman", "Colour", "Red", 1, "The Englishman lives in the red house.");
	setCell("Nationality", "Spaniard", "Pet", "Dog", 1, "The Spaniard owns the dog.");
	setCell("Drink", "Coffee", "Colour", "Green", 1, "Coffee is drunk in the green house.");
	setCell("Nationality", "Ukranian", "Drink", "Tea", 1, "The Ukrainian drinks tea.");
	addRule("House", "Colour", "Green", "Right/Down Of", "Colour", "Ivory", "The green house is immediately to the right of the ivory house.");
	setCell("Smoke", "Old Gold", "Pet", "Snails", 1, "The Old Gold smoker owns snails.");
	setCell("Smoke", "Kools", "Colour", "Yellow", 1, "Kools are smoked in the yellow house.");
	setCell("Drink", "Milk", "House", "3", 1, "Milk is drunk in the middle house.");
	setCell("Nationality", "Norwegian", "House", "1", 1, "The Norwegian lives in the first house.");
	addRule("House", "Smoke", "Chesterfields", "Adjacent To", "Pet", "Fox", "The man who smokes Chesterfields lives in the house next to the man with the fox.");
	addRule("House", "Smoke", "Kools", "Adjacent To", "Pet", "Horse", "Kools are smoked in the house next to the house where the horse is kept.");
	setCell("Smoke", "Lucky Strike", "Drink", "Orange Juice", 1, "The Lucky Strike smoker drinks orange juice.");
	setCell("Nationality", "Japanese", "Smoke", "Parliaments", 1, "The Japanese smokes Parliaments.");
	addRule("House", "Nationality", "Norwegian", "Adjacent To", "Colour", "Blue", "The Norwegian lives next to the blue house.");
});
