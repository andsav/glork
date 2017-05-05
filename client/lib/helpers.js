/*
 Common helper functions
 */

import {$} from './$.js';

const ERROR_DIV = $("error_msg");

// Euclidean distance
export let dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

export let collision = (previous, point, r) => previous.map((co) => dist(co, point) > r).includes(false);

export let in_circle = (point, circle, r) => {
    return Math.pow((point.x - circle.x), 2) + Math.pow((point.y - circle.y), 2) < Math.pow(r, 2);
};

// Round float number
export let round = (n, decimals) => (Math.round(n * decimals) / decimals);

// Fisher–Yates algorithm
export let shuffle = (a) => {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
};

// Return a random integer between min and max
export let rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Returns a random number according to a Gaussian distribution N(0, 1) (Box–Muller transform)
export let gaussian = () => {
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Pack form data into a key => value map
export let serialize = (form) => {
    let data = {};

    form.querySelectorAll("input, textarea").forEach(
        (input) => {
            data[input.id] = input.value;
        }
    );

    return data;
};

// Stop all animations in progress
export let clear_timeout = () => {
    let highestTimeoutId = setTimeout(";");
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }

    ERROR_DIV.style.opacity = 0;
};

// Display error
export let error = (elem, err) => {
    elem.classList.add('shake', 'shake-constant');
    ERROR_DIV.innerHTML = err;
    ERROR_DIV.style.opacity = 1;

    setTimeout(function () {
        elem.classList.remove('shake', 'shake-constant');
    }, 300);

    setTimeout(function () {
        ERROR_DIV.style.opacity = 0;
    }, 2000);
};
