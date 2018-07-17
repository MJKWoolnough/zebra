"use strict";
window.addEventListener("load", function() {
	var createElement = document.createElementNS.bind(document, document.getElementsByTagName("html")[0].namespaceURI),
	    clearNode = function(node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}
	    },
	    addCategory = document.body.appendChild(createElement("button")),
	    addRow = document.body.appendChild(createElement("button")),
	    removeRow = document.body.appendChild(createElement("button")),
	    done = document.body.appendChild(createElement("button")),
	    info = createElement("div"),
	    numRows = 2;
	document.body.appendChild(createElement("br"));
	document.body.appendChild(info);
	addCategory.textContent = "Add Category";
	addRow.textContent = "Add Row";
	removeRow.textContent = "Remove Row";
	info.setAttribute("id", "info");
	done.textContent = "Start";
	addCategory.addEventListener("click", function() {
		var set = createElement("div"),
		    close = set.appendChild(createElement("button")),
		    values = set.appendChild(createElement("ol")),
		    title = set.insertBefore(createElement("input"), values);
		close.textContent = "X";
		close.setAttribute("class", "closer")
		close.addEventListener("click", info.removeChild.bind(info, set));
		title.addEventListener("focus", title.removeAttribute.bind(title, "class"));
		for (var i = 0; i < numRows; i++) {
			var input = values.appendChild(createElement("li")).appendChild(createElement("input"));
			input.addEventListener("focus", input.removeAttribute.bind(input, "class"));
		}
		info.appendChild(set);
	});
	addRow.addEventListener("click", function() {
		numRows++;
		Array.from(info.getElementsByTagName("ol")).map(ol => ol.appendChild(createElement("li")).appendChild(createElement("input"))).forEach(input => input.addEventListener("focus", input.removeAttribute.bind(input, "class")));
	});
	removeRow.addEventListener("click", function() {
		if (numRows > 0) {
			numRows--;
			Array.from(info.getElementsByTagName("ol")).forEach(ol => ol.hasChildNodes() && ol.removeChild(ol.lastChild));
		}
	});
	addCategory.click();
	addCategory.click();
	addCategory.click();
	done.addEventListener("click", function() {
		if (info.childElementCount < 3 || numRows < 2) {
			alert("Need a minimum of 3 categories and 2 rows");
			return;
		}
		var categories = Array.from(info.getElementsByTagName("div")).map(function(cat) {
			var inputs = Array.from(cat.getElementsByTagName("input"));
			return {"Title": inputs[0].value, "Values": inputs.slice(1).map(input => input.value)};
		    }),
		    table = createElement("table"),
		    thead = table.appendChild(createElement("thead")),
		    firstRow = thead.appendChild(createElement("tr")),
		    secondRow = thead.appendChild(createElement("tr")),
		    tbody = table.appendChild(createElement("tbody")),
		    solver = createElement("button"),
		    addRule = createElement("button"),
		    rulesList = createElement("table"),
		    rules = [],
		    cells = [],
		    firstCell = firstRow.appendChild(createElement("td")),
		    updateCells = cells.forEach.bind(cells, c => c.Update()),
		    data = {},
		    Cell = (function() {
			var obj = function(cell) {
				this.cell = cell;
				this.cats = [];
				this.vals = [];
				this.unique = [];
				this.value = 0;
			};
			obj.prototype = {
				Get: function() {
					return this.value;
				},
				Set: function(val) {
					this.value = val;
				},
				Update: function() {
					this.cell.setAttribute("class", (this.cell.getAttribute("class").includes("first") ? "first " : "") + (this.value == 1 ? "on" : (this.value == -1 ? "off" : "")));
				},
				AddUnique: function(group) {
					this.unique.push(group);
				},
				Solve: function(data) {
					var changed = false,
					    self = this;
					if (this.Get() === 0) {
						if (this.unique.some(u => u.every(cell => cell.Get() === -1))) {
							this.Set(1);
							changed = true;
						} else if (this.unique.some(u => u.filter(cell => cell.Get() === 1).length === 1)) {
							this.Set(-1);
							changed = true;
						}
					}
					if (this.Get() === 1) {
						Object.keys(data[this.cats[0]][this.vals[0]]).filter(k => k !== this.cats[1]).forEach(k => Object.keys(data[this.cats[0]][this.vals[0]][k]).forEach(function(j) {
							var valA = data[self.cats[0]][self.vals[0]][k][j],
							    valB = data[self.cats[1]][self.vals[1]][k][j];
							if (valA.Get() !== 0 && valB.Get() === 0) {
								valB.Set(valA.Get());
								changed = true;
							} else if (valB.Get() !== 0 && valA.Get() === 0) {
								valA.Set(valB.Get());
								changed = true;
							}
						}));
					}
					return changed;
				},
				Sanity: function() {
					switch (this.Get()) {
					case -1:
						if (this.unique.some(u => u.every(cell => cell.Get() === -1))) {
							return false;
						}
						break;
					case 1:
						if (this.unique.some(u => u.some(cell => cell.Get() === 1))) {
							return false;
						}
						break;
					}
					return true;
				},
			};
			return obj;
		    }()),
		    reduceBool = (acc, val) => acc ? acc : val,
		    blankPivot = (function() {
			var cats = categories.map(cat => cat.Title),
			    rows = cats.reduce((rows, cat, i) => {rows[cat] = categories[i].Values; return rows;}, {}),
			    mask = function(catA, catB, rowB) {
				return rows[catA].map(rowA => data[catB][rowB][catA][rowA].Get() === 0 ? 1 : 0).reduce((mask, val, i) => mask |= val << i);
			    };
			return function() {
				return cats.map(
					catA => cats.filter(
						catB => catB != catA
					).map(
						catB => Object.keys(data[catB]).map(
							rowB => {
								var mMask = mask(catA, catB, rowB);
								if (mMask > 0) {
									return categories.map(
										cat => cat.Title
									).filter(
										cat => cat !== catA && cat !== catB
									).map(
										catC => Object.keys(data[catC]).filter(
											rowC => {
												var m = mask(catA, catC, rowC)
												return m > 0 && (m & mMask) === 0;
											}
										).map(
											rowC => {
												if (data[catB][rowB][catC][rowC].Get() === 0) {
													data[catB][rowB][catC][rowC].Set(-1);
													return true;
												}
												return false;
											}
										).reduce(reduceBool, false)
									).reduce(reduceBool, false)
								}
								return false;
							}
						).reduce(reduceBool, false)
					).reduce(reduceBool, false)
				).reduce(reduceBool, false);
			};
		    }()),
		    re = /[ :|]/g;
		if (
			!categories.map(cat => cat.Title.replace(/[ |:]/, "_").toUpperCase()).map((cat, i, arr) => {
				if (arr.indexOf(cat) !== i) {
					info.getElementsByTagName("div")[i].getElementsByTagName("input")[0].setAttribute("class", "error");
					return false;
				}
				return true;
			}).reduce((acc, val) => acc ? val : acc) ||
			!categories.map((cat, i) => cat.Values.map(row => row.replace(/[ |:]/, "_").toUpperCase()).map((row, j, arr) => {
				if (arr.indexOf(row) !== j) {
					info.getElementsByTagName("div")[i].getElementsByTagName("input")[j+1].setAttribute("class", "error");
					return false;
				}
				return true;
			}).reduce((acc, val) => acc ? val : acc)).reduce((acc, val) => acc ? val : acc)
		) {
			return;
		}
		clearNode(document.body);
		firstCell.setAttribute("colspan", "2");
		firstCell.setAttribute("rowspan", "2");
		categories.forEach(function(cat) {
			var crosses = {};
			cat.Values.forEach(function(val) {
				var mdata = {};
				categories.filter(mcat => mcat != cat).forEach(function(mcat) {
					var values = {};
					mcat.Values.forEach(function(val) {
						values[val] = null;
					});
					mdata[mcat.Title] = values;
				});
				crosses[val] = mdata;
			});
			data[cat.Title] = crosses;
		});

		categories.slice(1).forEach(function(cat) {
			var catTitle = firstRow.appendChild(createElement("th"));
			catTitle.textContent = cat.Title;
			catTitle.setAttribute("colspan", numRows);
			cat.Values.forEach(function(title, pos) {
				var cell = secondRow.appendChild(createElement("th"));
				cell.appendChild(createElement("div")).textContent = title;
				if (pos === 0) {
					cell.setAttribute("class", "first");
				}
			});
		});
		categories.slice(2).concat(categories[0]).reverse().forEach(function(cat, pos) {
			var rowCatTitle = cat.Title;
			cat.Values.forEach(function(title, cpos) {
				var row = tbody.appendChild(createElement("tr")),
				    rowTitle = title;
				if (cpos == 0) {
					var catTitle = row.appendChild(createElement("th"));
					catTitle.appendChild(createElement("div")).textContent = cat.Title;
					catTitle.setAttribute("rowspan", numRows);
					catTitle.setAttribute("class", "cat");
					row.setAttribute("class", "first");
				}
				var cell = row.appendChild(createElement("th"));
				cell.textContent = title;
				if (cpos === 0) {
					cell.setAttribute("class", "first");
				}
				categories.slice(1, categories.length - pos).forEach(function(mcat) {
					var columnCatTitle = mcat.Title;
					mcat.Values.forEach(function(val, i) {
						var elm = row.appendChild(createElement("td")),
						    cell = new Cell(elm),
						    columnTitle = val;
						cells.push(cell);
						elm.addEventListener("click", function() {
							if (this.Get() == 1) {
								this.Set(0);
							} else {
								this.Set(1);
							}
							this.Update();
						}.bind(cell, i));
						elm.addEventListener("contextmenu", function(e) {
							e.preventDefault();
							if (this.Get() == -1) {
								this.Set(0);
							} else {
								this.Set(-1);
							}
							this.Update();
						}.bind(cell));
						if (i == 0) {
							elm.setAttribute("class", "first");
						} else {
							elm.setAttribute("class", "");
						}
						cell.cats = Array(rowCatTitle, columnCatTitle);
						cell.vals = Array(rowTitle, columnTitle);
						elm.setAttribute("id", (rowCatTitle.replace(re, "_") + ":" + rowTitle.replace(re, "_") + "|" + columnCatTitle.replace(re, "_") + ":" + columnTitle.replace(re, "_")).toUpperCase());
						data[rowCatTitle][rowTitle][columnCatTitle][columnTitle] = cell;
						data[columnCatTitle][columnTitle][rowCatTitle][rowTitle] = cell;
					});
				});
				if (pos > 0) {
					var span = row.appendChild(createElement("td"));
					span.setAttribute("colspan", pos * numRows);
					span.setAttribute("class", "span");
				}
			});
		});
		Object.values(data).forEach(a => Object.values(a).forEach(b => Object.values(b).forEach(c => Object.keys(c).forEach(d => c[d].AddUnique(Object.keys(c).filter(e => e != d).map(f => c[f]))))));
		solver.textContent = "Solve";
		solver.addEventListener("click", function() {
			if (cells.filter(cell => !cell.Sanity()).length > 0) {
				alert("Invalid State");
				return;
			}
			while(cells.map(cell => cell.Solve(data)).reduce(reduceBool, false) || rules.map(r => r()).reduce(reduceBool, false) || blankPivot()){}
			if (cells.filter(cell => !cell.Sanity()).length > 0) {
				alert("Invalid State");
			}
			updateCells();
		});
		addRule.textContent = "Add Rule";
		addRule.addEventListener("click", (function() {
			var ruleFunc = function(catA, catB, rowB, catC, rowC, not, leftRight, far) {
				var changed = false,
				     dataB = data[catB][rowB][catA],
				     dataC = data[catC][rowC][catA];
				[[dataB, dataC], [dataC, dataB]].forEach(data => Object.keys(data[0]).forEach(function(val, num) {
					if (data[0][val].Get() === 0) {
						return;
					}
					var possibleCells = [];
					if (leftRight > -1) {
						if (far === -1) {
							possibleCells.concat(Array(num).fill(0).map((v, n) => n));
						} else {
							possibleCells.push(val - far);
						}
					}
					if (leftRight < 1) {
						if (far === -1) {
							possibleCells.concat(Array(numRows - num - 1).fill(0).map((v, n) => n + num + 1));
						} else {
							possibleCells.push(val + far);
						}
					}
					possibleCells = possibleCells.filter(n => n >= 0 && n < numRows);
					if (not) {
						possibleCells = Array(numRows).fill(0).map((v, n) => n).filter(n => !possibleCells.includes(n));
					}
					if (possibleCells.every(c => data[0][Object.keys(data[0])[c]].Get() === -1)) {
						dataB[val].Set(-1);
						changed = true;
					}
				}));
				return changed;
			    },
			    overlay = createElement("div"),
			    content = overlay.appendChild(createElement("div")),
			    closer = content.appendChild(createElement("button")),
			    rule = content.appendChild(createElement("div")),
			    ruleParts = ["In Category ", "???", ", Category ", "???", ", Row ", "???", " is ", "???", " Category ", "???", ", Row ", "???", "."].map(t => {var s = rule.appendChild(createElement("span"));s.textContent = t; return s}).filter((a, i) => i&1 == 1),
			    catFrag = new DocumentFragment(),
			    valFrag = new DocumentFragment(),
			    labelCatA = content.appendChild(createElement("label")),
			    catASel = content.appendChild(createElement("select")),
			    labelCatB = content.appendChild(createElement("label")),
			    catBSel = content.appendChild(createElement("select")),
			    labelValB = content.appendChild(createElement("label")),
			    valBSel = content.appendChild(createElement("select")),
			    labelCatC = content.appendChild(createElement("label")),
			    catCSel = content.appendChild(createElement("select")),
			    labelValC = content.appendChild(createElement("label")),
			    valCSel = content.appendChild(createElement("select")),
			    done = content.appendChild(createElement("button")),
			    enableButton = function() {
				if (catASel.selectedIndex > 0 && catBSel.selectedIndex > 0 && valBSel.selectedIndex > 0 && catCSel.selectedIndex > 0 && valCSel.selectedIndex > 0) {
					done.removeAttribute("disabled");
				}
			    };
			categories.forEach(cat => {
				var o = catFrag.appendChild(createElement("option")),
				    g = valFrag.appendChild(createElement("optgroup"));
				o.textContent = cat.Title;
				o.setAttribute("value", cat.Title);
				g.setAttribute("label", cat.Title);
				cat.Values.forEach(v => {
					var o = g.appendChild(createElement("option"));
					o.textContent = v;
					o.setAttribute("value", v);
				});
			});
			content.insertBefore(createElement("h1"), rule).textContent = "Add Rule";
			overlay.setAttribute("id", "overlay");
			closer.addEventListener("click", document.body.removeChild.bind(document.body, overlay));
			closer.setAttribute("class", "closer");
			closer.textContent = "X";

			["Category A", "Category B", "Value B", "Rule", "Category C", "Value C"].forEach((t, n) => ruleParts[n].setAttribute("title", t));
			
			labelCatA.textContent = "Category A";
			labelCatA.setAttribute("for", "catA");
			catASel.setAttribute("id", "catA");
			content.insertBefore(createElement("br"), labelCatB);
			labelCatB.textContent = "Category B";
			labelCatB.setAttribute("for", "catB");
			catBSel.setAttribute("id", "catB");
			content.insertBefore(createElement("br"), labelValB);
			labelValB.textContent = "Value B";
			labelValB.setAttribute("for", "valB");
			valBSel.setAttribute("id", "valB");
			content.insertBefore(createElement("br"), labelCatC);
			labelCatC.textContent = "Category C";
			labelCatC.setAttribute("for", "catC");
			catCSel.setAttribute("id", "catC");
			content.insertBefore(createElement("br"), labelValC);
			labelValC.textContent = "Value C";
			labelValC.setAttribute("for", "valC");
			valCSel.setAttribute("id", "valC");
			content.insertBefore(createElement("br"), done);


			catASel.appendChild(createElement("option")).textContent = "--Choose Main Category--";
			catASel.appendChild(catFrag.cloneNode(true));
			catASel.addEventListener("change", function() {
				var val = catASel.selectedIndex;
				catASel.childNodes[0].setAttribute("disabled", "disabled");
				catASel.childNodes[0].style.display = "none";
				[catBSel, catCSel].forEach(s => {
					s.removeAttribute("disabled");
					Array.from(s.childNodes).forEach(n => n.removeAttribute("disabled"));
					s.childNodes[val].setAttribute("disabled", "disabled");
				});
				ruleParts[0].textContent = catASel.childNodes[catASel.selectedIndex].getAttribute("value");
				enableButton();
			});

			catBSel.appendChild(createElement("option")).textContent = "--Choose Second Category--";
			catBSel.appendChild(catFrag.cloneNode(true));
			catBSel.addEventListener("change", function() {
				catBSel.childNodes[0].setAttribute("disabled", "disabled");
				catBSel.childNodes[0].style.display = "none";
				Array.from(valBSel.childNodes).forEach(n => n.style.display = "none");
				valBSel.childNodes[catBSel.selectedIndex].style.display = "";
				valBSel.removeAttribute("disabled");
				valBSel.selectedIndex = 0;
				ruleParts[1].textContent = catBSel.childNodes[catBSel.selectedIndex].getAttribute("value");
				ruleParts[2].textContent = "???";
				enableButton();
			});
			valBSel.appendChild(createElement("option")).textContent = "--Choose Cat Row--";
			valBSel.appendChild(valFrag.cloneNode(true));
			valBSel.addEventListener("click", function() {
				valBSel.childNodes[0].setAttribute("disabled", "disabled");
				valBSel.childNodes[0].style.display = "none";
				Array.from(valCSel.childNodes).filter((v, i) => i != 0).forEach(n => n.childNodes.forEach(m => m.removeAttribute("disabled")));
				valCSel.getElementsByTagName("option")[valBSel.selectedIndex].setAttribute("disabled", "disabled");
				ruleParts[2].textContent = valBSel.getElementsByTagName("option")[valBSel.selectedIndex].getAttribute("value");
				enableButton();
			});

			catCSel.appendChild(createElement("option")).textContent = "--Choose Third Category--";
			catCSel.appendChild(catFrag);
			catCSel.addEventListener("change", function() {
				catCSel.childNodes[0].setAttribute("disabled", "disabled");
				catCSel.childNodes[0].style.display = "none";
				Array.from(valCSel.childNodes).forEach(n => n.style.display = "none");
				valCSel.childNodes[catCSel.selectedIndex].style.display = "";
				valCSel.removeAttribute("disabled");
				valCSel.selectedIndex = 0;
				ruleParts[4].textContent = catCSel.childNodes[catCSel.selectedIndex].getAttribute("value");
				ruleParts[5].textContent = "???";
				enableButton();
			});
			valCSel.appendChild(createElement("option")).textContent = "--Choose Cat Row--";
			valCSel.appendChild(valFrag);
			valCSel.addEventListener("click", function() {
				valCSel.childNodes[0].setAttribute("disabled", "disabled");
				valCSel.childNodes[0].style.display = "none";
				Array.from(valBSel.childNodes).filter((v, i) => i != 0).forEach(n => n.childNodes.forEach(m => m.removeAttribute("disabled")));
				valBSel.getElementsByTagName("option")[valCSel.selectedIndex].setAttribute("disabled", "disabled");
				ruleParts[5].textContent = valCSel.getElementsByTagName("option")[valCSel.selectedIndex].getAttribute("value");
				enableButton();
			});

			// ?not
			// within/exactly
			// n = [0..numRows]
			// before/after/around

			done.textContent = "Add";
			done.addEventListener("click", function() {

			});

			return function() {
				ruleParts.forEach(t => t.textContent = "???");
				catASel.childNodes[0].style.display = "";
				catASel.childNodes[0].removeAttribute("disabled");
				catASel.selectedIndex = 0;
				[catBSel, valBSel, catCSel, valCSel].forEach(s => {
					s.setAttribute("disabled", "disabled");
					s.style.display = "";
					s.selectedIndex = 0;
					Array.from(s.childNodes).forEach(o => {
						o.removeAttribute("disabled")
						o.style.display = "";
						Array.from(o.childNodes).filter(op => op.nodeType !== 3).forEach(op => {
							op.removeAttribute("disabled");
						});
					});
				});
				done.setAttribute("disabled", "disabled");
				document.body.appendChild(overlay);
			};
		}()));
		updateCells();
		document.body.appendChild(table);
		document.body.appendChild(solver);
		document.body.appendChild(addRule);
		document.body.appendChild(rulesList);
	});
});
