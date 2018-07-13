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
		    }()),
		    adjacentCells = function(cellNum) {
			var cells = [];
			if (cellNum > 0) {
				cells.push(cellNum - 1);
			}
			if (cellNum < numRows - 1) {
				cells.push(cellNum + 1);
			}
			return cells;
		    },
		    adjacentTo = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			Object.keys(dataB).every(function(val, num) {
				if (dataB[val].Get() === 0 && adjacentCells(num).every(c => dataC[Object.keys(dataC)[c]].Get() === -1)) {
					dataB[val].Set(-1);
					unchanged = false;
				}
				return true;
			});
			Object.keys(dataC).every(function(val, num) {
				if (dataC[val].Get() === 0 && adjacentCells(num).every(c => dataB[Object.keys(dataB)[c]].Get() === -1)) {
					dataC[val].Set(-1);
					unchanged = false;
				}
				return true;
			});
			return unchanged;
		    },
		    leftOf = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			[dataB[Object.keys(dataB)[numRows-1]], dataC[Object.keys(dataC)[0]]].filter(cell => cell.Get() == 0).forEach(function(cell) {
				cell.Set(-1);
				unchanged = false;
			});
			Object.keys(dataC).slice(1).every(function(val, num) {
				var other = dataB[Object.keys(dataB)[num]];
				switch (dataC[val].Get()) {
				case -1:
					if (other.Get() !== -1) {
						other.Set(-1);
						unchanged = false;
					}
					break;
				case 0:
					break;
				case 1:
					if (other.Get() !== 1) {
						other.Set(1);
						unchanged = false;
						return false;
					}
				}
				return true;
			});
			Object.keys(dataB).slice(0, -1).every(function(val, num) {
				var other = dataC[Object.keys(dataC)[num+1]];
				switch (dataB[val].Get()) {
				case -1:
					if (other.Get() !== -1) {
						other.Set(-1);
						unchanged = false;
					}
					break;
				case 0:
					break;
				case 1:
					if (other.Get() !== 1) {
						other.Set(1);
						unchanged = false;
						return false;
					}
				}
				return true;
			});
			return unchanged;
		    },
		    before = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			Object.keys(dataB).every(function(k) {
				if (dataC[k].Get() == 0) {
					dataC[k].Set(-1);
					unchanged = false;
				}
				return dataB[k].Get() === 0;
			});
			Object.keys(dataC).reverse().every(function(k) {
				if (dataB[k].Get() == 0) {
					dataB[k].Set(-1);
					unchanged = false;
				}
				return dataC[k].Get() === 0;
			});
			return unchanged;
		    },
		    blankPivot = (function() {
			var cats = categories.map(cat => cat.Title),
			    rows = cats.reduce((rows, cat, i) => {rows[cat] = categories[i].Values; return rows;}, {}),
			    mask = function(catA, catB, rowB) {
				return rows[catA].map(rowA => data[catB][rowB][catA][rowA].Get() === 0 ? 1 : 0).reduce((mask, val, i) => mask |= val << i);
			    };
			return function() {
				return cats.every(
					catA => cats.filter(
						catB => catB != catA
					).every(
						catB => Object.keys(data[catB]).every(
							rowB => {
								var mMask = mask(catA, catB, rowB);
								if (mMask > 0) {
									return categories.map(
										cat => cat.Title
									).filter(
										cat => cat !== catA && cat !== catB
									).every(
										catC => Object.keys(data[catC]).filter(
											rowC => {
												var m = mask(catA, catC, rowC)
												return m > 0 && (m & mMask) === 0;
											}
										).every(
											rowC => {
												if (data[catB][rowB][catC][rowC].Get() === 0) {
													data[catB][rowB][catC][rowC].Set(-1);
													return false;
												}
												return true;
											}
										)
									)
								}
								return true;
							}
						)
					)
				);
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
		solver.addEventListener("click", function() {while(!this()||!rules.every(r => r()) || !blankPivot()){};updateCells();}.bind(cells.every.bind(cells, cell => cell.Solve(data))));
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
				    ongoing.textContent += ", Row " + c + ".";
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
			close.setAttribute("class", "closer");
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
