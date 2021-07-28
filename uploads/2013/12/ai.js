/*

	矩阵部分

 */
 
//Matrix() 构造函数 Matrix(Array), Matrix(Array(Array)), Matrix(height, width), Matrix(height, width, value)
function Matrix () {
	if(arguments.length === 1) {
		var array = arguments[0];
		if(typeof array === "object" && typeof array.length === "number") {
			if(typeof array[0] === "object" && typeof array[0].length === "number") {//2 dimension
				this.height = array.length;
				this.width = array[0].length;
			
				for(var i = 0;i < array.length;i++) {
					this[i] = array[i].slice(0);
				}
			} else {//1 dimension
				this.height = 1;
				this.width = array.length;
				this[0] = array.slice(0);
			}
		} else {
			console.log("Matrix initiate array error");
		}
	} else if (arguments.length === 2 || arguments.length === 3) {
		var value = 0;		
		this.height = arguments[0];
		this.width = arguments[1];
		if(arguments.length === 3)
			value = arguments[2];
		for(var i = 0;i < this.height;i++) {
			var t = [];
			for(var j = 0;j < this.width;j++)
				t.push(value);
			this[i] = t;
		}
		
	} else {
		console.log("Matrix initiate error");
	}
};

//将自己转化为一个二维数组或一维数组(如果只有一行)
Matrix.prototype.array = function () {
	if(this.height === 1)
		return this[0].slice();

	var temp = [];
	for(var i = 0;i < this.height;i++) {
		temp.push(this[i].slice());
	}
	return temp;
};

//克隆一个自己
Matrix.prototype.clone = function () {
	return new Matrix(this.array());
};

//使用回调元素遍历元素，或给所有元素都赋一个特定值
//callback = function (element, i, j, matrix) {}
//callback如果有返回值，会被设定为matrix[i][j]的值
Matrix.prototype.each = function (n) {
	return this.clone()._each(n);
};

//前面带下划线“_”的函数代表这个函数会对矩阵本身进行修改，否则代表不会对自身进行修改而是返回一个修改后的克隆
Matrix.prototype._each = function (n) {
	if(typeof n === "number") {
		for(var i = 0;i < this.height;i++) {
			for(var j = 0;j < this.width;j++) {
				this[i][j] = n;
			}
		}
		return this;
	} else if(typeof n === "function") {
		for(var i = 0;i < this.height;i++) {
			for(var j = 0;j < this.width;j++) {
				var r = n(this[i][j], i, j, this);
				if(typeof r === "number")
					this[i][j] = r;
			}
		}
		return this;
	} else {
		console.log("Matrix each Error");
		return;
	}
};

//返回某一行
Matrix.prototype.row = function (n) {
	if(typeof n !== "number" || n < 0 || n >= this.height) {
		console.log("Matrix row Error");
		return;
	}
	return this[n].slice();
};

//返回某一列
Matrix.prototype.col = function (n) {
	if(typeof n !== "number" || n < 0 || n >= this.width) {
		console.log("Matrix col Error");
		return;
	}
	var temp = [];
	for(var i = 0;i < this.height;i++) {
		temp.push(this[i][n]);
	}
	return temp;
};

//删除某一行
Matrix.prototype.rrow = function (n) {
	return this.clone()._rrow(n);
};

//删除某一列
Matrix.prototype.rcol = function (n) {
	return this.clone()._rcol(n);
};

Matrix.prototype._rrow = function (n) {
	if(typeof n !== "number" || n < 0 || n >= this.height) {
		console.log("Matrix rrowe Error");
		return;
	}
	this.height--;
	for(var i = n;i < this.height;i++) {
		this[i] = this[i + 1];
	}
	delete this[this.height];
	return this;
};

Matrix.prototype._rcol = function (n) {
	if(typeof n !== "number" || n < 0 || n >= this.width) {
		console.log("Matrix rcole Error");
		return;
	}
	for(var i = 0;i < this.height;i++) {
		this[i].splice(n, 1);
	}
	this.width--;
	return this;
};

//返回一个余子式
Matrix.prototype.cofactor = function (i, j) {
	var temp = this.clone();
	temp._rrow(i)._rcol(j);
	return temp;
};

//在console打印矩阵
Matrix.prototype.print = function () {
	var out = "[";
	for(var i = 0;i < this.height;i++) {
		for(var j = 0;j < this.width;j++) {
			out += this[i][j] + ",";
		}
		out = out.slice(0, out.length - 1);
		out += "\n";
	}
	out = out.slice(0, out.length - 1);
	out += "]";
	console.log(out);
	return out;
};

//Matrix transposition 矩阵转置
Matrix.prototype.tran = function () {
	return this.clone()._tran();
};

Matrix.prototype._tran = function () {
	var temp = this.clone();
	for(var i = 0;i < this.height;i++)
		delete this[i];
	this.height = temp.width;
	this.width = temp.height;
	for(var i = 0;i < this.height;i++) {
		this[i] = new Array(this.width);
		for(var j = 0;j < this.width;j++) {
			this[i][j] = temp[j][i];
		}
	}
	return this;
};

