const basePath = process.cwd();
const fs = require("fs");
const buildDir = `${basePath}/build`;

// read json data
let rarityData = fs.readFileSync(`${basePath}/build/rarity/rarity.json`);
let rareData = JSON.parse(rarityData);

let attributeData = fs.readFileSync(`${basePath}/build/rarity/attributes.json`);
let attrData = JSON.parse(attributeData);

//sets empty values
var rarityrank = [];
let score = 0

//get rarity score for each attribute per id
attrData.map((attribute) => {
let key = attribute.attributes;
let id = attribute.id

    key.find((object) => {

        let traitType = object.trait_type;
        let value = object.value;

        score = rareData.filter(x => x.trait === value && x.trait_type === traitType).map(x => x.rarity_score) || 0
 
        final = {id, score}
        rarityrank.push(final)
    })  
})

//takes all attribute scores and adds them together per id
rankFinal = rarityrank.reduce((c, i)=>{
    let cc = c.findIndex((e)=>e.id==i.id);
    if(cc==-1) c.push({id: i.id, score: parseFloat(i.score)});
    else c[cc].score += parseFloat(i.score)
    return c
  }, []);

//sorts the array by rank  
rankFinal.sort(function(a, b) {
return a.score < b.score ? 1 : -1;
});

//adds a rank value based on position after sorting
rankFinal.forEach((item, i) => {
item.rank = i + 1;
});

console.log("Rarity Ranks have been generated! Check the rarityRank.json in your build folder.")

//writes rank to a JSON
const writeRarityRanking = (_data) => {
    fs.writeFileSync(`${buildDir}/rarity/rarityRank.json`, _data);
  };

  writeRarityRanking(JSON.stringify(rankFinal, null, 2));
  
