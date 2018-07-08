"use strict";
window.addEventListener("load", function() {
	var createElement = document.createElementNS.bind(document, document.getElementsByTagName("html")[0].namespaceURI),
	clearNode = function(node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}
	},
	Category = (function() {
		var obj = function(parent) {
			this.parent = parent;
			this.Title = "";
			this.Values = [];
		};
		obj.prototype = {
			SetTitle: function(title) {
				this.Title = title;
			},
			SetValue: function(num, value) {
				this.Values[num] = value;
			},
			AddRow: function() {
				this.SetValue(this.Values.length, "");
				var input = this.parent.appendChild(createElement("li")).appendChild(createElement("input"));
				input.addEventListener("blur", (function(row) {
					categories[catNum].SetValue(row, this.value);
				}).bind(input, i));
			}
		};
		return obj;
	}()),
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
				var unchanged = true,
				    self = this;
				if (this.Get() === 0) {
					if (this.unique.some(u => u.every(cell => cell.Get() == -1))) {
						this.Set(1);
						unchanged = false;
					} else if (this.unique.some(u => u.filter(cell => cell.Get() == 1).length == 1)) {
						this.Set(-1);
						unchanged = false;
					}
				}
				if (this.Get() === 1) {
					Object.keys(data[this.cats[0]][this.vals[0]]).filter(k => k !== this.cats[1]).forEach(k => Object.keys(data[this.cats[0]][this.vals[0]][k]).forEach(function(j) {
						var valA = data[self.cats[0]][self.vals[0]][k][j],
						    valB = data[self.cats[1]][self.vals[1]][k][j];
						if (valA.Get() !== 0 && valB.Get() == 0) {
							valB.Set(valA.Get());
							unchanged = false;
						} else if (valB.Get() !== 0 && valA.Get() == 0) {
							valA.Set(valB.Get());
							unchanged = false;
						}
					}));
				}
				return unchanged;
			}
		};
		return obj;
	}());
	clearNode(document.body);
	var categories = [],
	    addCategory = document.body.appendChild(createElement("button")),
	    addRow = document.body.appendChild(createElement("button")),
	    addRowCell = function(parent, catNum) {
		var i = categories[catNum].Values.length,
		    input = parent.appendChild(createElement("li")).appendChild(createElement("input"));
		categories[catNum].SetValue(i, "");
		input.addEventListener("blur", function() {
			categories[catNum].SetValue(i, input.value);
		});
	    },
	    done = document.body.appendChild(createElement("button")),
	    info = createElement("div"),
	    numRows = 2;
	document.body.appendChild(createElement("br"));
	document.body.appendChild(info);
	addCategory.innerHTML = "Add Category";
	addRow.innerHTML = "Add Row";
	info.setAttribute("id", "info");
	done.innerHTML = "Start";
	addCategory.addEventListener("click", function() {
		var catNum = categories.length,
		    set = createElement("div"),
		    title = set.appendChild(createElement("input")),
		    values = set.appendChild(createElement("ol"));
		categories[catNum] = new Category(values);
		title.addEventListener("blur", function() {
			categories[catNum].SetTitle(this.value);
		});
		for (var i = 0; i < numRows; i++) {
			addRowCell(values, catNum);
		}
		info.appendChild(set);
	});
	addRow.addEventListener("click", function() {
		numRows++;
		Array.prototype.slice.apply(document.body.getElementsByTagName("ol")).forEach(addRowCell);
	});
	addCategory.click();
	addCategory.click();
	addCategory.click();
	done.addEventListener("click", function() {
		clearNode(document.body);
		var numRows = categories[0].Values.length,
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
		    adjacentTo = function(catA, catB, rowB, catC, rowC) {
			return true;
		    },
		    leftOf = function(catA, catB, rowB, catC, rowC) {
			return true;
		    },
		    before = function(catA, catB, rowB, catC, rowC) {
			return true;
		    };
		firstCell.setAttribute("colspan", "2");
		firstCell.setAttribute("rowspan", "2");
		categories.forEach(function(cat) {
			var crosses = {};
			cat.Values.forEach(function(val) {
				var mdata = {};
				categories.filter(mcat => mcat != cat).forEach(function(mcat) {
					var values = {};
					mcat.Values.forEach(function(val) {
						values[val.toUpperCase()] = null;
					});
					mdata[mcat.Title.toUpperCase()] = values;
				});
				crosses[val.toUpperCase()] = mdata;
			});
			data[cat.Title.toUpperCase()] = crosses;
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
			var rowCatTitle = cat.Title.toUpperCase();
			cat.Values.forEach(function(title, cpos) {
				var row = tbody.appendChild(createElement("tr")),
				    rowTitle = title.toUpperCase();
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
					var columnCatTitle = mcat.Title.toUpperCase();
					mcat.Values.forEach(function(val, i) {
						var elm = row.appendChild(createElement("td")),
						    cell = new Cell(elm),
						    columnTitle = val.toUpperCase();
						cells.push(cell);
						elm.addEventListener("click", function() {
							if (this.Get() == 1) {
								this.Set(0);
							} else {
								this.Set(1);
							}
						}.bind(cell, i));
						elm.addEventListener("contextmenu", function(e) {
							e.preventDefault();
							if (this.Get() == -1) {
								this.Set(0);
							} else {
								this.Set(-1);
							}
						}.bind(cell));
						if (i == 0) {
							elm.setAttribute("class", "first");
						} else {
							elm.setAttribute("class", "");
						}
						cell.cats = Array(rowCatTitle, columnCatTitle);
						cell.vals = Array(rowTitle, columnTitle);
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
		window.Set = function(cat1, title1, cat2, title2, onoff) {
			this[cat1.toUpperCase()][title1.toUpperCase()][cat2.toUpperCase()][title2.toUpperCase()].Set(onoff);
		}.bind(data);
		Object.values(data).forEach(a => Object.values(a).forEach(b => Object.values(b).forEach(c => Object.keys(c).forEach(d => c[d].AddUnique(Object.keys(c).filter(e => e != d).map(f => c[f]))))));
		solver.textContent = "Solve";
		solver.addEventListener("click", function() {while(!this()||!rules.every(r => r())){}updateCells();}.bind(cells.every.bind(cells, cell => cell.Solve(data))));
		addRule.textContent = "Add Rule";
		addRule.addEventListener("click", (function() {
			var overlay = createElement("div"),
			    content = overlay.appendChild(createElement("div")),
			    close = content.appendChild(createElement("button")),
			    ongoing = content.appendChild(createElement("div")),
			    title = content.appendChild(createElement("h1")),
			    choices = content.appendChild(createElement("div")),
			    catA = "",
			    catAClick = function(c) {
				catA = c;
				ongoing.textContent = "In " + c;
				title.textContent = "First Pivot Category";
				clearNode(choices);
				Object.keys(data).filter(k => k != c).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catBClick.bind(null, cat));
				});
			    },
			    catB = "",
			    catBClick = function(c) {
				catB = c;
				ongoing.textContent += ", Category " + c;
				title.textContent = "First Pivot Row";
				clearNode(choices);
				Object.keys(data[c]).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", rowBClick.bind(null, cat));
				});
			    },
			    rowB = "",
			    rowBClick = function(c) {
				rowB = c;
				ongoing.textContent += ", Row " + c;
				title.textContent = "Method";
				clearNode(choices);
				Object.keys(modes).forEach(function(m) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = m;
					butt.addEventListener("click", modeClick.bind(null, m));
				});
			    },
			    modes = {
				"Adjacent To": adjacentTo,
				"Left/Up Of": leftOf,
				"Right/Down Of": function(catA, catB, rowB, catC, rowC) {return leftOf(catA, catC, rowC, catB, rowB);},
				"Before": before,
				"After": function(catA, catB, rowB, catC, rowC) {return before(catA, catC, rowC, catB, rowB);},
			    },
			    mode = function(){},
			    modeClick = function(c) {
				mode = modes[c];
				ongoing.textContent += ", is " + c + " ";
				title.textContent = "Second Pivot Category";
				clearNode(choices);
				Object.keys(data).filter(k => k != c).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catCClick.bind(null, cat));
				});
			    },
			    catC = "",
			    catCClick = function(c) {
				catC = c;
				ongoing.textContent += "Category " + c;
				title.textContent = "Second Pivot Row";
				clearNode(choices);
				Object.keys(data[c]).filter(k => c !== catB || k != rowB).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", rowCClick.bind(null, cat));
				});
			    },
			    rowC = "",
			    rowCClick = function(c) {
				    rowC = c;
				    ongoing.textContent += ", Row " + c;
				    title.textContent = "";
				    clearNode(choices);
				    var butt = choices.appendChild(createElement("button"));
				    butt.textContent = "Add Rule";
				    butt.addEventListener("click", addRule);
			    },
			    none = function(){return true;},
			    addRule = function() {
				var t = rulesList.appendChild(createElement("tr")),
				    r = t.appendChild(createElement("td")),
				    remove = r.appendChild(createElement("button")),
				    n = rules.push(mode.bind(null, catA, catB, rowB, catC, rowC)) - 1,
				    desc = r.appendChild(createElement("span"));
				remove.textContent = "X";
				remove.addEventListener("click", function() {
					rulesList.removeChild(t);
					rules[n] = none;
				});
				desc.textContent = ongoing.textContent;
				close.click();
			    };
			overlay.setAttribute("id", "overlay");
			choices.setAttribute("id", "choices");
			close.addEventListener("click", document.body.removeChild.bind(document.body, overlay));
			close.innerText = "X";
			return function() {
				ongoing.textContent = "";
				clearNode(choices);
				title.textContent = "Main Category";
				Object.keys(data).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catAClick.bind(null, cat));
				});
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
