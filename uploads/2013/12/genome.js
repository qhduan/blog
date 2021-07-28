if(requestAnimationFrame === undefined) {
	requestAnimationFrame = function (fun) {
		setTimeout(fun, 15);
	};
}

function Genome () {
	this.tanks = [];//坦克数组
	this.mines = [];//地雷数组
	this.stop = false;//停止标志
	this.minecount = 40;//地雷数量
	this.tankcount = 16;//坦克数量
	this.tankfinish = this.tankcount;//完成任务的坦克数量（在worker执行完的）
	this.frame = 500;//多少代更新一次排名颜色
	this.record = [];//得分记录
	
	this.save = [];
	
	while(this.mines.length < this.minecount) {
		var mine = new Mine();
		this.mines.push(mine);
	}
	
	var that = this;
	
	//开始初始化
	while(this.tanks.length < this.tankcount) {
		var tank = new Tank();//一个坦克绘图和位置类
		var worker = new Worker("ai.js");
		
		this.tanks.push({tank: tank, score: 0, ai: worker});//加入列表
		
		//处理worker返回来的数据
		worker.onmessage = function (event) {
			var id = parseInt(event.data[0]);
			var method = event.data[1];
			
			if(method === "update") {
				var output = event.data[2];
				var input = event.data[3]
				
				var speed = Math.abs(output[0]) * 2;
				var rotate = output[1] * Math.PI * 0.2;
				
				that.tanks[id].tank.turn(rotate);
				that.tanks[id].tank.go(speed);
				
				if(!that.tanks[id].lastMove)
					that.tanks[id].lastMove = [];
				that.tanks[id].lastMove.push([input, output]);
				
				if(that.tanks[id].lastMove.length > 3) {
					that.tanks[id].lastMove.splice(0,1);
				}
				
				that.tankfinish++;
			}
		};
		
		worker.onerror = function (event) {
			console.log("Worker error", event);
			event.target.terminate();
			that.stop = true;
		};
	}
}

//一代之后显示分数
Genome.prototype.show = function () {
	var out = [];
	var sum = 0;
	for(var i in this.tanks) {
		if(out.length < 5)
			out.push(this.tanks[i].score);
		sum += this.tanks[i].score;
	}
	this.record.unshift("前五得分：" + out + "\t\t\t共得分：" + sum + "\t\t平均：" + (sum/this.tanks.length).toFixed(1));
	
	var t = "";
	for(var i in this.record) {
		t = t + "第" + (this.record.length - parseInt(i)) + "代\t" + this.record[i] + "\n";
	}
	document.getElementById("scores").innerHTML = t;
		
};

Genome.prototype.execute = function () {
	var count = 0;
	var that = this;
	
	function run() {
		if(that.tankfinish !== that.tankcount) {
			requestAnimationFrame(run);
		} else {
			ClearCanvas();
			for(var i in that.tanks) {
				that.tanks[i].tank.show();
			}
			count++;
					
			if(count % that.frame === 0) {
				that.tanks.sort(function (a, b) {
					return b.score - a.score;
				});
				
				that.show();
				
				var colors = ["gold", "red", "purple", "blue"];
				for(var i = 0;i < 4;i++) {
					that.tanks[i].tank.color(colors[i]);
					that.tanks[i].score = 0;;
				}
				
				for(var i = 4;i < that.tanks.length;i++) {
					that.tanks[i].tank.color("green");
					that.tanks[i].score = 0;
					
					if((that.tanks.length - i) <= 4)
						that.tanks[i].ai.postMessage([i, "refresh"]);
				}
				
			} else {
				that.update();
			}
			
			if(that.stop) {
				that.stop = false;
			} else {
				requestAnimationFrame(run);
			}
		}
	}
	
	run();
};

//寻找针对某个坦克的最近的地雷
Genome.prototype.getNearestMine = function (tank) {
	var nearestMineX;
	var nearestMineY;
	var nearestMineId;
	var nearestDistance = Infinity;
	for(var i = 0;i < this.mines.length;i++) {
	
		var ta = this.mines[i].x - tank.x;
		var tb = this.mines[i].y - tank.y;
		
		if(ta > nearestDistance || tb > nearestDistance)
			continue;
		
		var distance = Math.sqrt(ta*ta + tb*tb);
		
		if(distance < nearestDistance) {
			nearestDistance = distance;
			//获得一个以当前坦克位置为起点，最近地雷位置为重点的“方向向量”
			nearestMineX = tank.x - this.mines[i].x;
			nearestMineY = tank.y - this.mines[i].y;
			nearestMineId = i;
		}
	}
	
	//将这个最近地雷的方向向量标准化
	var length = Math.sqrt(nearestMineX*nearestMineX + nearestMineY*nearestMineY);
	nearestMineX /= length;
	nearestMineY /= length;
	
	return {distance: nearestDistance, x: nearestMineX, y: nearestMineY, id: nearestMineId};
};

Genome.prototype.update = function () {
	for(var i = 0;i < this.tanks.length;i++) {
	
		var nearestMine = this.getNearestMine(this.tanks[i].tank);
		while(nearestMine.distance <= 6) {//如果找到的地雷太近，就表示吃到地雷
			this.tanks[i].score++;
			
			//吃到地雷的车向其他车分享经验
			if(this.tanks[i].lastMove !== undefined && this.tanks[i].lastMove !== undefined && this.tanks[i].lastMove.length === 3) {
				this.tanks[i].lastMove.splice(0,1);
				for(var k = 0;k < this.tanks.length;k++) {
					//第i辆坦克向其他坦克传授经验
					//如果第k辆坦克分数比第i辆高，则不学（好车不随便学比自己弱的）
					if(k !== i && this.tanks[k].score <= this.tanks[i].score && Math.random() > 0.5)
						this.tanks[k].ai.postMessage([k, "bp", this.tanks[i].lastMove]);
				}
				this.tanks[i].lastMove = [];
			}
			
			//删除吃到的地雷
			this.mines.splice(nearestMine.id, 1);
			
			//寻找另一个最近的地雷
			nearestMine = this.getNearestMine(this.tanks[i].tank);
		}
		
		//将坦克当前的“视线方向”转换为单位向量
		var x = Math.cos(this.tanks[i].tank.angle);
		var y = Math.sin(this.tanks[i].tank.angle);
		
		var sign = -1;
		if(y*nearestMine.x > x*nearestMine.y)
			sign = 1;
		
		var dot = x * nearestMine.x + y * nearestMine.y;
		
		var input = [dot * sign];
		
		this.tankfinish--;
		this.tanks[i].ai.postMessage([i, "update", input]);
	}
	
	while(this.mines.length < this.minecount) {
		var mine = new Mine();
		this.mines.push(mine);
	}
	
	for(var i in this.mines) {
		this.mines[i].show();
	}
};