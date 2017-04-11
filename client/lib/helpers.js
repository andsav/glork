/*
    Common helper functions
 */

import { $ } from './$.js';

const ERROR_DIV = $("error_msg");

// Euclidean distance
export let dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

export let collision = (previous, point, r) => previous.map((co) => dist(co, point) > r).includes(false);

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
