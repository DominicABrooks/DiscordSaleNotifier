const { updateSpecials: update } = require('./utils/specialsUpdater');

// Initial request, update every 100,000 milliseconds
update();
setInterval(update, 100000);
