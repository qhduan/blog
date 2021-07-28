
function ClearCanvas () {
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.clearRect(0,0,document.getElementById("canvas").width,document.getElementById("canvas").height);
}

function Tank() {
	this.x = randi(0, document.getElementById("canvas").width);
	this.y = randi(0, document.getElementById("canvas").height);
	this.angle = randf(0, 2 * Math.PI);
	this.c = "green";
			
	this.tank = [[-18,18],
	[-10,18],[-10,10],[-5,10],
	[-5,30],[5,30],[5,10],
	[10,10],[10,18],[18,18],
	[18,-18],[10,-18],[10,-10],
	[-10,-10],[-10,-18],[-18,-18],
	[-18,18]];
	
	this.scale(0.3);
	this.mx = document.getElementById("canvas").width;
	this.my = document.getElementById("canvas").height;
	
	var c = document.getElementById("canvas");
	this.ctx = c.getContext("2d");
	this.show();
}

Tank.prototype.rotate = function (points) {
	var newpoints = [];
	for(var i in points){
		newpoints.push(points[i].slice(0));
	}
	for(var i in newpoints) {
		var a = newpoints[i][0];
		var b = newpoints[i][1];
		var newa = a*Math.cos(this.angle) - b*Math.sin(this.angle);
		var newb = a*Math.sin(this.angle) + b*Math.cos(this.angle);
		newpoints[i][0] = newa;
		newpoints[i][1] = newb;
	}
	return newpoints;
};

Tank.prototype.scale = function (s) {
	
	function ss (p) {
		for(var i in p) {
			p[i][0] = p[i][0] * s;
			p[i][1] = p[i][1] * s;
		}
	}
	ss(this.tank);
};

Tank.prototype.draw = function (points) {
	if(this.x > this.mx)
		this.x = 0;
	if(this.x < 0)
		this.x = this.mx;
	if(this.y > this.my)
		this.y = 0;
	if(this.y < 0)
		this.y = this.my;
		
	this.ctx.moveTo(points[0][0] + this.x, points[0][1] + this.y);
	for(var i = 1;i<points.length;i++){
		this.ctx.lineTo(points[i][0] + this.x, points[i][1] + this.y);
	}
};

Tank.prototype.show = function  () {	
	var tank = this.rotate(this.tank);
				
	this.ctx.beginPath();
	
	this.ctx.fillStyle = this.c;
	this.ctx.arc(this.x, this.y , 4, 0, Math.PI*2, false);
	this.ctx.fill();
	
	this.draw(tank);
	
	this.ctx.stroke();
};
		
Tank.prototype.color = function (c) {
	if(c !== undefined)
		this.c = c;
	return this.c;
};
		
Tank.prototype.go = function (n) {
	this.y += Math.cos(this.angle)*n;
	this.x -= Math.sin(this.angle)*n;
};
		
Tank.prototype.turn = function (n) {
	this.angle += n;
	while(this.angle >= 2 * Math.PI)
		this.angle -= 2 * Math.PI;
	while(this.angle <= -2 * Math.PI)
		this.angle += 2  * Math.PI;
};

function Mine () {
	this.x = randi(0, document.getElementById("canvas").width);
	this.y = randi(0, document.getElementById("canvas").height);
	
	var c = document.getElementById("canvas");
	this.ctx = c.getContext("2d");
	
	this.show();
}

Mine.prototype.show = function () {
	this.ctx.beginPath();
	this.ctx.fillStyle = "gray";
	this.ctx.arc(this.x, this.y , 2, 0, Math.PI*2, false);
	this.ctx.fill();
};