let fs = require('fs')


async function okAvaamo(){
  
  let textdataArr = await getTextDataFromServer()
  let {top10requiredData,mapdata} = getTop10DataBasedOnOccurances(textdataArr)
  let top10DicData = await getTop10DictData(top10requiredData)
  let res = await formatDictDataToResult(top10DicData,mapdata)
  console.log(JSON.stringify(res))
  fs.writeFileSync('data.json', JSON.stringify(res))
  console.log('done avaamo')
}

async function getTextDataFromServer(){
  let res=await fetch("http://norvig.com/big.txt")
  let str=await res.text()

  let textArray=str.split(" ")
  return textArray
}

function getTop10DataBasedOnOccurances(textDArr) {
  let mapdata=new Map()
  for(let word of textDArr){
    if(mapdata.has(word)){
      mapdata.set(word,mapdata.get(word)+1)
    }else{
      mapdata.set(word,1)
    }
  }
  
  let keysOfmapdata=Array.from(mapdata.keys())

  keysOfmapdata.sort((a,b)=>{
    let countA=mapdata.get(a)
    let countB=mapdata.get(b)
    if(countA>countB){
      return -1
    }else if(countA<countB){
      return 1
    }else{
      return 0
    }
  })
  
  let top10requiredData=[]
  for(let i = 0; i<keysOfmapdata.length; i++){
    if(keysOfmapdata[i]!==""){
      top10requiredData.push(keysOfmapdata[i])
    }
    if(top10requiredData.length ==10){
      break
    }
  }
  return {top10requiredData,mapdata}
}

async function getTop10DictData(top10words) {
  let prom=[]
  let apiKe="";
  for(let word of top10words){
    let p=fetch("https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key="+apiKey+"&lang=en-en&text="+word)
    let p2 = p.then(d=>d.json())
    prom.push(p2)
  }
  return prom
}

async function formatDictDataToResult(top10DicData, mapdata) {
  let allRes = await Promise.all(top10DicData)
  let finalResult = []
  // console.log(allRes);
  for(let res of allRes){
    let {pos, text, tr} = res.def[0] ?? {pos:'', text:'', tr:[]}
    let syn = tr?.reduce((ac, cv)=>{
      cv?.syn && ac.push(...cv.syn)
      return ac
    }, []).map(s=>s.text) ?? []
  
    let formattedRes = {word:text, output:{count: mapdata.get(text), Synonyms:syn, Pos:pos}}
    finalResult.push(formattedRes)
  }
  
    return finalResult

}

okAvaamo()