//Matrix determinant 取矩阵的行列式
Matrix.prototype.det = function () {
	if(this.width !== this.height) {
		console.log("Matrix det Error");
		return;
	}
	if(this.width === 1) {
		return this[0][0];
	} else if (this.width === 2) {
		return this[0][0] * this[1][1] - this[0][1] * this[1][0];
	} else if (this.width === 3) {
		var t = 0;
		t += this[0][0] * this[1][1] * this[2][2];
		t += this[0][1] * this[1][2] * this[2][0];
		t += this[0][2] * this[1][0] * this[2][1];
		t -= this[0][2] * this[1][1] * this[2][0];
		t -= this[1][2] * this[2][1] * this[0][0];
		t -= this[2][2] * this[0][1] * this[1][0];
		return t;
	} else {
		var t = 0;
		for(var i = 0;i < this.height;i++) {
			if(this[i][0] === 0)
				continue;
			else {
				var temp = this.cofactor(i, 0);
				t += Math.pow(-1, i) * this[i][0] * temp.det();
			}
		}
		return t;
	}
};
	
//Matrix inverse 矩阵取逆
Matrix.prototype.inv = function () {
	return this.clone()._inv();;
};

Matrix.prototype._inv = function () {
	if(this.width !== this.height) {
		console.log("Matrix inve w!=h Error");
		return;
	}
	var det = this.det();
	if(det === 0) {
		console.log("Matrix inve det=0 Error");
		return;
	}
	det = 1/det;
	
	var temp = this.clone();
	this._each(function (element, i, j) {
		return Math.pow(-1, i + j) * temp.cofactor(i, j).det() * det;
	});
	
	return this._tran();
}

//Matrix addition 矩阵元素加
Matrix.prototype.add = function(other) {
	return this.clone()._add(other);
};

Matrix.prototype._add = function(other) {
	if(typeof other === "number") {
		return this._each(function (element, i, j) {
			return element + other;
		});
	} else {
		if((this.width !== other.width) || (this.height !== other.height)) {
			console.log("Matrix adde Error", this, other);
			return;
		}
		return this._each(function (element, i, j) {
			return element + other[i][j];
		});
	}
};

//Matrix subtraction 矩阵元素减
Matrix.prototype.sub = function(other) {
	return this.clone()._sub(other);
}

Matrix.prototype._sub = function(other) {
	if(typeof other === "number") {
		return this._each(function (element, i, j) {
			return element - other;
		});
	} else {
		if((this.width !== other.width) || (this.height !== other.height)) {
			console.log("Matrix sube Error", this, other);
			return;
		}
		return this._each(function (element, i, j) {
			return element - other[i][j];
		});
	}
};

//Matrix multiplication 矩阵乘法（非元素乘）
Matrix.prototype.mul = function(other) {
	return this.clone()._mul(other);
};

Matrix.prototype._mul = function(other) {
	if(typeof other === "number") {
		return this._each(function (element, i, j) {
			return element * other;
		});
	} else {
		if(this.width !== other.height) {
			console.log("Matrix mule Error", this, other);
			return;
		}
		var temp = this.clone();
		for(var i = 0;i < this.height;i++)
			delete this[i];
		
		this.width = other.width;
		
		for(var i = 0;i < this.height;i++) {
			this[i] = new Array(this.width);
		}
		
		return this._each(function (element, i, j) {
			var a = temp.row(i);
			var b = other.col(j);
			var t = 0;
			for(var k = 0;k < a.length;k++)
				t += a[k] * b[k];
			return t;
		});
	}
}

//Matrix dot multiplication 矩阵元素乘（点乘）
Matrix.prototype.dot = function (other) {
	return this.clone().dote(other);
};

Matrix.prototype.dote = function (other) {
	if((this.width !== other.width) || (this.height !== other.height)) {
		console.log("Matrix dote Error", this, other);
		return;
	}
	
	this._each(function (element, i, j) {
		return element * other[i][j];
	});
	return this;
};

/*

	Ann部分
	单隐藏层神经网络

 */

function randf(a, b) {
	if(a === undefined)
		a = 0;
	if(b === undefined)
		b = 1;
	return Math.random() * (b - a) + a;
}

function randi(a, b) {
	return parseInt(randf(a, b));
}

if(Math.tanh === undefined) {
	Math.tanh = function (n) {
		var a = Math.exp(n);
		var b = Math.exp(-n);
		return (a-b)/(a+b);
	};
}

function sigmoid(i) {
	return Math.tanh(i);
}

function dsigmoid(i) {
	var r = Math.tanh(i);
	return 1 - (r * r);
}

