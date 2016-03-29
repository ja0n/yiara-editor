export default class DirectorMode {
	constructor(el) {
		let canvas = typeof el === 'string' ? document.querySelector(el) : el;
		this.ctx = canvas.getContext('2d');
    console.log(this.ctx);
		if (!canvas || !this.ctx) throw new Error({'Error': 'Canvas element not found.'});
		this.actors = [];
		this.editing = true;
		this.dragging = false;
		this.mousedown = {};
		this.res = {};
		this.offsetX = 0;
		this.offsetY = 0;
		this.vOffsetX = 0;
		this.vOffsetY = 0;
		this.vMaxOffsetX = 20;
		this.vMaxOffsetY = 20;
		this.anchorX = 0.5;
		this.anchorY = 0.5;
		this.scale = 1;

		canvas.addEventListener('mousedown', e => {
			e.preventDefault();
			let loc = this.windowToCanvas(e.clientX, e.clientY);

      console.debug('mousedown', loc);
			this.selected = null;
			this.scene.actors.forEach(actor => {
				// if (isPointInActor(loc.x - this.offsetX, loc.y - this.offsetY, actor)) {
				if (isPointInActor(this.normalizeX(loc.x), this.normalizeY(loc.y), this.anchor(actor))) {
					this.startDragging(loc);
					this.removeActor(actor);
					this.addActor(actor);

					// this.selected = actor;
					// this.dragging = actor;
					this.selected = actor;
					this.dragging = actor;
					// this.dragOffsetX = (loc.x - actor.x)/this.scale;
					// this.dragOffsetY = (loc.y - actor.y)/this.scale;
					this.dragOffsetX = this.normalizeX(loc.x) - actor.x;
					this.dragOffsetY = this.normalizeY(loc.y) - actor.y;
					// this.dragOffsetX = (loc.x)/this.scale - actor.x;
					// this.dragOffsetY = (loc.y)/this.scale - actor.y;
					// this.dragOffsetX = this.normalizeX(loc.x - actor.x);
					// this.dragOffsetY = this.normalizeY(loc.y - actor.y);
					this.dragCallback = function(loc) {
						// this.selected.x = this.round(loc.x - this.dragOffsetX)/this.scale;
					  // this.selected.y = this.round(loc.y - this.dragOffsetY)/this.scale;
						// this.selected.x = this.round(loc.x/this.scale - this.dragOffsetX);
					  // this.selected.y = this.round(loc.y/this.scale - this.dragOffsetY);
						this.selected.x = this.round(this.normalizeX(loc.x) - this.dragOffsetX);
					  this.selected.y = this.round(this.normalizeY(loc.y) - this.dragOffsetY);
					};
					this.runCycle();
				}
				else {
					this.dragging = true;
					this.prevLoc = loc;
					this.dragCallback = function(loc) {
						let dtX = (loc.x - this.prevLoc.x)/this.scale;
						let dtY = (loc.y - this.prevLoc.y)/this.scale;
						this.offsetX += dtX;
						this.offsetY += dtY;
						this.prevLoc = loc;
					};
				}
				if(this.onSelect) this.onSelect(this.selected, loc);
			});
		});

		canvas.addEventListener('mousemove', e => {
			e.preventDefault(); // prevent selections
			let loc = this.windowToCanvas(e.clientX, e.clientY);
			if (this.editing && this.dragging) {
				this.cursor('all-scroll');
				this.dragCallback(loc);
				this.runCycle();
				if(this.onDrag) this.onDrag();
				return;
			}

			let colliding = this.actorsInPoint(this.normalizeX(loc.x), this.normalizeY(loc.y));
			this.cursor('auto');
			if (colliding.length > 0) {
				this.cursor('pointer');
			}

			// this.scene.actors.forEach(actor => {
			// 	if (isPointInActor(this.normalizeX(loc.x), this.normalizeY(loc.y), actor)) {
			// 		this.cursor('pointer');
			// 	} else {
			// 		this.cursor('auto');
			// 	}
			// });
		});

		canvas.addEventListener('mouseup', e => {
			this.dragging = false;
		});

		canvas.addEventListener('mousewheel', e => {
			e.preventDefault();

			this.scale += e.deltaY > 0 ? -0.1 : 0.1;
			this.runCycle();
		});

		addEventListener('mousedown', e =>{
			this.canvasFocus = e.target == canvas;
		});

		addEventListener('keydown', e => {
			if (!this.canvasFocus) return;

			this.vOffsetX += this.vOffsetX < this.vMaxOffsetX ? 1 : 0;

			if(this.selected) {
	      if (e.keyCode === 37) { // left
	        this.selected.x -= this.vOffsetX;
	      } else if (e.keyCode === 39) { // right
	        this.selected.x += this.vOffsetX;
	      }
			}
			else {
	      if (e.keyCode === 37) { // left
	        this.offsetX -= this.vOffsetX;
	      } else if (e.keyCode === 39) { // right
	        this.offsetX += this.vOffsetX;
	      }
			}
			this.runCycle();
			if (this.onDrag) this.onDrag();
    });

		addEventListener('keyup', e => {
			if (!this.canvasFocus) return;
			this.vOffsetX = this.vOffsetY = 0;
		});
	}

	get width() {
		return this.ctx.canvas.width;
	}

	get height() {
		return this.ctx.canvas.height;
	}

	cursor(cursor) {
		var css = this.ctx.canvas.style;
		return cursor ? css.cursor = cursor : css.cursor;
	}

	setState(state) {
		this.state = state;
	}

	isState(state) {
		return this.state === state;
	}

	drawGrid(color, stepx, stepy) {
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 0.5;

		for (let i = stepx + 0.5; i < this.width; i += stepx) {
			this.ctx.beginPath();
			this.ctx.moveTo(i - this.offsetX, 0 - this.offsetY);
			this.ctx.lineTo(i - this.offsetX, this.height - this.offsetY);
			this.ctx.stroke();
		}

		for (let i = stepy + 0.5; i < this.height; i += stepy) {
			this.ctx.beginPath();
			this.ctx.moveTo(0 - this.offsetX, i - this.offsetY);
			this.ctx.lineTo(this.width - this.offsetX, i - this.offsetY);
			this.ctx.stroke();
		}
	}
	clearCanvas() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
	startDragging(loc) {
	  this.mousedown.x = loc.x;
	  this.mousedown.y = loc.y;
	}
	windowToCanvas(x, y) {
    const canvas = this.ctx.canvas;
		var bbox = canvas.getBoundingClientRect();
	  return { x: x - bbox.left * (canvas.width  / bbox.width),
	           y: y - bbox.top  * (canvas.height / bbox.height) };
	}
	drawHorizontalLine (y) {
		this.ctx.beginPath();
		this.ctx.moveTo(0 - this.offsetX, y+0.5);
		this.ctx.lineTo(this.width, y+0.5);
		this.ctx.stroke();
	}
	drawVerticalLine  (x) {
		this.ctx.beginPath();
		this.ctx.moveTo(x+0.5, 0 - this.offsetY);
		this.ctx.lineTo(x+0.5, this.height);
		this.ctx.stroke();
	}
	drawGuidewires(x, y) {
		this.ctx.save();
		this.ctx.strokeStyle = 'rgba(0,0,230,0.4)';
		this.ctx.lineWidth = 0.5;
		this.drawVerticalLine(x);
		this.drawHorizontalLine(y);
		this.ctx.restore();
	}
	removeActor(actor) {
		const index = this.scene.actors.indexOf(actor);
		if (index != -1) this.scene.actors.splice(index, 1);
	}
	addActor(actor) {
		this.scene.actors.push(actor);
	}
	drawActor(actor) {
		const sprite = this.res[actor.render.sprite.texture];
		actor = this.anchor(actor);
		this.ctx.drawImage(sprite, actor.x, actor.y, actor.width || actor.radius*2, actor.height || actor.radius*2);
		// this.ctx.drawImage(sprite, actor.x - (actor.width * this.anchorX), actor.y - (actor.height * this.anchorY), actor.width || actor.radius*2, actor.height || actor.radius*2);
	}
	drawActors() {
	  this.scene.actors.forEach(actor => {
			this.drawActor(actor);
		});
	}
	drawBorder(x, y, w, h) {
		this.ctx.save();
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = 'red';
		this.ctx.beginPath();
		this.ctx.rect(x-1, y-1, w+2, h+2);
		this.ctx.stroke();
		this.ctx.restore();
	}
	runCycle() {
		this.clearCanvas();
		this.ctx.save();
		this.ctx.scale(this.scale, this.scale);
		this.ctx.translate(this.offsetX, this.offsetY);
		this.drawGrid('lightgray', 25, 25);
		this.drawActors();
		if(this.selected) {
			const selected = this.anchor(this.selected);
			// this.drawBorder(this.selected.x, this.selected.y, this.selected.width, this.selected.height);
			this.drawBorder(selected.x, selected.y, selected.width || selected.radius*2, selected.height || selected.radius*2);
			this.drawGuidewires(selected.x + (selected.width/2 || selected.radius), selected.y + (selected.height/2 || selected.radius) );
			// this.drawGuidewires(this.selected.x+this.selected.width/2,
			// 									  this.selected.y+this.selected.height/2);
		}
		this.ctx.restore();
	}
	createImage(src, loaded, error) {
    let img = new Image();
    img.src = img.fileName = src;
    img.addEventListener('load', loaded);
    img.addEventListener('error', loaded);

    return img;
  }
  loadResources(cb) {
		let res = this.scene.res;
		res.forEach(fileName => {
			this.res[fileName] = this.createImage(fileName, e => {
        if(res.indexOf(e.path[0].fileName) == (res.length -1))
					this.runCycle();
      });
		});
    // let images = Data.res;
    // for(let i = 0; i < images.length; i++) {
    //   var fileName = images[i];
    //   let img = createImage(src, e => {
    //     if(images.indexOf(e.path[0].fileName) == images.length -1) cb()
    //   });
    //   this.images[fileName] = img;
    // }
  }
	actorsInPoint(x, y) {
		let arr = this.scene.actors.filter(actor => isPointInActor(x, y, this.anchor(actor)));

		// if (arr.length == 1) arr = arr[0];
		return arr;
	}
	loadScene(scene) {
		this.scene = scene;
		this.loadResources();
		this.runCycle();

	}
	anchor(actor) {
		let clone = Object.create(actor);
		clone.x = actor.x - (actor.width || actor.radius*2) * this.anchorX;
		clone.y = actor.y - (actor.height || actor.radius*2) * this.anchorY;

		if (actor.radius) {
			// clone.x = actor.x - (actor.width || actor.radius*2) * this.anchorX;
			// clone.y = actor.y - (actor.height || actor.radius*2) * this.anchorY;
			// console.log('compare radius', actor, clone);
		}

		// const diff = {
			// x: actor.x - (actor.width || actor.radius) * this.anchorX,
			// y: actor.y - (actor.height || actor.radius) * this.anchorY
		// };
		// return Object.assign(actor, diff);
		return clone;
	}
	normalizeX(x) {
		return (x - this.offsetX)/this.scale;
		// return (x - this.offsetX)/this.scale;
	}
	normalizeY(y) {
		return (y - this.offsetY)/this.scale;
		// return (y - this.offsetY)/this.scale;
	}
	round(number) {
		return +(Math.round(number * 2) / 2).toFixed(1)
	}
}

function isPointInActor(x, y, actor) {
	if (actor.radius) {
		return isPointInCircle(x, y, actor);
	}

	if (actor.width && actor.height) {
		return isPointInRect(x, y, actor);
	}
}

function isPointInCircle(x, y, actor) {
	if (!actor.radius) return false;

  const distance = squared(x - (actor.x + actor.radius)) + squared(y - (actor.y + actor.radius));
  return distance <= squared(actor.radius);
}

function isPointInRect(x, y, actor) {
	if (!actor.width && !actor.height) return false;

	return (!(x < actor.x || x > actor.x+actor.width) &&
					!(y < actor.y || y > actor.y+actor.height));
}

function squared(num) {
	return Math.pow(num, 2);
}
