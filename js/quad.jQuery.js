//global constants - idea?
var SQUARE_SIZE = 40;
var COLORS = [1, 2, 3, 4];


//object declarations
var Board = function(options) {
    this.init(options);
}

var Square = function(options) {
    this.init(options);
}



$.extend(Square.prototype, {
    dropQueue: [],
	size: SQUARE_SIZE,
    speed: 0,
    mass: 1,
    dirty: true,
    options: {
        //onSwap: $empty
        },
    init: function(options) {
        var thisSquare = this;

		this.isDisplayed = options.isDisplayed,
        this.board = options.board;
        this.row = parseInt(options.row, 10);
        this.col = parseInt(options.col, 10);
        this.seed = Math.floor(Math.random() * 2);
		this.triTop = 'top'+ Math.ceil(Math.random() * 4);
        this.triBot = 'bottom' + Math.ceil(Math.random() * 4);
$('#container');
        if (!this.element) {
            this.element = ($('<div/>').addClass('square ' + 'seed'+this.seed).css({
                'left': ((this.col) * this.size) + 'px',
                'bottom': ((this.row) * this.size) + 'px'
            }).append($('<div/>').addClass('top ' + this.triTop)).append($('<div/>').addClass('bottom ' + this.triBot)));
            $(options.board.element).append(this.element);
			if (!this.isDisplayed) {
				this.element.css('opacity', 0);
			}
        }

        $(this.element).bind('click',
		function() {
            if (thisSquare.board.options.hasBegun) {
				thisSquare.toggleSelect();
			}
			else {
				//$(thisSquare.board.element).css('background', 'none');
				thisSquare.display();
			}
        });

    },
    north: function() {
        var currRow = this.row;
		try {
        	return (currRow + 1 < this.board.options.rows) ? this.board.squares[currRow + 1][this.col] : false;
		} catch(e) { console.log(e)}
    },
    east: function() {
        var currCol = this.col;
        return (currCol + 1 < this.board.options.cols) ? this.board.squares[this.row][currCol + 1] : false;
    },
    south: function() {
        var currRow = this.row;
        return (currRow - 1 >= 0) ? this.board.squares[currRow - 1][this.col] : null;
    },
    west: function() {
        var currCol = this.col;
        return (currCol - 1 >= 0) ? this.board.squares[this.row][currCol - 1] : null;
    },
	getDirs: function() {
		return {n: this.north(),
				s: this.south(),
				e: this.east(),
				w: this.west()};
	},
    getColor: function(which) {
        var color;
        if (which === 'top') {
            color = this.triTop;
        }
        if (which === 'bot') {
            color = this.triBot;
        }
        return parseInt(color.replace(/[a-zA-Z]*/, ''));
    },
    toggleSelect: function() {
        if ((this.board.selected) === null) {
            //Nothing selected
            this.board.selected = this;
            $(this.element).toggleClass('select');
        }
        else if (this.board.selected !== this) {
            //Square selected isn't the one clicked
            if (this.nextTo(this.board.selected)) {
                var selectedSquare = this.board.selected;
                $(selectedSquare.element).toggleClass('select');
                this.board.selected = null;
                this.swap(selectedSquare);
            } else {
                $(this.board.selected.element).toggleClass('select');
                this.board.selected = this;
                $(this.element).toggleClass('select');
            }
        }
        else {
            //Square selected is the same one that was clicked
            $(this.board.selected.element).toggleClass('select');
            this.board.selected = null;
        }
    },
    display: function() {
		var thisSquare = this;
		var directions = thisSquare.getDirs();
		var speed = Math.floor(Math.random() * 6) * 100;
	
		thisSquare.isDisplayed = true;
		$(thisSquare.element).addClass('displayed');
		thisSquare.board.totalDisplayed ++;
		
		$(thisSquare.element).animate({
			opacity: 1
		},
		speed,
		function() {
			if (thisSquare.board.totalDisplayed != thisSquare.board.totalSquares) {
			    
				for (d in directions){
					var dir = directions[d]
					if (dir != null && dir.isDisplayed == false) {
						dir.isDisplayed = true;
						$(dir.element).delay(Math.floor(Math.random() * 9) * 10).trigger('click');
					}
				}
			}
			else {
				thisSquare.board.options.hasBegun = true;
				$(thisSquare.board.element).css('background', 'none');
				$('.square').removeClass('displayed');
			}
		});
    },
	drop: function(newRow, leftCol, rightCol) {
		var square = this;
		var speed = 400;
		var c = 0;
		var leftSquare = square.board.squares[newRow][leftCol];
		var rightSquare = square.board.squares[newRow][rightCol];
		
		leftSquare.row = newRow;
		leftSquare.col = leftCol;
		rightSquare.row = newRow;
		rightSquare.col = rightCol;
		
		$(leftSquare.element).animate({
			bottom: '-=' + this.size
			},
			speed,
			function() {
				if (newRow == square.board.options.rows - 1 && square.dropQueue.length != 0) {
					if (c == 0) {
						c++;
					} else {
						square.checkQueue(square.dropQueue);				
						square.dropQueue = [];
					}
				}
		});
			
		$(rightSquare.element).animate({
			bottom: '-=' + this.size
			},
			speed,
			function() {
				if (newRow == square.board.options.rows - 1 && square.dropQueue.length != 0) {
					if (c == 0) {
						c++;
					} else {
						square.checkQueue(square.dropQueue);				
						square.dropQueue = [];
					}
				}
		});
    },
	checkQueue: function(queue) {
		var square = this;
		for (var i = 0; i < queue.length; i++) {
		    if (i%3 == 0) {
		       square.checkQuad(queue[i].left, queue[i].right);
		    }
		}
	},
    swap: function(square) {
        //swap positions animation
        var currentSquare = this;
        var speed = 300;
        var posCurrent = {
            'left': parseInt($(currentSquare.element).css('left')),
            'bottom': parseInt($(currentSquare.element).css('bottom'))
        };
        var posSelected = {
            'left': parseInt($(square.element).css('left')),
            'bottom': parseInt($(square.element).css('bottom'))
        };
		var c = 0;
		
		this.board.swap(currentSquare, square);
		
        $(square.element).animate({
            left: posCurrent['left'],
            bottom: posCurrent['bottom']
        },
        speed,
        function() {
            if (c == 0) {
				c++;
			} else {
				currentSquare.checkQuad(square, currentSquare);
			}
        });

        $(currentSquare.element).animate({
            left: posSelected['left'],
            bottom: posSelected['bottom']
        },
        speed,
        function() {
            if (c == 0) {
				c++;
			} else {
				currentSquare.checkQuad(square, currentSquare);
			}
        });
    },
    nextTo: function(square) {
        return ((Math.abs(this.col - square.col) + Math.abs(this.row - square.row)) == 1);
    },
	checkQuad: function(s1, s2) {
		//if they are next to each other.
		if (s1 == s2.east() || s1 == s2.west()) {
			var leftSquare, rightSquare, leftDirs, rightDirs;
									
			if (s1 == s2.east()) {
				leftSquare = s2;
				rightSquare = s1;
			} else {
				leftSquare = s1;
				rightSquare = s2;
			}
			
			leftSquares = leftSquare.getDirs();
			rightSquares = rightSquare.getDirs();
			
			if (leftSquare.seed == rightSquare.seed && leftSquare.seed == 1) {
				rightSquare.verifyQuad();
				if (leftSquares['w'] != null && leftSquares['s'] != null) {
					leftSquares['w'].south().verifyQuad();
				}
			}
			else if (leftSquare.seed == rightSquare.seed && leftSquare.seed == 0) {
				if (leftSquares['w'] != null) {
					leftSquares['w'].verifyQuad();
				}
				if (rightSquares['s'] != null) {
					rightSquares['s'].verifyQuad();
				}
			}
			else if (leftSquare.seed == 0) {
				rightSquare.verifyQuad();
				if (leftSquares['s'] != null) {
					leftSquares['s'].verifyQuad();
				}
				if (leftSquares['w'] != null) {
					leftSquares['w'].verifyQuad();
				}
			}
			else {
				leftSquare.verifyQuad();
				if (leftSquares['w'] != null && leftSquares['s'] != null) {
					leftSquares['w'].south().verifyQuad();
					rightSquares['s'].verifyQuad();
				}
			}
		}
		else { 
			var topSquare, bottomSquare, topDirs, bottomDirs;
			
			if (s1 == s2.south()) {
				topSquare = s2;
				bottomSquare = s1;
			} else {
				topSquare = s1;
				bottomSquare = s2;
			}
									
			topSquares = topSquare.getDirs();
			bottomSquares = bottomSquare.getDirs();
			
			if (bottomSquare.seed == topSquare.seed && bottomSquare.seed == 1) {
				topSquare.verifyQuad();
				if (bottomSquares['w'] != null && bottomSquares['s'] != null) {
					bottomSquares['w'].south().verifyQuad();
				}
			}
			else if (bottomSquare.seed == topSquare.seed && bottomSquare.seed == 0) {
				if (bottomSquares['s'] != null) {
					bottomSquares['s'].verifyQuad();
				}
				if (topSquares['w'] != null) {
					topSquares['w'].verifyQuad();
				}
			}
			else if (bottomSquare.seed == 0) {
				topSquare.verifyQuad();
				if (bottomSquares['s'] != null) {
					bottomSquares['s'].verifyQuad();
				}
				if (bottomSquares['w'] != null) {
					bottomSquares['w'].verifyQuad();
				}
			}
			else {
				bottomSquare.verifyQuad();
				if (bottomSquares['w'] != null && bottomSquares['s'] != null) {
					bottomSquares['w'].south().verifyQuad();
					topSquares['w'].verifyQuad();
				}
			}
		}
	},
    verifyQuad: function() {
        if (this.seed == 1) {
			var dirs = this.getDirs();
	        var triTopToMatch = this.getColor('top');
			
			if (dirs['n'] && dirs['e']) {
				
				if (((this.seed + dirs['n'].seed - dirs['n'].east().seed + dirs['e'].seed) === 0) &&
				                             (triTopToMatch === dirs['n'].getColor('bot')) &&
				                             (triTopToMatch === dirs['n'].east().getColor('bot')) &&
				                             (triTopToMatch === dirs['e'].getColor('top'))) {
				// if (((this.seed + dirs['n'].seed - dirs['n'].east().seed + dirs['e'].seed) === 0)) {
					this.explode(this, dirs['e'], dirs['n'], dirs['n'].east());
				}
			}
			return false;
        }
        else {
			return false;
        }
    },
	//always performed from the bottom left square
	explode: function(bottomLeft, bottomRight, topLeft, topRight) {
		//console.log('Boom!');
		var currentSquare = this;
		var speed = 400;
		var c = 0;
		var newTopLeftTri = $(topLeft.element.children('.top')).clone().css('display', 'none');
		var newTopRightTri = $(topRight.element.children('.top')).clone().css('display', 'none');
		
		$(bottomLeft.element).css({'z-index':'10'});
		$(topLeft.element).css({'z-index':'10'});
		$(topRight.element).css({'z-index':'10'});
		$(bottomRight.element).css({'z-index':'10'});
		
		$(bottomLeft.element.children('.top')).animate({
            left: '50',
            bottom: '50',
			'border-width':'50px',
			'border-radius': '50px'
        }, speed, function() {
			$(this).fadeOut('fast', function() {
				$(this).remove();
				newTopLeftTri.prependTo(bottomLeft.element);
			});
		});
		
		
		$(topLeft.element.children('.bottom')).animate({
            	left: '80',
            	top: '75',
				borderWidth:'30px',
				borderRadius: '30px'
       		},
			speed,
			function() {
				$(this).fadeOut('fast', function() {
					$(this).remove();
					
					$(topLeft.element.children('.top')).animate({'top': '40px'},
					{ 
						complete: function() {
						    newTopLeftTri.show();
						    $(topLeft.element).remove();
						    bottomLeft.triTop = $(bottomLeft.element).find('.top')[0].className.replace('top ', '');
							if (c == 0) {
							    c++;
							} else {
							    bottomLeft.board.remove(topLeft, topRight);
						    }
						},
						step: function(now, fx) {
							var deg = (now/speed)*900;
							$(this).css('-webkit-transform','rotate('+deg+'deg)');
							$(this).css('-moz-transform','rotate('+deg+'deg)'); 
							$(this).css('transform','rotate('+deg+'deg)');
						}, 
						duration: speed
					});
				});
			});
		
		
		$(bottomRight.element.children('.top')).animate({
            right: '100',
            bottom: '60',
			'border-width':'40px',
			'border-radius': '40px'
        }, speed, function() {
			$(this).fadeOut('fast', function() {
				$(this).remove();
				newTopRightTri.prependTo(bottomRight.element);
			});
		});
		
		
		$(topRight.element.children('.bottom')).animate({
            right: '75',
            top: '90',
			borderWidth:'70px',
			borderRadius: '70px'
        }, speed, function() {
			$(this).fadeOut('fast', function() {
				$(this).remove();
				
				$(topRight.element.children('.top')).animate({'top': '40px'},
				{
					complete: function() {
						newTopRightTri.show();
						$(topRight.element).remove();
						bottomRight.triTop = $(bottomRight.element).find('.top')[0].className.replace('top ', '');
						if (c == 0) {
						    c++;
						} else {
							bottomLeft.board.remove(topLeft, topRight);
					    }
					},
					step: function(now, fx) {
							var deg = -(now/speed)*900;
							$(this).css('-webkit-transform','rotate('+deg+'deg)');
							$(this).css('-moz-transform','rotate('+deg+'deg)'); 
							$(this).css('transform','rotate('+deg+'deg)');
					},
					duration: speed
				});
			});
		});
	}
});
					
					

