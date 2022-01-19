const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;
const buildDir = `${basePath}/build`;

const { layerConfigurations } = require(`${basePath}/src/config.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];
var rarityList = [];
var attributeList = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
    elements.forEach((element) => {
      // just get name and weight for each element
      let rarityDataElement = {
        trait_type: '',
        trait: element.name,
        weight: element.weight.toFixed(0),
        occurrence: 0, // initialize at 0
        chance: 0,
        rarity_score: 0,
      };
      elementsForLayer.push(rarityDataElement);
    });
    let layerName =
      layer.options?.["displayName"] != undefined
        ? layer.options?.["displayName"]
        : layer.name;
    // don't include duplicate layers
    if (!rarityData.includes(layer.name)) {
      // add elements for each layer to chart
      rarityData[layerName] = elementsForLayer;
    }
  });
});

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;
  let id = element.edition

  let tracked = {id, attributes};

  //console.log(tracked)

  attributeList.push(tracked)

  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to occurence string
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // get and write chance
    let chance =
      ((rarityData[layer][attribute].occurrence / editionSize) * 100).toFixed(2);
    
    rarityData[layer][attribute].chance = chance

    //write rarity score
    rarityData[layer][attribute].rarity_score = (1 / rarityData[layer][attribute].occurrence / 111);

    // show two decimal places in percent
    rarityData[layer][attribute].occurrence =
      `${rarityData[layer][attribute].occurrence} in ${editionSize} editions` ;

    //write trait type
    rarityData[layer][attribute].trait_type = layer

  }
}

// print out rarity data
for (var layer in rarityData) {
 // console.log(`Trait type: ${layer}`);
  for (var trait in rarityData[layer]) {
    //console.log(rarityData[layer][trait]);
    rarityList.push(rarityData[layer][trait])
   
  } 
}

//writes JSON for Attribute data
const writeAttributes = (_data2) => {
  fs.writeFileSync(`${buildDir}/json/attributes.json`, _data2);
};

writeAttributes(JSON.stringify(attributeList, null, 2));

//writes JSON for Rarity data
const writeRarity = (_data) => {
    fs.writeFileSync(`${buildDir}/json/rarity.json`, _data);
  };

  writeRarity(JSON.stringify(rarityList, null, 2));
