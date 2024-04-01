// This example uses two charRNN models, and asks them to generate sentences using the other model's previous output as a seed
// p5.speech is used to give each model a voice

let charRNNOne; // Container for the first model
let charRNNTwo; // Container for the second model

let bttn;

let seedOne = "The role of a woman is "; // The first model will use this as the seed in the first round, the seed will update once Model Two has said something 
let seedTwo; // To store seeds for Model Two, which is based on what Model One said in the previous round

let textOne; // To store generated text from the first model
let textTwo; // To store generated text from the second model

let voice = new p5.Speech(); // for p5 speech synthesis

let messages = []; //Storing text in array

let backimg; //Background image 

let scrollOffset = 0; //making the messages scrollable 

let introText = "This is a chat conversation between two outstanding women writers, Virginia Woolf and Zora Neale Hurston. Sources of data: https://github.com/ml5js/ml5-data-and-models/tree/main/models/charRNN";


function preload() {
  // Load the Woolf model into the first one
  charRNNOne = ml5.charRNN("https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/woolf");
  // Load the Charlotte Bronte model into the second one
  charRNNTwo = ml5.charRNN("https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/zora_neale_hurston");
  
  backimg = loadImage('Image.jpeg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(backimg);
  bttn = createButton("CHAT");
  bttn.position(windowWidth / 2, height / 7-40);
  // Styling the button
  bttn.style('background-color', '#8ca494'); // A soft green that might be found in the lighter areas of foliage
  bttn.style('color', '#3E4C47'); // A darker green for contrast, inspired by the shadows among the leaves
  bttn.style('font-size', '16px');
  bttn.style('font-weight', 'bold');
  bttn.style('padding', '10px 20px');
  bttn.style('border', '2px solid #769F7C'); // A mid-tone green, as might be found in the midground foliage
  bttn.style('border-radius', '10px');
  bttn.style('cursor', 'pointer');
  bttn.style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)'); // A subtle shadow for depth
  bttn.style('transition', 'transform 0.2s, box-shadow 0.2s'); // Smooth transform for interactions

  bttn.mousePressed(generateTextOne); // when the button is pressed, Model One will first generate something
}

//MODEL 1 (Woolf)

function generateTextOne() {
  //Setting up the options for text generation 
  let options = {
  seed: seedOne,
  temperature: 0.5,
  length: 200
}
//let the first model (Woolf) generate some text
charRNNOne.generate(options, gotDataOne);
}

let isFirstMessageFromWoolf = true; // Making the seedone text appear only in the first message 

function gotDataOne(err, result) {
  console.log(err); // send the error to the console if there's any error
  console.log(result); // look at the result in the console
  textOne = result.sample; // pass the result to the global variable, the text is nested under "sample"
  //Note that the result string is nested under the property "sample"

  //Optimizing the result by having it stop at any period mark
  // We can refine the result by telling it to show text before the first period, to avoid incomplete sentences (most of the time) 
  let periodIndex = textOne.indexOf('.'); // indexOf is a javascript method for finding the index number of a specific element
  // If a period is found, truncate the text up to that point
  if (periodIndex !== -1) { // -1 means the element is not found
    textOne = textOne.substring(0, periodIndex + 1); //The substring method in JavaScript is used to extract a portion of a string 
    // and return a new string. It takes two arguments: the starting index and the ending index (optional). 
  }
  
  // If this is the first message from Woolf, prepend the seedOne text
  if (isFirstMessageFromWoolf) {
    textOne = "The role of a woman is " + textOne; // Prepend the seedOne text only for the first message
    isFirstMessageFromWoolf = false; // Update the flag so this does not happen again
  }

  messages.push({text: textOne, speaker: "Virginia"});// Woolf is the first model\
  
  voice.stop(); // stop any current utterance if any (to avoid adding too much to the queue)
  voice.setVoice("Martha");
  voice.speak(textOne);
  seedTwo = textOne; // Pass what the first model says into the seed for Model Two
  setTimeout(generateTextTwo, 7000); // After 7 seconds, let model 2 generate
}


//MODEL 2 (Bronte)

