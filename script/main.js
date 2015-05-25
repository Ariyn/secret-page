//todo
/*
	Dump At Time
	read and write configure
*/

var processors = [], changing = null
var machine = {
	"memory":180,
	"device":12,

	"algorithm":"RR",
	"quantum":2,
	"priority":true,
	"changing":false,
	"readyOptimize":true,

	"tableInfo":[],
	"processor":[],

	"timeTable":{},
	"addTable": function(job, type) {
		if(this.time in this.timeTable == false)
			this.timeTable[this.time] = {}

		this.timeTable[this.time][job.number-1] = {"time":this.time, "job":job, "type":type}
	},

	"notInserted":[],
	"hold":[],
	"ready":[],
	"end":[],

	"exit":false,
	"started":false,
	"running":null,
	"lastChecked":0,

	"idleTime":0,
	"runTime":0,
	"time":0,

	"reset": function() {
		this.running = 0;
		this.tableInfo = []
		this.processor = []
		this.timeTable = []

		this.notInserted = []
		this.hold = []
		this.ready = []
		this.end = []

		this.exit = false
		this.running = null
		this.time = 0;
		this.lastChecked = 0;

		this.runTime = 0;
		this.idleTime = 0;
	},
	"readProcess":function() {
		for(var i in processors) {
			this.processor.push(processors[i])
		}
	},
	"testProcess":function() {
		// var x = new Process(1)
		// x.bustTime = 6
		// x.arrivedTime = 1
		// x.memory = 170
		// x.device = 4
		// x.priority = 1

		// var x2 = new Process(2)
		// x2.bustTime = 3
		// x2.arrivedTime = 3
		// x2.memory = 80
		// x2.device = 3
		// x2.priority = 3

		// var x3 = new Process(3)
		// x3.bustTime = 12
		// x3.arrivedTime = 2
		// x3.memory = 50
		// x3.device = 4
		// x3.priority = 2

		// var x4 = new Process(4)
		// x4.bustTime = 9
		// x4.arrivedTime = 14
		// x4.memory = 30
		// x4.device = 5
		// x4.priority = 1

		var x = new Process(1)
		x.bustTime = 7
		x.arrivedTime = 0

		var x2 = new Process(2)
		x2.bustTime = 4
		x2.arrivedTime = 2

		var x3 = new Process(3)
		x3.bustTime = 1
		x3.arrivedTime = 4

		var x4 = new Process(4)
		x4.bustTime = 4
		x4.arrivedTime = 5

		this.processor.push(x)
		this.processor.push(x2)
		this.processor.push(x3)
		this.processor.push(x4)

		refresh();
	},
	"calculateQuantum":function() {
		var ind = algorithms.indexOf(this.algorithm)

		if(ind == 0 || ind == 1 || ind == 3) {
			var max = 0;
			for(var i in this.processor) {
				if(max < this.processor[i].bustTime)
					max = this.processor[i].bustTime
			}

			this.quantum = max
		} else if(ind == 2){
			if(this.running)
				this.quantum = this.running.bustTime
			else if(0 < this.processor.length)
				this.quantum = this.processor[0].bustTime
		} else {
			this.quantum = 2
		}
		console.log(ind, this.quantum, processors)
	},
	"calculate": function() {
		var first = null, last = machine.time
		for(var i=0; i<last; i++) {
			if(i in this.timeTable){
				first = i
				break
			}
		}

		var turnaround = [], totalTurnaround = 0
		for(var i=0; i<this.processor.length; i++) {
			var p = this.processor[i]
			var t = p.endTime - p.arrivedTime

			turnaround.push(t)
			totalTurnaround += t
		}

		this.machineTurnaround = last - first
		this.throughtput = this.processor.length / totalTurnaround
		this.totalTurnaround = totalTurnaround
		this.turnaround = turnaround

		// alert(turnaround)
		// alert(throughtput)
		// alert(this.idleTime)
		// alert(this.runTime)
	}
}

