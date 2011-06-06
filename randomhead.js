var images = [].slice.call(document.querySelectorAll("#images img"), 0);

// Draw one image in the strip and append it (we only need to draw two images
// in a strip anyway.) Return the drawn image for the given src
function draw_in_strip(strip, src)
{
  var img = document.createElement("img");
  strip.appendChild(img);
  img.src = src;
  set_translation(img, 0, -strip.offsetTop);
  return img;
}

function draw_strip(strip)
{
  var slider = {

    img0: draw_in_strip(strip, strip._images[strip._i].src),
    l: strip._images.length,
    w: strip.offsetWidth / 2,
    x0: null,

    handleEvent: function(e)
    {
      var p = populus.event_client_pos(e);
      if (e.name === "mousedown" || e.name === "touchstart") {
        e.preventDefault();
        this.x0 = this.x1 = p.x;
        this.x2 = 0;
        this.i = strip._i;
        this.img1 = draw_in_strip(strip, strip._images[(this.i + 1) % l].src);
      } else if (e.name === "mousemove" || e.name === "touchmove") {
        if (this.x0 !== null) {
          this.x1 = p.x;
          var x = this.x1 - this.x0 + this.x2;
          if (x > 0) {
            this.img1.src = strip._images[i].src;
            this.i = (l + this.i - 1) % l;
            this.img0.src = strip._images[this.i].src;
            x -= this.w;
            this.x2 -= this.w;
          } else if (x < -w) {
            this.i = (this.i + 1) % l;
            img0.src = strip._images[this.i].src;
            img1.src = strip._images[(i + 1) % l].src;
            this.x += this.w;
            this.x2 += this.w;
          }
          set_translation(strip, x, 0);
        }
      } else if (e.name === "mouseup" || e.name === "touchup") {
      }
    }

  };

  slider.img0.addEventListener("mousedown", slider, false);
  document.addEventListener("mousemove", slider, false);
  document.addEventListener("mouseup", slider, false);
  slider.img0.addEventListener("touchstart", slider, false);
  slider.img0.addEventListener("touchmove", slider, false);
  slider.img0.addEventListener("touchend", slider, false);
}

function init_shaking()
{
  if (window.DeviceMotionEvent) {
    // Shake sensitivity (a lower number is more)
    var sensitivity = 20;
    // Position variables
    var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
    // Listen to motion events and update the position
    window.addEventListener("devicemotion", function (e) {
        x1 = e.accelerationIncludingGravity.x;
        y1 = e.accelerationIncludingGravity.y;
        z1 = e.accelerationIncludingGravity.z;
      }, false);
    // Periodically check the position and fire
    // if the change is greater than the sensitivity
    setInterval(function () {
        var change = Math.abs(x1 - x2 + y1 - y2 + z1 - z2);
        if (change > sensitivity) refresh();
        // Update new position
        x2 = x1;
        y2 = y1;
        z2 = z1;
      }, 150);
  }
}

loaded_image = (function() {

  var loaded = 0;

  // When we have loaded all images we can start!
  return function(e)
  {
    if (++loaded === images.length) {
      document.getElementById("loading").style.display = "none";
      init_shaking();
      refresh();
    }
  };
})();

// Refresh strips and image lists
function refresh()
{
  var strips = document.getElementById("head").querySelectorAll("div");
  for (var i = 0, n = strips.length; i < n; ++i) {
    strips[i].innerHTML = "";
    strips[i]._images = populus.shuffle(images);
    strips[i]._i = 0;
    draw_strip(strips[i]);
  }
}

// Handy shorthand for setting the translation property of an element
function set_translation(elem, x, y)
{
  elem.style.OTransform =
  elem.style.MozTransform =
    "translate({0}px, {1}px)".fmt(x, y);
  elem.style.WebkitTransform = "translate3d({0}px, {1}px, 0)".fmt(x, y);
}

