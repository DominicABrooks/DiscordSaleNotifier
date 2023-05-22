const getCurrentSpecials = async () => {
  try {
    const response = await fetch('https://store.steampowered.com/api/featuredcategories?cc=US');
    const dataJson = await response.json();
    const specialsJson = dataJson.specials.items;
    return specialsJson;
  } catch (error) {
    console.error('Error retrieving current specials:', error);
    return undefined;
  }
};

module.exports = {
  getCurrentSpecials
};
