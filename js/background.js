const images = [ "dog2.jpg", "dog3.jpg", "dog4.jpg", "dog5.jpg", "dog6.jpg"];
// const images = [ "박건1.jpg", "김대1.jpg", "김대2.jpg", "민준이형1.jpg", "dog6.jpg"];

const chosenImage = images[Math.floor(Math.random() * images.length)];

const bgImage = document.createElement("img");

bgImage.src = `img/${chosenImage}`;
document.body.appendChild(bgImage);