function Process(number) {
	this.number = number;
	this.name = "P"+number
	this.selected = false

	this.arrivedTime = 0;
	this.bustTime = 0;
	this.priority = 0;
	this.memory = 0;
	this.device = 0;

	this.runningTime = 0;
	this.waitingTime = 0;
	this.inReadyTime = 0;

	this.isRunning = false;

	this.state = "not inserted"

	this.list = function() {
		return {
			"value":[this.name, this.arrivedTime, this.bustTime, this.priority, this.memory, this.device],
			"category":["name", "arrivedTime", "bustTime", "priority", "memory", "device"]
		};
	}

	this.reset = function() {
		this.endTime = 0;
		this.isRunning = false
		this.state = "not inserted"
		this.inReadyTime = 0
		this.waitingTime = 0
		this.runningTime = 0

		this.selected = false
	}

	this.fork = function() {
		if(this.arrivedTime <= machine.time) {
			var ind = machine.notInserted.indexOf(this)
			machine.hold.push(this)
			machine.notInserted.splice(ind, 1)
			this.state = "holding"
			machine.addTable(this, "fork")
		}
	}

	this.ready = function() {
		var retVal = false;

		if(this.memory <= machine.memory && this.device <= machine.device) {

			var ind = machine.hold.indexOf(this)
			//console.log(this.name, "in ready", machine.time, "ind", ind)

			machine.memory -= this.memory
			machine.device -= this.device

			machine.ready.push(this)
			machine.hold.splice(ind, 1)

			this.state = "in ready"
			machine.addTable(this, "ready")

			retVal = true;
		}

		return retVal;
	}

	this.timeTick = function() {
		if(this.state == "holding") {
			this.waitingTime += 1;
		} else if(this.state == "in ready") {
			this.inReadyTime += 1;
		} else if(this.state == "running") {
			this.runningTime += 1;
		}
	}

	this.awake = function() {
		if(!this.isRunning) {
			//console.log("run", this.name)

			machine.running = this
			this.isRunning = true
			this.state = "running"

			var ind = machine.ready.indexOf(this)
			machine.lastChecked = machine.time
			machine.ready.splice(ind,1)
			machine.addTable(this, "run")
		}
		//console.log(this.isRunning)
	}

	this.endOrSleep = function() {
		var retVal = false
		if(this.isRunning) {
			if(this.bustTime <= this.runningTime) {
				this.isRunning = false
				machine.running = null

				this.endTime = machine.time
				this.isEnded = true
				this.state = "end"

				machine.memory += this.memory
				machine.device += this.device

				machine.end.push(this)
				machine.addTable(this, "end")

				retVal = "end"
			} else if(machine.lastChecked + machine.quantum <= machine.time){
				this.isRunning = false
				machine.running = null

				machine.ready.push(this)
				this.state = "in ready"

				//console.log("lastChecked")
				machine.lastChecked = machine.time

				machine.addTable(this, "sleep")

				retVal = "sleep"
			}
		}
		return retVal;
	}
	return this;
}

var algorithms = ["FCFS", "SJF", "SRT", "NP", "RR"]
$("body").ready(init);

function init() {
	machine.readyOptimize = $("#MITTD_optiomize").is(":checked")
	machine.priority = $("#MITTD_priority").is(":checked")

	//console.log(machine.readyOptimize, machine.priority)
	

	$(".MITTD")
		.css("cursor", "pointer")
		.click(clickIT)

	$("#AddProcessorBtn")
		.click(function() {
			var number = processors.length+1
			var p = new Process(number)
			processors.push(p)

			refresh()
		})
	$("#MinusProcessorBtn")
		.click(function() {
			for(var i in processors) {
				if(processors[i].selected)
					processors.splice(i,1)
			}
			console.log(processors)
			$("#ProcessorTable>tbody").empty()
			refresh()
		})

	$("#runBtn").click(function() {
		if(!machine.started) {
			reset()
			
			machine.readProcess()
			// machine.testProcess()
			machine.calculateQuantum()

			console.log(machine.processor.length)

			for(var i in machine.processor) {
				machine.notInserted.push(machine.processor[i])
			}
			//console.log(machine.notInserted, machine.processor);

			machine.started = true
			run()
			printOutput()
			machine.started = false
		}
	})

	refresh()
}

function reset() {
	machine.reset()
	for(var i in processors)
		processors[i].reset()
	clearOutput()
}

function clickIT(event) {
	var object = $(this)
	console.log(object)
	var text = object.text()
	var target = object.attr("target")
	var type = object.attr("class").split(' ')[0]

	console.log(type, target, text, object)
	if(!machine.changing) {
		if(type == "MITTD") {
			if(target == "algorithm") {
				var ind = (algorithms.indexOf(text)+1)%algorithms.length
				machine.algorithm = algorithms[ind]
				machine.calculateQuantum()
			} else if(target == "priority") {
				machine.priority = !machine.priority
			} else if(target == "optimize") {
				machine.readyOptimize = !machine.readyOptimize
			} else {
				machine.changing = true
				changing = {"machine":machine, "target":target}
			}
		} else if(type == "PTTD") {
			if(target != "name") {
				machine.changing = true
				console.log("changing")
				// processors[object.parent().attr("index").valueOf()-1].change = target
				changing = {"process":processors[object.parent().attr("index").valueOf()-1], "target":target}
				
			} else {
				var p = object.parent(), ind = parseInt(p.attr("index"))

				if(p.hasClass("danger")) {
					p.removeClass("danger")
					processors[ind-1].selected = false
				} else {
					processors[ind-1].selected = true
					p.addClass("danger")
				}
			}
		}
	}
	refresh()
}