/*
var ANIM_RATE = 1200;
var IMAGES = null;
var BUTTONS = {
  "done-button": done,
  "refresh-button": refresh,
  "save-button": save,
  "threed-button": toggle_3d.bind(window, true),
  "twod-button": toggle_3d.bind(window, false)
};
var THREE_D = false;

// Done with the saved image; go back to the main UI
function done(e)
{
  var saved = document.getElementById("saved");
  if (saved) saved.parentNode.removeChild(saved);
  document.getElementById("save-button").className = "";
  e.source.elem.style.display = "none";
}

// Draw the current image for the strip and setup the event listeners for this
// image (touch/mouse down/move/up)
function draw_strip(strip)
{
  var img0 = draw_in_strip(strip, strip._images[strip._i].src);
  var l = strip._images.length;
  var w = strip.offsetWidth / 2;
  var x0 = null;
  var x1, x2, i, img1;

  // Down event: start dragging the image
  // x0 is where we initially clicked/touched down
  var down = function(e)
  {
    e.preventDefault();
    x0 = x1 = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
    x2 = 0;
    i = strip._i;
    img1 = draw_in_strip(strip, strip._images[(i + 1) % l].src);
    //img1.addEventListener("touchstart", function(e) { e.preventDefault(); },
    //    false);
  };

  // Move event: drag the strip and update the images when necessary. When
  // going over the width of the strip, shift the images to the left or to the
  // right. x1 is where the cursor/finger currently is, and x2 keeps track of
  // the images shift in increments of w
  var move = function(e)
  {
    if (x0 !== null) {
      x1 = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
      var x = x1 - x0 + x2;
      if (x > 0) {
        img1.src = strip._images[i].src;
        i = (l + i - 1) % l;
        img0.src = strip._images[i].src;
        x -= w;
        x2 -= w;
      } else if (x < -w) {
        i = (i + 1) % l;
        img0.src = strip._images[i].src;
        img1.src = strip._images[(i + 1) % l].src;
        x += w;
        x2 += w;
      }
      translate(strip, x, 0);
    }
  };

  // Up event: we're done dragging so animate the strip to show the selected
  // image and remove the extra image used for animation
  var up = function()
  {
    if (x0 !== null) {
      var dur = 0;
      var x = x1 - x0 + x2;
      if (x > -w / 2) {
        strip._i = i;
        dur =
        strip.style.MozTransitionDuration =
        strip.style.WebkitTransitionDuration = "{0}s".fmt(-x / ANIM_RATE);
        var onend = function(e)
        {
          strip.style.MozTransitionDuration =
          strip.style.WebkitTransitionDuration = "0s";
          strip.removeEventListener("transitionend", onend, false);
          strip.removeEventListener("webkitTransitionEnd", onend, false);
          if (img1.parentNode) img1.parentNode.removeChild(img1);
        };
        strip.addEventListener("transitionend", onend, false);
        strip.addEventListener("webkitTransitionEnd", onend, false);
        translate(strip, 0, 0);
      } else {
        strip._i = (i + 1) % l;
        dur =
        strip.style.MozTransitionDuration =
        strip.style.WebkitTransitionDuration = "{0}s".fmt((x + w) / ANIM_RATE);
        var onend = function(e)
        {
          strip.style.MozTransitionDuration =
          strip.style.WebkitTransitionDuration = "0s";
          strip.removeEventListener("transitionend", onend, false);
          strip.removeEventListener("webkitTransitionEnd", onend, false);
          img0.src = img1.src;
          translate(strip, 0, 0);
          if (img1.parentNode) img1.parentNode.removeChild(img1);
        };
        strip.addEventListener("transitionend", onend, false);
        strip.addEventListener("webkitTransitionEnd", onend, false);
        translate(strip, -w, 0);
      }
      x0 = null;
    }
    if (dur === "0s") strip.removeChild(img1);
  };

  // Add event listeners for both touch and mouse events
  img0.addEventListener("mousedown", down, false);
  img0.addEventListener("touchstart", down, false);
  document.addEventListener("mousemove", move, false);
  img0.addEventListener("touchmove", move, false);
  document.addEventListener("mouseup", up, false);
  img0.addEventListener("touchend", up, false);
}


// Make a button out of an element
function make_button(button, f)
{
  var b = populus.activatable.$new(button);
  b.add_listener("@activated", f);
}

// Setup all buttons
function make_buttons()
{
  document.getElementById("buttons").style.display = "block";
  for (var id in BUTTONS) make_button(document.getElementById(id), BUTTONS[id]);
}

// Save the current face to an image
function save(button)
{
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var strips = document.getElementById("head").querySelectorAll("div");
  for (var i = 0, n = strips.length; i < n; ++i) {
    var y = strips[i].offsetTop;
    var img = strips[i]._images[strips[i]._i];
    var w = img.width;
    var h = strips[i].offsetHeight;
    if (i === 0) {
      canvas.width = w;
      canvas.height = img.height;
    }
    context.drawImage(img, 0, y, w, h, 0, y, w, h);
  }
  var img = document.createElement("img");
  img.id = "saved";
  var head = document.getElementById("head");
  head.appendChild(img);
  img.src = canvas.toDataURL("image/png");
  translate(img, 0, -head.offsetHeight);
  button.className = "disabled";
  document.getElementById("done-button").style.display = "";
}

// Show off by sliding through many faces before settling on the current one
// This is disabled for the moment as it's not working properly
function show_off(strip)
{
  var l = strip._images.length;
  var n = Math.floor(4 + Math.random() * l / 10);
  var div = document.createElement("div");
  div.className = strip.className;
  var w = strip.offsetWidth / 2;
  div.style.width = (n * w) + "px";
  var y = strip.offsetTop - div.offsetTop;
  strip.parentNode.appendChild(div);
  var y = strip.offsetTop - div.offsetTop;
  translate(div, 0, y);
  for (i = n - 1; i >= 0; --i) {
    var img = document.createElement("img");
    img.src = strip._images[(l + (strip._i - i) % l) % l].src;
    translate(img, 0, -strip.offsetTop);
    div.appendChild(img);
  }
  div.style.webkitTransitionDuration = "0.5s";
  div.addEventListener("webkitTransitionEnd", function(e) {
      div.parentNode.removeChild(div);
    }, false);
  translate(div, -((n - 1) * w), y);
}

// Toggle 3D transforms
function toggle_3d(on)
{
  THREE_D = on;
  document.getElementById("threed-button").style.display = on ? "none" : "";
  document.getElementById("twod-button").style.display = on ? "" : "none";
}

*/
