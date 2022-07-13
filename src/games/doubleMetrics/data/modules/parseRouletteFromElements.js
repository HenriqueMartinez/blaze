const parseRouletteFromElements = async (elements) => {
  const promises = elements.map(async (el) => {
    const classNameObj = await el.getProperty('className');
    const className = await classNameObj.jsonValue();

    const number = parseInt(await el.evaluate(el => el.textContent)) || 0
    const [_, color] = className.split(' ');
    
    return { color, number };
  });

  return await Promise.all(promises);
};

module.exports = parseRouletteFromElements;