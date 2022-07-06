const isSameRouletteColors = (a, b) => {
  console.log(a)
  return a.map(x => x.color).join("") === b.map(x => x.color).join("");
};
  
module.exports = isSameRouletteColors;