$.extend(Board.prototype, {

    selected: null,
    squares: null,
	totalSquares: 0,
	totalDisplayed: 0,
    width: 0,
    height: 0,

    options: {
		hasBegun: true,
        rows: 12,
        cols: 8
    },

    init: function(options) {
        this.setOptions(options);
        this.setSize();
        if (!this.element) {
            this.element = ($('<div/>').addClass('board').css({
                'display': 'block',
                'border': '#fff 5px solid',
                'height': '' + this.height + 'px',
                'width': '' + this.width + 'px',
                'position': 'relative'
            }));
            $('body').append(this.element);
        }

        //Build array
        this.squares = new Array(this.options.rows);

        for (var i = 0; i < this.options.rows; i++) {
            this.squares[i] = new Array(this.options.cols);
        }
        this.populate();
    },
    setSize: function() {
        this.width = this.options.cols * SQUARE_SIZE;
        this.height = this.options.rows * SQUARE_SIZE;
    },
    setOptions: function(optns) {
        for (key in this.options) {
            if (optns[key] != undefined) {
				this.options[key] = optns[key];
            }
        }
		this.totalSquares = this.options.rows*this.options.cols;
    },
    populate: function() {
        for (var r = 0; r < this.options.rows; r++) {
            for (var c = 0; c < this.options.cols; c++) {
                this.squares[r][c] = new Square({
					board: this,
					isDisplayed: this.options.hasBegun,
                    row: r,
                    col: c
                });
            }
        }
    },
	swap: function(square1, square2) {
		var newRow = square1.row;
        var newCol = square1.col;
        
        this.squares[square1.row][square1.col] = square2;
        this.squares[square2.row][square2.col] = square1;

        square1.row = square2.row;
        square1.col = square2.col;
        square2.row = newRow;
        square2.col = newCol;
	},
	remove: function(leftSquare, rightSquare) {
        var board = this;
		var square = leftSquare;
        var leftRow = leftSquare.row;
        var leftCol = leftSquare.col;
        var rightCol = rightSquare.col;
		
		board.squares[leftRow][leftCol] = null;
		board.squares[leftRow][rightCol] = null;
		
        for (var r = leftRow; r < board.options.rows; r++) {
            var nextLeft;
			var nextRight;
			
			if (r + 1 == board.options.rows) {
				nextLeft = new Square({
					board: this,
					isDisplayed: this.options.hasBegun,
                    row: r + 1,
                    col: leftCol
                });
				nextRight = new Square({
					board: this,
					isDisplayed: this.options.hasBegun,
                    row: r + 1,
                    col: rightCol
                });
			}
			else {
				nextLeft = board.squares[r + 1][leftCol];
				nextRight = board.squares[r + 1][rightCol];
			}
			board.squares[r][leftCol] = nextLeft;
            board.squares[r][rightCol] = nextRight;
			
			board.squares[r][leftCol].dropQueue.push({
				'left': board.squares[r][leftCol],
				'right': board.squares[r][rightCol]
			});
			
			square.drop(r, leftCol, rightCol);
            //board.squares[r][leftCol].drop(r, leftCol);
            //board.squares[r][rightCol].drop(r, rightCol);
        }
    }
});



//start
$(document).ready(function() {
    //http://valums.com/demos/game/
    //Add functions here
    var board = new Board({
        rows: 12,
        cols: 23,
        hasBegun: false
    });

    $('body').append(board);
});