function ChangeMachineInfo(original) {
	console.log($(original),$(original).parent())
	var object = $(original), num = parseInt(object.val()) || 0, type = object.parent().attr("class").split(' ')[0], target=object.attr("target")
	//console.log("type", type)
	// //console.log(object.val(), num, object.attr("target"))
	if(type == "MITTD") {
		machine[target] = num

	} else if(type == "PTTD") {
		var ind = parseInt(object.attr("index"))
		//console.log("index",object.attr("index"))
		if(!isNaN(ind)) {
			processors[ind-1][target] = num
			console.log(processors[ind-1], target, processors[ind-1][target])	
		}
	}

	machine.changing = false

	refresh()
}

function refresh() {
	if(!machine.changing) {
		$(".MITTD:nth-child(2)").text(machine.memory)
		$(".MITTD:nth-child(3)").text(machine.device)
		$(".MITTD:nth-child(4)").text(machine.algorithm)
		$(".MITTD:nth-child(5)").text(machine.quantum)

		var num = $("#ProcessorTable>tbody").children().length
		for(var e=num; e<processors.length; e++) {
			var _e = e+1
			var p = processors[e], str = "<tr id=\"Process_"+p.number+"\" index=\""+ _e +"\">", list = p.list()
			
			for(var i in list["value"]) {
				str += "<td class=\"PTTD col-md-"

				if(i == 0) str+="1"
				else str+="2"

				str +="\" target=\""+list["category"][i]+"\" class=\"col-md-3\">"+list["value"][i]+"</td>"
			}
			str += "</tr>"

			$("#ProcessorTable tbody").append(str)
			$("#Process_"+p.number+">td")
				.click(clickIT)
				.css("cursor", "pointer")
		}
		if(changing) {
			if("process" in changing) {
				var p = changing["process"], target = changing["target"], ind = p.number
				var num = p.list()["category"].indexOf(target)+1

				$("#ProcessorTable tbody>tr:nth-of-type("+ind+")>td:nth-of-type("+num+")")
					.text(p[target])
			} else if("machine" in changing) {
				var m = changing["machine"], target = changing["target"]
				var num = {"memory":2, "device":3, "quantum":5}[target]

				$("#MachineInfoTable tbody>tr:nth-of-type("+1+")>td:nth-of-type("+num+")")
					.text(m[target])
			}

			changing = null
		}
	} else {
		if(changing) {
			if("process" in changing) {
				var p = changing["process"], target = changing["target"], ind = p.number
				var num = p.list()["category"].indexOf(target)+1

				$("#ProcessorTable tbody>tr:nth-of-type("+ind+")>td:nth-of-type("+num+")")
					.text("")
					.append("<input target=\""+target+"\" index=\""+ind+"\" class=\"MachineChangeNumber col-md-12\" type=\"number\" inputmode=\"numeric\" pattern=\"[0-9]*\" min=\"0\" width=\"100%\"/>")
			} else if("machine" in changing) {
				var m = changing["machine"], target = changing["target"]
				var num = {"memory":2, "device":3, "quantum":5}[target]

				$("#MachineInfoTable tbody>tr:nth-of-type(1)>td:nth-of-type("+num+")")
					.text("")
					.append("<input target=\""+target+"\" index=\""+ind+"\" class=\"MachineChangeNumber col-md-12\" type=\"number\" inputmode=\"numeric\" pattern=\"[0-9]*\" min=\"0\" width=\"100%\"/>")
			}

			$(".MachineChangeNumber")
				.focus()
				.focusout(function(event) {
					ChangeMachineInfo(this)
				})
				.keydown(function(event) {
					if(event.which == 13)
						ChangeMachineInfo(this)
				})
		}
	}

	if(machine.algorithm == "RR") {
		$("#MachineInfoTable thead td:nth-child(5)").css("visibility", "visible")
		$("#MachineInfoTable thead td:nth-child(6)").css("visibility", "visible")
		$(".MITTD:nth-child(5)").css("visibility", "visible")
		$(".MITTD:nth-child(6)").css("visibility", "visible")
	} else {
		$("#MachineInfoTable thead td:nth-child(5)").css("visibility", "hidden")
		$("#MachineInfoTable thead td:nth-child(6)").css("visibility", "hidden")
		$(".MITTD:nth-child(5)").css("visibility", "hidden")
		$(".MITTD:nth-child(6)").css("visibility", "hidden")
	}
}

