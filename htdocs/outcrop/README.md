Outcrop.js
==========

Outcrop is a jQuery UI widget for zooming and cropping large images within fixed or flexible containers.

Outcrop is designed to work on a single image within a container.  Here's an example of the HTML, taken from the example link.

```
<div id="out-1" class="outcrop" style="width: 50%; height: 300px; margin-left: 25%;">
<input id="demo_x" type="hidden" name="x" value="100" />
<input id="demo_y" type="hidden" name="y" value="100" />
<input id="demo_zoom" type="hidden" name="zoom" value="40" />
<!-- optional: hide image until we've scaled it, then fade in -->
<img style="display: none;" src="img/AH180.jpg" alt="big image of cars from 1980" />
</div>
```

These form fields are read and written by outcrop.  They should be wrapped in some kind of form that stores them in the database.
```
<input id="demo_x" type="hidden" name="x" value="100" />
<input id="demo_y" type="hidden" name="y" value="100" />
<input id="demo_zoom" type="hidden" name="zoom" value="40" />
```

Values
x: +width to -width of image in pixels (e.g. -1024 to 1024 pixels)
y: +height to-height of image in pixels (e.g. -768 to 768 pixels)
zoom: 0-zoomlimit, where 0 is infinitely zoomed out (corrects to 0.1), 100 is native pixels 1:1, 200 is double-size
Zoomlimit is typically 100, though it can be altered in the settings
