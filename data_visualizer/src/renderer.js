const { ipcRenderer } = require('electron')
const fs = require('fs')

let processorBtn = document.getElementById("processor");
let performanceBtn = document.getElementById("performance");

processorBtn.addEventListener("click", ()=>{
    generateProcessorChart();
})

performanceBtn.addEventListener("click", () =>{
    generatePerformanceChart();
})

function generatePerformanceChart(){
    ipcRenderer.send("performance")
}

async function generateProcessorChart(){
    console.log("Generate processor")
    let fileSelectionResult = await getTheFileSelected();
    console.log(fileSelectionResult)
    let filepath = fileSelectionResult['filePaths'][0];
    console.log("The file selected is", filepath)
    let contents = fs.readFileSync(filepath,{encoding: 'utf-8',flag: 'r'})

    console.log(contents,typeof contents)
    let splitContent = contents.split('\n');
    let firstPass = true
    records = []
    let yAxis = ''
    splitContent.forEach((elem) =>{
        if (firstPass){
            yAxis = elem.split(",")[1];
            firstPass = false;
        } else {
            let modElem = elem.replaceAll('"','')
            let time = modElem.split(",")[0];
            let percentage = modElem.split(",")[1];
            if (percentage === " "){
                percentage = "0.0"
            }
            console.log("Percetage", percentage,parseFloat(percentage))
            records.push([time,parseFloat(percentage)])
        }
    })
    console.log([['Time', 'Percentage'],...records])
    google.charts.load('current', {'packages':['corechart']});

    
    google.charts.setOnLoadCallback(()=>{
        var data = google.visualization.arrayToDataTable([
            ['Time', 'Percentage'],...records ]);
      
          var options = {
            title: 'Processor Percentage',
            curveType: 'function',
            legend: { position: 'bottom' }
          };
      
          var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      
          chart.draw(data, options);
    });

}




function getTheFileSelected(){
    return new Promise((resolve,reject)=>{
        ipcRenderer.invoke('getFile').then((data)=>{
            resolve(data)
        })
        .catch((err)=>reject(err))
    })
    
}