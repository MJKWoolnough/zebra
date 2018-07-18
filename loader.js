"use strict";
function setData(data) {
	var firstKey = Object.keys(data)[0];
	if (!Object.keys(data).slice(1).every(key => data[key].length == data[firstKey].length)) {
		console.log("All categories must be of the same length");
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
	if (cell === null) {
		console.log("Invalid Cell: ", arguments);
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
	document.getElementsByTagName("button")[1].click();
	var done = 0;
	[
		["categoryA", catA.toUpperCase()],
		["categoryB", catB.toUpperCase()],
		["valueB",    rowB.toUpperCase(), "categoryB"],
		["categoryC", catC.toUpperCase()],
		["valueC",    rowC.toUpperCase(), "categoryC"]
	].every(function(v) {
		var e = document.getElementById(v[0]),
		    os = Array.from(e.childNodes),
		    add = 0;
		if (v.length === 3) {
			os = Array.from(os[document.getElementById(v[2]).selectedIndex].childNodes);
			add = (document.getElementById(v[2]).selectedIndex - 1) * os.length + 1;
		}
		return !os.every(function(c, n) {
			if (c.hasAttribute("value") && c.getAttribute("value").toUpperCase() === v[1]) {
				e.selectedIndex = add + n;
				e.dispatchEvent(new CustomEvent("change"));
				done++;
				return false;
			}
			return true;
		});
	});
	if (done < 5) {
		document.getElementById("closer").click();
		return false;
	}

	method = method.toUpperCase();

	// Legacy
	switch (method) {
	case "LEFT/UP OF":
		method = "EXACTLY 1 BEFORE";
		break;
	case "RIGHT/DOWN OF":
		method = "EXACTLY 1 AFTER";
		break;
	case "ADJACENT TO":
		method = "EXACTLY 1 ON ONE SIDE OF";
		break;
	}
	var within = document.getElementById("within"),
	    distance = document.getElementById("distance"),
	    direction = document.getElementById("direction"),
	    readNum = true;
	if (method.startsWith("NOT ")) {
		method = method.substring(4);
		document.getElementById("not").checked = true;
	}
	if (method.startsWith("WITHIN ")) {
		within.selectedIndex = 1;
		within.dispatchEvent(new CustomEvent("change"));
		method = method.substring(7);
	} else if (method.startsWith("EXACTLY ")) {
		within.selectedIndex = 2;
		within.dispatchEvent(new CustomEvent("change"));
		method = method.substring(8);
	} else {
		readNum = false;
	}
	if (readNum) {
		var num = method.split(" ")[0];
		if (Array.from(distance.childNodes).every(function(o, n) {
			if (o.hasAttribute("value") && o.getAttribute("value") === num) {
				distance.selectedIndex = n;
				distance.dispatchEvent(new CustomEvent("change"));
				method = method.substring(num.length + 1);
				return false;
			}
			return true;
		})) {
			document.getElementById("closer").click();
			return false;
		}
	}
	switch (method) {
	case "ON ONE SIDE OF":
		direction.selectedIndex = 0;
		direction.dispatchEvent(new CustomEvent("change"));
		break;
	case "AFTER":
		direction.selectedIndex = 1;
		direction.dispatchEvent(new CustomEvent("change"));
		break;
	case "BEFORE":
		direction.selectedIndex = 2;
		direction.dispatchEvent(new CustomEvent("change"));
		break;
	default:
		//document.getElementById("closer").click();
		return false;
	}
	document.getElementById("done").click();
	return true;
}

function solve() {
	document.getElementsByTagName("button")[0].click();
}
