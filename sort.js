"use strict";

// Visual elements
const divGraph = document.getElementById("graph");
const divSteps = document.getElementById("steps");
const playButton = document.getElementById("play");

// Resizing listener
const header = document.querySelector('header');
const settings = document.getElementById('settings');
const visual = document.getElementById('visual');

function adjustVisualHeight() {
    const headerHeight = header.offsetHeight;
    const settingsHeight = settings.offsetHeight;
    const headerMargin = parseInt(getComputedStyle(header).marginTop) + parseInt(getComputedStyle(header).marginBottom);
    const settingsMargin = parseInt(getComputedStyle(settings).marginTop) + parseInt(getComputedStyle(settings).marginBottom);
    const totalMargins = headerMargin + settingsMargin;
    const viewportHeight = window.innerHeight;
    visual.style.height = `${viewportHeight - headerHeight - settingsHeight - totalMargins}px`;
}
adjustVisualHeight();
window.addEventListener('resize', adjustVisualHeight);

let Shuffle = (n) => {
    let arr = [];
    let randint;
    for (let i=0; i<n; i++) {
        randint = Math.floor(Math.random() * 97 + 3)
        arr[i] = randint;
    }
    return arr;
}

let Reset = () => {
    isAnimating = false;
    playButton.disabled = false;
    values = Shuffle(n);
    Display();
    const copy = [...values];
    swaps = BubbleSort(copy);
    stepIndex = 0;
    divSteps.innerHTML = `Click "Step" for a walkthrough, or "Play" to see bubble sort in action!`
}

let Display = (highlight = [], highlightType = '') => {
    divGraph.innerHTML = "";
    let peak = Math.max(...values);
    for (let i = 0; i < values.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = (100 * (values[i] / peak)) + "%";
        bar.classList.add("bar");
        if (highlight.includes(i)) {
            if (highlightType === 'compare') {
                bar.classList.add("highlight-compare");
            } else if (highlightType === 'swap') {
                bar.classList.add("highlight-swap");
            }
        }
        divGraph.appendChild(bar);
    }
}

let BubbleSort = (arr) => {
    let swaps = [], swapped = true;
    while (swapped) {
        swapped = false;
        for (let i = 0; i < arr.length - 1; i++) {
            swaps.push({ type: 'compare', values: [arr[i], arr[i + 1]], indices: [i, i + 1] });
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swaps.push({ type: 'swap', values: [arr[i], arr[i + 1]], indices: [i, i + 1] });
                swapped = true;
            }
        }
    }
    return swaps;
}

function playTone(value) {
    // thank you chatgpt
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square'; // Type of wave: sine, square, triangle, sawtooth
    oscillator.frequency.setValueAtTime(300 + value * 9, audioContext.currentTime); // Base frequency + value for pitch
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.09); // Duration of the tone
}

let stepIndex = 0;
let isAnimating = false;

let Step = (loop = false) => {
    // if we're all done
    if (stepIndex >= swaps.length) {
        if (isAnimating) {
            divSteps.innerHTML += `<p>All done!</p>`;
            Display();
            playButton.disabled = false;
            divSteps.scrollTo({top: divSteps.scrollHeight, behavior: 'smooth'});
        }
        return;
    }

    isAnimating = loop;  // if we press step, the animation will stop
    playButton.disabled = loop; // if looping (animating), button should be disabled.
    const step = swaps[stepIndex];
    stepIndex++;

    if (step.type === 'compare') {
        divSteps.innerHTML += `<p>Step ${stepIndex}/${swaps.length}: Comparing ${step.values[0]} and ${step.values[1]}</p>`;
        Display(step.indices, 'compare');
        playTone((step.values[0] + step.values[1]) / 2);
    } else if (step.type === 'swap') {
        divSteps.innerHTML += `<p>Step ${stepIndex}/${swaps.length}: Swapping ${step.values[0]} and ${step.values[1]}</p>`;
        const [i, j] = step.indices;
        [values[i], values[j]] = [values[j], values[i]];
        Display(step.indices, 'swap');
        playTone((step.values[0] + step.values[1]) / 2);    }

    divSteps.scrollTo({top: divSteps.scrollHeight, behavior: 'smooth'});

    setTimeout(() => {
        if (isAnimating) {  // if we haven't pressed reset yet
            Display();
            if (loop) Step(true);
        }
    }, speedDelay);
}

// sizeSelector/Label listener
const sizeSelector = document.getElementById("sizeSelector");
const nLabel = document.querySelector('label[for="sizeSelector"]');
nLabel.textContent = sizeSelector.value.toString().padStart(2, "0");
sizeSelector.addEventListener("input", () => {
    let val = sizeSelector.value
    nLabel.textContent = val.toString().padStart(2, "0");
    n = val;
    Reset(n);
});
sizeSelector.value = 8;  // initial quantity of nums to sort
let n = sizeSelector.value;
nLabel.textContent = n.toString().padStart(2, "0");
let values=[], swaps=[];

// Speed of Algorithm
let UpdateSpeed = () => {
    const speed = speedSelector.value;
    switch (speed) {
        case 'turtle':
            speedDelay = 1000;
            break;
        case 'human':
            speedDelay = 500;
            break;
        case 'cheetah':
            speedDelay = 250;
            break;
        case 'rocket':
            speedDelay = 69;
            break;
        case 'ufo':
            speedDelay = 25;
        default:
            return;
    }
}
let speedDelay = 0;
const speedSelector = document.getElementById('speedSelector');
speedSelector.addEventListener("change", UpdateSpeed);
speedSelector.value = 'turtle';
UpdateSpeed();
Reset();