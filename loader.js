"use strict";
function setData(data) {
	var firstKey = Object.keys(data)[0];
	if (!Object.keys(data).slice(1).every(key => data[key].length == data[firstKey].length)) {
		return;
	}
	var butts = Array.prototype.slice.call(document.getElementsByTagName("button"));
	for (var i = 3; i < Object.keys(data).length; i++) {
		butts[0].click();
	}
	for (var j = 2; j < data[firstKey].length; j++ ){
		butts[1].click();
	}
	Object.keys(data).forEach(function(key, pos) {
		var inputs = Array.prototype.slice.apply(document.getElementsByTagName("div")[pos+1].getElementsByTagName("input"));
		inputs[0].value = key;
		data[key].forEach((val, pos) => inputs[pos+1].value = val);
		inputs.forEach(function(input) {
			input.focus();
			input.blur();
		});
	});
	butts[2].click();
	setData = function(){};
}

function setCell(catA, rowA, catB, rowB, val, description) {
	var cellA = document.getElementById((catA + ":" + rowA + "|" + catB + ":" + rowB).toUpperCase().replace(/ /, "_")),
	    cellB = document.getElementById((catB + ":" + rowB + "|" + catA + ":" + rowA).toUpperCase().replace(/ /, "_")),
	    cell = cellA || cellB;
	if (typeof cell === "undefined") {
		return;
	}
	switch (val) {
	case -1:
		cell.dispatchEvent(new CustomEvent("contextmenu"));
		break;
	case 1:
		cell.click();
		break;
	}
	if (typeof description !== "undefined") {
		cell.setAttribute("title", description);
	}
}

function addRule(catA, catB, rowB, method, catC, rowC, description) {
	catA = catA.toUpperCase();
	catB = catB.toUpperCase();
	rowB = rowB.toUpperCase();
	method = method.toUpperCase();
	catC = catC.toUpperCase();
	rowC = rowC.toUpperCase();
	document.getElementsByTagName("button")[1].click();
	var buttons = document.getElementById("choices").getElementsByTagName("button");
	if (![
		b => b.textContent.toUpperCase() == catA,
		b => b.textContent.toUpperCase() == catB,
		b => b.textContent.toUpperCase() == rowB,
		b => b.textContent.toUpperCase() == method,
		b => b.textContent.toUpperCase() == catC,
		b => b.textContent.toUpperCase() == rowC
	].every(fn => !Array.prototype.slice.apply(buttons).filter(fn).every(b => {b.click(); return false;}))) {
		document.getElementById("overlay").getElementsByTagName("button")[0].click();
		return false;
	}
	buttons[0].click();
	if (typeof description !== "undefined") {
		document.getElementsByTagName("table")[1].lastChild.getElementsByTagName("span")[0].setAttribute("title", description);
	}
	return true;
}

function solve() {
	document.getElementsByTagName("button")[0].click();
}
