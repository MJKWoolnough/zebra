// https://www.brainzilla.com/logic/zebra/travel-agency/
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
	setData([["Woman", ["1", "2", "3", "4", "5"]]].concat(
		shuffle([
			["Purse", shuffle(["Red", "White", "Green", "Blue", "Yellow"])],
			["Name", shuffle(["Lara", "Jessis", "Rose", "Ana", "Glenda"])],
			["Age", shuffle(["30 years", "26 years", "24 years", "28 years", "32 years"])],
			["Profession", shuffle(["Judge", "Hostess", "Singer", "Nurse", "Biologist"])],
			["Country", shuffle(["Peru", "China", "Mexico", "Italy", "Egypt"])],
			["Duration", shuffle(["25 days", "15 days", "20 days", "5 days", "10 days"])]
		])
	).reduce((a, b) => {a[b[0]] = b[1];return a}, {}));
	setCell("Profession", "Singer", "Woman", "3", 1, "The Singer is at the third position.");
	addRule("Woman", "Duration", "20 days", "After", "Country", "Peru", "The woman traveling for 20 days is somewhere between the woman who is going to Peru and the owner of the Blue purse, in that order.");
	addRule("Woman", "Duration", "20 days", "Before", "Purse", "Blue", "The woman traveling for 20 days is somewhere between the woman who is going to Peru and the owner of the Blue purse, in that order.");
	addRule("Woman", "Name", "Ana", "Left/Up Of", "Profession", "Biologist", "Ana is exactly to the left of the Biologist.");
	setCell("Age", "32 years", "Country", "Egypt", 1, "The 32 years old is going to see the Sahara.");
	addRule("Woman", "Purse", "White", "Right/Down Of", "Country", "Peru", "The owner of the White purse is exactly to the right of the woman traveling to visit Machu Picchu.");
	addRule("Woman", "Name", "Glenda", "After", "Purse", "Green", "Glenda is somewhere to the right of the woman who has the Green purse.");
	addRule("Woman", "Purse", "White", "After", "Age", "30 years", "The person wearing the White purse is somewhere between the 30 years old woman and the owner of the Blue purse, in that order.");
	addRule("Woman", "Purse", "White", "Before", "Purse", "Blue", "The person wearing the White purse is somewhere between the 30 years old woman and the owner of the Blue purse, in that order.");
	setCell("Age", "24 years", "Country", "Mexico", 1, "The 24 years old woman is going to visit an Aztec pyramid.");
	addRule("Woman", "Purse", "White", "Before", "Age", "24 years", "The woman wearing the White purse is somewhere to the left of the yougest woman.");
	addRule("Woman", "Country", "Italy", "Right/Down Of", "Duration", "20 days", "The traveler going to Italy is exactly to the right of the woman traveling for 20 days.");
	setCell("Duration", "25 days", "Purse", "Red", 1, "The person who is going to travel for 25 days has the Red purse.");
	setCell("Profession", "Judge", "Woman", "1", 1, "The Judge is in the first position.");
	addRule("Woman", "Profession", "Nurse", "Right/Down Of", "Duration", "20 days", "The Nurse is exactly to the right of the woman who is going to travel for 20 days.");
	addRule("Woman", "Profession", "Hostess", "After", "Name", "Lara", "The Hostess is somewhere between Lara and the woman who has the Blue purse, in that order.");
	addRule("Woman", "Profession", "Hostess", "Before", "Purse", "Blue", "The Hostess is somewhere between Lara and the woman who has the Blue purse, in that order.");
	setCell("Woman", "2", "Duration", "15 days", 1, "In the second position is the woman that is going to travel for 15 days.");
	setCell("Name", "Rose", "Purse", "Green", 1, "Rose has the Green purse.");
	addRule("Woman", "Duration", "5 days", "Left/Up Of", "Age", "32 years", "The woman who is traveling for less than a week is exactly to the left of the 32 years old woman.");
	setCell("Duration", "5 days", "Age", "28 years", 1, "The person traveling for 5 days is 28.");
	addRule("Woman", "Purse", "Blue", "After", "Age", "30 years", "The Blue purse owner is somewhere between the 30 years old woman and the owner of the Yellow purse, in that order.");
	addRule("Woman", "Purse", "Blue", "Before", "Purse", "Yellow", "The Blue purse owner is somewhere between the 30 years old woman and the owner of the Yellow purse, in that order.");
});