function clearOutput() {
	$("#ProcessorRunTable > thead").empty()
	$("#ProcessorRunTable > tbody").empty()
}
function printOutput() {
	//console.log(machine.timeTable)
	machine.calculate()
	var pHead = "<td>#</td>"
	//$("#ProcessorTable > thead") <td>#</td><td>1</td><td>2</td><td>3</td>
	var pBody = ""
	// var pLen = machine.processor.length
	// $("#ProcessorRunTable > tbody")
	for(var i in machine.processor) {
		pHead += "<td>"+machine.processor[i].number+"</td>"
	}
	for(var i=0; i<machine.time; i++) {
		pBody += "<tr><td>"+i+"</td>"
		if(i in machine.timeTable == false) {
			for(var e in machine.processor) {
				pBody += "<td></td>"
			}
		} else {
			var x = machine.timeTable[i]
			var run = -1
			for(var e in machine.processor) {
				if(e in x) {
					pBody += "<td>"+x[e].type+"</td>"
				} else {
					pBody += "<td>"
					pBody +="</td>"
				}
			}
		}
		pBody += "</tr>"
	}

	$("#ProcessorRunTable > thead").append($(pHead))
	$("#ProcessorRunTable > tbody").append($(pBody))

	$("#ProcessorRunTable thead td")
		.css("cursor","pointer")
		.click(function() {
			var num = parseInt($(this).text())-1
			alert("turnaround"+machine.turnaround[num])
			alert("throughtput"+machine.throughtput)
			// alert("throughtput"+machine.throughtput)
		})

	$("#ProcessorRunTable thead td:hover")
		.css("text-decoration","underline")
}

/////////////////////////////////// ui source code end ///////////////////////////////////

////////////////////////////////// main algorithm start //////////////////////////////////

function run() {
	machine.time = 0
	for(machine.time; machine.time<200 && !machine.exit; machine.time++) {
		var num = machine.hold.length
		for(var i in machine.notInserted) {
			var p = machine.notInserted[i]
			p.fork();
		}

		var newSRT = false
		if(machine.hold.length != num)
			newSRT = SortHoldQue()
		
		for(var i in machine.hold) {
			var p = machine.hold[i]
			if(p.ready() && machine.readyOptimize)
				break;
		}

		if(machine.algorithm == "SRT")
			newSRT = SortHoldQue()

		if(machine.running) {
			if(newSRT)
				machine.quantum = 0

			var suc = machine.running.endOrSleep()

			if(machine.notInserted.length == 0 &&
				machine.hold.length == 0 &&
				machine.ready.length == 0 &&
				!machine.running) {
				machine.exit = true
			}
		}

		for(var i in machine.hold) {
			var p = machine.hold[i]
			if(p.ready() && machine.readyOptimize) {
				break;
			}
		}

		if(!machine.running) {
			var p = machine.ready[0]
			if(p) {
				p.awake()
				if(newSRT)
					machine.calculateQuantum()
			}
		}

		for(var i=0, e=machine.processor[0];i<machine.processor.length;i++,e=machine.processor[i]) {
			e.timeTick()
		}
		if(machine.running)
			machine.runTime += 1
		else if(!machine.exit) {
			machine.idleTime += 1
		}
	}
}

function SortHoldQue() {
	// if(machine.algorithm == "SRT") {
	// 	machine.hold.sort(function(a, b) {
	// 		return (a.bustTime-a.runningTime) - (b.bustTime-b.unningTime)
	// 	})

	// 	machine.ready.sort(function(a, b) {
	// 		console.log(a,b)
	// 		return (a.bustTime-a.runningTime) - (b.bustTime -b.runningTime)
	// 	})
	// 	return true
	// } else 
	if(machine.algorithm == "SJF") {
		machine.hold.sort(function(a, b) {
			return a.bustTime - b.bustTime
		})

		machine.ready.sort(function(a, b) {
			return a.bustTime - b.bustTime
		})
	} else if(machine.algorithm == "NP") {
		machine.hold.sort(function(a, b) {
			return a.priority - b.priority
		})

		machine.ready.sort(function(a, b) {
			return a.priority - b.priority
		})
	} else if(machine.algorithm == "RR") {
		if(machine.priority) {
			// //console.log(machine.time, "sort", machine.hold.length)
			// SortHoldQue_P(machine.hold)
			machine.hold.sort(function(a, b){
				return a.priority-b.priority
			})
			// //console.log(machine.hold, machine.hold.length, machine.ready)
		}
	}
	return false
}