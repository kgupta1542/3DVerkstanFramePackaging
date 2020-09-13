//UI Values
var boxX = document.getElementById("boxX").value;
var boxY = document.getElementById("boxY").value;
var boxZ = document.getElementById("boxZ").value;
var frameScale = document.getElementById("frame_scale").value;
var submit = document.getElementById("submit");

//Output DOM Rows
const stepOne = document.getElementById("step_one");
const remSpace = document.getElementById("rem_space");
const stepTwo = document.getElementById("step_two");
const totalFrames = document.getElementById("total_frames");
const packingEff = document.getElementById("packing_eff");

//Frame Default Measurements
var frame_X, frame_Y, frame_Z;
const kframe_X = 6.24;
const kframe_Y = 7.23;
const kframe_Z = 0.2;

//Frame Orientation Objects
var frame_x1, frame_x2, frame_y1, frame_y2, frame_z1, frame_z2;
var frameOrientations;
var kframeOrientations = [];

//Run Counter
var runCounter = 0;

submit.addEventListener("click", main, false);//Run calculations when user is ready

function main(){
	//Setup
	updateNumbers();//Update new numbers
	(runCounter === 0) ? setOrientationTypes() : console.log("Orientations Already Set.");//Create objects for orientation types
	runCounter++;
	frameOrientations = filterOrientations(boxZ);
	
	//Base Orientation Density Calculation
	var maxBaseDensityOrientationIndex = 0;
	var maxBaseDensity = 0;
	var currOrientation;
	
	for(var i = 0; i < frameOrientations.length; i++){
		currOrientation = frameOrientations[i];
		var currDensity = Math.floor(currOrientation.numFit(boxX,boxY)/currOrientation.z*10)/10;
		maxBaseDensityOrientationIndex = (currDensity > maxBaseDensity) ? currOrientation.pos : maxBaseDensityOrientationIndex;
		maxBaseDensity = (currDensity > maxBaseDensity) ? currDensity : maxBaseDensity;
	}
	
	var maxBaseDensityOrientation = kframeOrientations[maxBaseDensityOrientationIndex];
	
	//Packaging Step One
	stepOneX = Math.floor(boxX/maxBaseDensityOrientation.x);
	stepOneY = Math.floor(boxY/maxBaseDensityOrientation.y);
	stepOneZ = Math.floor(boxZ/maxBaseDensityOrientation.z);
	stepOneTotal = stepOneX*stepOneY*stepOneZ;
	stepOneVolume = stepOneX*maxBaseDensityOrientation.x*stepOneY*maxBaseDensityOrientation.y*stepOneZ*maxBaseDensityOrientation.z;
	stepOne.children[maxBaseDensityOrientationIndex + 1].innerHTML = stepOneZ + " layer(s) of (" + stepOneX + " x " + stepOneY + ")";
	
	//Remaining Space Calculation
	remSpaceZ = Math.floor((boxZ - stepOneZ*maxBaseDensityOrientation.z)*10)/10;
	remSpace.children[maxBaseDensityOrientationIndex + 1].innerHTML = (remSpaceZ === 0) ? "None" : "(" + boxX + "in x " + boxY + "in) x " + remSpaceZ + "in";
	
	//Remaining Space Orientation Density Calculation
	frameOrientations = filterOrientations(remSpaceZ);
	console.log(frameOrientations);
	var maxRemDensityOrientationIndex = 0;
	var maxRemDensity = 0;
	
	for(i = 0; i < frameOrientations.length; i++){
		currOrientation = frameOrientations[i];
		currDensity = Math.floor(currOrientation.numFit(boxX,boxY)/currOrientation.z*10)/10;
		maxRemDensityOrientationIndex = (currDensity > maxRemDensity) ? currOrientation.pos : maxRemDensityOrientationIndex;
		maxRemDensity = (currDensity > maxRemDensity) ? currDensity : maxRemDensity;
	}
	
	var maxRemDensityOrientation = kframeOrientations[maxRemDensityOrientationIndex];
	
	//Packaging Step Two
	stepTwoX = Math.floor(boxX/maxRemDensityOrientation.x);
	stepTwoY = Math.floor(boxY/maxRemDensityOrientation.y);
	stepTwoZ = Math.floor(remSpaceZ/maxRemDensityOrientation.z);
	stepTwoTotal = stepTwoX*stepTwoY*stepTwoZ;
	stepTwoVolume = stepTwoX*maxRemDensityOrientation.x*stepTwoY*maxRemDensityOrientation.y*stepTwoZ*maxRemDensityOrientation.z
	stepTwo.children[maxRemDensityOrientationIndex + 1].innerHTML = (stepTwoZ === 0) ? "None" : stepTwoZ + " layer(s) of (" + stepTwoX + " x " + stepTwoY + ")";
	
	totalFrames.innerHTML = stepOneTotal + stepTwoTotal;
	packingEff.innerHTML = (stepOneVolume + stepTwoVolume)/(boxX*boxY*boxZ)
}

function updateNumbers(){
	boxX = document.getElementById("boxX").value;
	boxY = document.getElementById("boxY").value;
	boxZ = document.getElementById("boxZ").value;
	
	frameScale = document.getElementById("frame_scale").value;

	frame_X = frameScale*kframe_X/100;
	frame_Y = frameScale*kframe_Y/100;
	frame_Z = frameScale*kframe_Z/100;
	
	for(var i = 0; i < stepOne.children.length - 1; i++){
		stepOne.children[i+1].innerHTML = "";
		remSpace.children[i+1].innerHTML = "";
		stepTwo.children[i+1].innerHTML = "";	
	}
}

//Frame Orientation Class
class FrameUnit {
	constructor(pos,x,y,z){
		this.pos = pos;
		this.x = x;
		this.y = y;
		this.z = z;
	}
	numFit(kX,kY){
		return Math.floor(kX/this.x)*Math.floor(kY/this.y);
	}
}

function setOrientationTypes(){
	frame_x1 = new FrameUnit(0, frame_Z, frame_Y, frame_X);
	frame_x2 = new FrameUnit(1, frame_Z, frame_X, frame_Y);
	
	frame_y1 = new FrameUnit(2, frame_X, frame_Z, frame_Y);
	frame_y2 = new FrameUnit(3, frame_Y, frame_Z, frame_X);
	
	frame_z1 = new FrameUnit(4, frame_X, frame_Y, frame_Z);
	frame_z2 = new FrameUnit(5, frame_Y, frame_X, frame_Z);
	
	kframeOrientations = [frame_x1,frame_x2,frame_y1,frame_y2,frame_z1,frame_z2];
}

function filterOrientations(remZ){
	var frameOrientations = [];
	for(var i = 0; i < kframeOrientations.length; i++){
		if(kframeOrientations[i].z <= remZ){
			frameOrientations.push(kframeOrientations[i]);
		}
	}
	
	return frameOrientations;
}
