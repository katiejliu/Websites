//Blow a kiss and say something!

//code modified from Q
//hearts from https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg

let video;
let poseNet;
let pose;
let skeleton;
var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
var myVoice = new p5.Speech(); // new P5.Speech object

myRec.continuous = true;

let handpose;
let predictions = [];

let brain;
let poseLabel;

let state = "waiting";
let targetLabel;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelLoaded);
  handpose.on("predict", (results) => {
    predictions = results;
  });
  textAlign(CENTER, CENTER);
  textSize(32);

  text("say something", width / 2, height / 2);
  myRec.start();

  myVoice.speak("say something");

  let options = {
    inputs: 42,
    outputs: 2,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model.json",
    metadata: "model_meta.json",
    weights: "model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log("pose classification ready!");
  classifyPose();
}

function classifyPose() {
  if (predictions.length > 0) {
    let inputs = [];
    for (let j = 0; j < predictions[0].landmarks.length; j += 1) {
      const keypoint = predictions[0].landmarks[j];
      inputs.push(keypoint[0]);
      inputs.push(keypoint[1]);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(results[0].confidence);
  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

// function gotPoses(poses) {
//   //console.log(poses);
//   if (poses.length > 0) {
//     pose = poses[0].pose;
//     skeleton = poses[0].skeleton;
//   }
// }

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (predictions.length > 0) {
    for (let j = 0; j < predictions[0].landmarks.length; j += 1) {
      const keypoint = predictions[0].landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textAlign(CENTER, CENTER);

  //   image(video, 0, 0);
  filter(GRAY);

  // if (pose) {
  //      ellipse(pose.leftWrist.x,pose.leftWrist.y+50,20);
  // ellipse(pose.nose.x, pose.nose.y,20);
  // console.log(pose.nose.y + " " + pose.rightWrist.y);
  if (poseLabel == "K") {
    // console.log("a hand is above the nose");
  } else if (poseLabel == "B") {
    // fill(255);
    // let size = pose.leftWrist.x - pose.rightWrist.x;
    // console.log("left:" + pose.leftWrist.x);
    // console.log("right:" + pose.rightWrist.x);
    // textSize(size);

    // stroke(255,0,128)

    for (var x = 50; x <= width; x += 50) {
      for (var y = 20; y <= height; y += 50) {
        fill(255, random(255), 255, 100);
        heart(x, y, 20);
      }
      fill(255);
      text(myRec.resultString, width / 2, 300);

      // fill(255,155,206);
    }

    // heart(width/2,200,20);
    // heart(pose.rightEye.x,pose.rightEye.y,20);
    stroke(255, 155, 206);
    fill(255, 0, 128);
  }
  // console.log(pose.leftWrist.y);
  // console.log(pose.nose.y);
}

function heart(x, y, size) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
}

function touchStarted() {
  getAudioContext().resume();
}