function generateTextTwo() {
  let options = {
    seed: seedTwo,
    temperature: 0.5,
    length: 200
  }
  //let the second model generate some text
  charRNNTwo.generate(options, gotDataTwo);
}
function gotDataTwo(err, result) {
  console.log(err); // send the error to the console if there's any error
  console.log(result); // look at the result in the console
  textTwo = result.sample; // pass the result to the global variable, the text is nested under "sample"

  // We can refine the result by telling it to show text before the first period, to avoid incomplete sentences (most of the time) 
  let periodIndex = textTwo.indexOf('.'); // indexOf is a javascript method for finding the index number of a specific element
  // If a period is found, truncate the text up to that point
  if (periodIndex !== -1) { // -1 means the element is not found
    textTwo = textTwo.substring(0, periodIndex + 1); //The substring method in JavaScript is used to extract a portion of a string 
    // and return a new string. It takes two arguments: the starting index and the ending index (optional). 
  }
  //createP("Charlotte Bronte: " + textTwo); // Bronte is the second model
  messages.push({text: textTwo, speaker: "Zora"});
  voice.setVoice("Nicky");
  voice.speak(textTwo);
  seedOne = textTwo; // Update seedOne with what Model Two (Bronte) says
}

function mouseWheel(event) {
  scrollOffset += event.delta;
  // Constrain the scrollOffset to prevent scrolling too far
  scrollOffset = constrain(scrollOffset, -10000, 0); // Adjust -10000 based on your content length
}

function draw() {
  background(backimg);
 // Calculate introText position based on scrollOffset
 let introTextY = 10 + scrollOffset; // Start intro text 10 pixels down from top, adjusted by scrollOffset

 // Check if introTextY is above a certain point before drawing (optional)
 if (introTextY > -100) { // Adjust based on your needs
   // Draw the intro text box
   fill(243, 207, 198); // White background for the text box
   rect(5, introTextY, windowWidth - 15, 40); // Position based on introTextY
 
   // Set text properties for intro text
   fill(0); // Black text
   textSize(16); 
   textAlign(LEFT, TOP);
   text(introText, 20, introTextY + 10, windowWidth - 40, 40); // Position text inside the box
 }

  textSize(14); // Assuming this is the text size used for all messages
  let y = 130 + scrollOffset; // Start drawing messages from this y-coordinate
  
  messages.forEach(message => {
    let textWidth = 450; // Width constraint for the text
    let margin = 20; // Margin around the text within the rectangle
    let nameHeight = 20;
    
    // Calculate the height of the text for the given width and size
    let textHeight = textHeightForMessage(message.text, textWidth - margin * 2) + margin * 2;
    
    let x;
    if (message.speaker === "Zora") {
      x = (windowWidth / 2) - textWidth - 50;
    } else {
      x = (windowWidth / 2) + 50;
    }

    text(message.speaker, x, y); // Display the speaker's name
    y += nameHeight; // Move down for the message box


    fill(243, 207, 198); // Light grey background for the text box, adjust as needed
    rect(x, y, textWidth, textHeight, 20); // Use the dynamically calculated textHeight

    fill(0); 
    text(message.text, x + margin, y + margin, textWidth - margin * 2); 

    y += textHeight + 20; // Moving y down for the next message, with some spacing
  });
}


// Function to estimate the height of the text based on width constraint
function textHeightForMessage(message, constrainedWidth) {
  let lines = message.split('\n'); // Splitting by newline characters if any
  let totalHeight = 0;
  
  // Temporary canvas for measuring text
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = '14px Arial'; // Match the font size and family used in draw()

  lines.forEach(line => {
    let words = line.split(' ');
    let lineString = '';

    words.forEach(word => {
      let testLine = lineString + word + ' ';
      let metrics = tempCtx.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > constrainedWidth && lineString.length > 0) {
        totalHeight += 16; // Approximately one line height, adjust as needed
        lineString = word + ' ';
      } else {
        lineString = testLine;
      }
    });

    totalHeight += 16; // Add the final line's height
  });

  return totalHeight;
}