//Artificial Neural Network
function Ann (input, hidden, output) {
	this.input = input;
	this.hidden = hidden;
	this.output = output;
	
	this.alpha = 1;//学习率
	this.lambda = 0.000001;//防止overfitting的参数
	this.count = 0;
	this.error = 0;
	
	this.hiddenWeight = new Matrix(input, hidden);
	this.hiddenBias = new Matrix(1, hidden);
	this.outputWeight = new Matrix(hidden, output);
	this.outputBias = new Matrix(1, output);
	
	this.outputWeightDelta = new Matrix(this.outputWeight.height, this.outputWeight.width, 0);
	this.outputBiasDelta  = new Matrix(this.outputBias.height, this.outputBias.width, 0);
	this.hiddenWeightDelta = new Matrix(this.hiddenWeight.height, this.hiddenWeight.width, 0);
	this.hiddenBiasDelta = new Matrix(this.hiddenBias.height, this.hiddenBias.width, 0);
	
	var temp = function () {
		return randf(-0.5, 0.5);
	};
	
	this.hiddenWeight._each(temp);
	this.hiddenBias._each(temp);
	this.outputWeight._each(temp);
	this.outputBias._each(temp);
}

//forwardPropagate
Ann.prototype.fp = function (input) {
	input = new Matrix(input);
	
	this.z1 = input.mul(this.hiddenWeight).add(this.hiddenBias);
	this.a1 = this.z1.each(sigmoid);
	
	this.z2 = this.a1.mul(this.outputWeight).add(this.outputBias);
	this.a2 = this.z2.each(sigmoid);
	
	return this.a2.array();
};

//backpropagation
Ann.prototype.bp = function (input, object) {
	this.fp(input);
	input = new Matrix(input);
	object = new Matrix(object);
	
	//使用目标值和输出层输出值z2、a2来计算“输出层偏置”
	var outputDelta = object.sub(this.a2).dot(this.z2.each(dsigmoid)).mul(-1);
	
	//使用“输出层偏置”，输出层权重和隐藏层输出z1计算“隐藏层偏置”
	var hiddenDelta = this.outputWeight.mul(outputDelta.tran()).tran().dot(this.z1.each(dsigmoid));
	
	this.outputWeightDelta._add(outputDelta.tran().mul(this.a1).tran());
	this.outputBiasDelta._add(outputDelta);
	
	this.hiddenWeightDelta._add(hiddenDelta.tran().mul(input).tran());
	this.hiddenBiasDelta._add(hiddenDelta);
	
	this.count++;
	var error = 0;
	object.sub(this.a2).each(function (element) {error += 0.5 * Math.pow(element, 2)});
	
	this.error += error;
};

Ann.prototype.doupdate = function () {
	this.outputWeight._sub(this.outputWeightDelta.mul(1/this.count).add(this.outputWeight.mul(this.lambda)).mul(this.alpha));
	this.outputBias._sub(this.outputBiasDelta.mul(this.alpha / this.count));
	
	this.hiddenWeight._sub(this.hiddenWeightDelta.mul(1/this.count).add(this.hiddenWeight.mul(this.lambda)).mul(this.alpha));
	this.hiddenBias._sub(this.hiddenBiasDelta.mul(this.alpha / this.count));
};

Ann.prototype.update = function () {
	
	var error = this.error / this.count;
	
	this.doupdate();
	
	this.outputWeightDelta._each(0);
	this.outputBiasDelta._each(0);
	this.hiddenWeightDelta._each(0);
	this.hiddenBiasDelta._each(0);
	
	this.count = 0;
	this.error = 0;
	return error;
};

Ann.prototype.clone = function () {
	var temp = new Ann(this.input, this.hidden, this.output);
	
	temp.alpha = this.alpha;
	temp.lambda = this.lambda;
	temp.error = this.error;
	
	temp.hiddenWeight = this.hiddenWeight.clone();
	temp.hiddenBias = this.hiddenBias.clone();
	temp.outputWeight = this.outputWeight.clone();
	temp.outputBias = this.outputBias.clone();
	
	temp.outputWeightDelta = this.outputWeightDelta.clone();
	temp.outputBiasDelta = this.outputBiasDelta.clone();
	temp.hiddenWeightDelta = this.hiddenWeightDelta.clone();
	temp.hiddenBiasDelta = this.hiddenBiasDelta.clone();
	temp.count = this.count;
	
	return temp;
};

var nerve = new Ann(1, 10, 2);

self.onmessage = function (event) {
	var id = event.data[0];
	var method = event.data[1];
	var data = event.data[2];
	
	if(method === "update") {
		var output = nerve.fp(data);
		self.postMessage([id, method, output, data]);
	} else if (method === "bp") {
		for(var i = 0;i < data.length;i++) {
			nerve.bp(data[i][0], data[i][1]);
			nerve.bp(data[i][0], data[i][1]);
		}
		if(nerve.count/32 > Math.random()) {
			nerve.update();
		}
	} else if (method === "refresh") {
		nerve = new Ann(1, 10, 2);
	}
}

