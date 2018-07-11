"use strict";
function setData(data) {
	var firstKey = Object.keys(data)[0];
	if (!Object.keys(data).slice(1).every(key => data[key].length == data[firstKey].length)) {
		return;
	}
	var butts = document.getElementsByTagName("button"),
	    cats = document.getElementById("info"),
	    rows;
	while (cats.childElementCount > Object.keys(data).length) {
		butts[butts.length-1].click();
	}
	while (cats.childElementCount < Object.keys(data).length) {
		butts[0].click();
	}
	rows = cats.firstChild.getElementsByTagName("li");
	while (rows.length > data[firstKey].length) {
		butts[2].click();
	}
	while (rows.length < data[firstKey].length) {
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
	butts[3].click();
	setData = function(){};
}

function setCell(catA, rowA, catB, rowB, val, description) {
	var re = /[ :|]/g,
	    cell = document.getElementById((catA.replace(re, "_") + ":" + rowA.replace(re, "_") + "|" + catB.replace(re, "_") + ":" + rowB.replace(re, "_")).toUpperCase()) || document.getElementById((catB.replace(re, "_") + ":" + rowB.replace(re, "_") + "|" + catA.replace(re, "_") + ":" + rowA.replace(re, "_")).toUpperCase());
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
