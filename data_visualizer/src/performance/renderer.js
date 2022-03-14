const {ipcRenderer} = require('electron');
const fs = require('fs');

google.charts.load('current', {'packages':['corechart']});



ipcRenderer.on('store-data', function (event,store) {
    console.log(store);
    generateData();
});

let processIdElem = document.getElementById('processId')
let performanceObject = {}
//let processId = [];
function generateData(){
    const data = fs.readFileSync('C:\\Users\\T9SAU2\\OneDrive - Chubb\\Documents\\PythonProjects\\LeetCode\\performance_tools\\data_visualizer\\performance.txt', {encoding: 'utf8', flag: 'r'})
    let lines = data.split('\n');
    lines.forEach(element => {
        console.log("Lines", element)
        let fields = element.split(',');
        let tempObj = {};
        let processid = fields[0];
        if (fields.length != 3){
            d = {
                name: fields[1], timestamp: fields[2], processorTime: parseInt(fields[3]), userTime: parseInt(fields[4]), priveledgeTime: fields[5],
                virtualBytesPeak: parseInt(fields[6])/1000000, virtualBytes: parseInt(fields[7])/1000000, pageFaults: fields[8],
                workingSetPeak: parseInt(fields[9])/1000000, workingSet: parseInt(fields[10])/1000000,
                pageFileBytesPeak: parseInt(fields[11])/1000000, pageFileBytes: parseInt(fields[12])/1000000,
                privateBytes: parseInt(fields[13])/10000000,threadCount: parseInt(fields[14]), priorityBase: fields[15],elapsedTime: fields[16],
                idProcess: fields[17],poolPagedBytes: parseInt(fields[18])/1000000,poolNonpagedBytes: parseInt(fields[19])/1000000,
                handleCount: parseInt(fields[20])/1000,
                readOperationPerSecond: parseInt(fields[21]),writeOperationPerSecond: parseInt(fields[22]),dataOperationPerSecond: parseInt(fields[23]),
                otherOperationsPerSecond: parseInt(fields[23]),readBytesPerSecond: parseInt(fields[24]), writeBytesPerSecond: parseInt(fields[25])/1000,
                dataBytesPerSecond: parseInt(fields[26])/1000, otherBytesPerSecond: parseInt(fields[27])/1000,workingSetPrivate: parseInt(fields[28])/1000000
            }
            if (performanceObject.hasOwnProperty(processid)){
                performanceObject[processid].push(d)
            
            } else {
                performanceObject[processid] = [d]
            }
        }
    });

    let allProcess = Object.keys(performanceObject);
    //select = document.getElementById('processId');
    allProcess.forEach(element => {
        let opt = document.createElement('option');
        opt.value = element;
        opt.innerHTML = element;
        processIdElem.appendChild(opt);
    });
}

processIdElem.addEventListener('change', (event) =>{
    let selectedProcess = event.target.value;

    let performanceData = performanceObject[selectedProcess];
    console.log("The performance data is",performanceData)
    //Processor & User Time
    let processorUserData = [['Time Stamp', 'Processor Time', 'User Time']]
    performanceData.forEach(element => {
        processorUserData.push([element.timestamp, element.processorTime, element.userTime])
    });
    chartElement = document.getElementById("processor-time")
    title = "User-Processor Time"
    drawChart(processorUserData,title,chartElement);
    
    //thread count and handle count
    let threadHandleCount = [['Time Stamp', 'Thread Count', 'Handle Count']]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        threadHandleCount.push([element.timestamp, element.threadCount, element.handleCount])
    });
    chartElement = document.getElementById("counts")
    title = "Handle-Thread Count"
    drawChart(threadHandleCount,title,chartElement);

    //virtual bytes
    let virtualBytesData = [['Time Stamp', 'Virtual Byte Peak (MB)', 'Virtual Bytes (MB)']]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        virtualBytesData.push([element.timestamp, element.virtualBytesPeak, element.virtualBytes])
    });
    chartElement = document.getElementById("virtual-bytes")
    title = "Virtual Bytes"
    drawChart(virtualBytesData,title,chartElement);

    //working set
    let workingBytes = [['Time Stamp','Working Set Peak (MB)', 'Working Set (MB)', 'Working Set - Private (MB)' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        workingBytes.push([element.timestamp, element.workingSetPeak, element.workingSet, element.workingSetPrivate])
    });
    chartElement = document.getElementById("working-set")
    title = "Working Set"
    drawChart(workingBytes,title,chartElement);

    //pool pages
    let poolPages = [['Time Stamp','Pool Pages (MB)', 'Non Pool Pages (MB)' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        poolPages.push([element.timestamp, element.readOperationPerSecond, element.poolNonpagedBytes])
    });
    chartElement = document.getElementById("paged-bytes")
    title = "Pool - Non Pool pages"
    drawChart(poolPages,title,chartElement);


    //read-write number of operation
    let readWriteNumber = [['Time Stamp','Read Operation/sec', 'Write Operation/sec' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        readWriteNumber.push([element.timestamp, element.poolPagedBytes, element.writeOperationPerSecond])
    });
    chartElement = document.getElementById("operations")
    title = "Number of Read/Write Operations"
    drawChart(readWriteNumber,title,chartElement);
    
    //read-write in bytes
    let readWriteBytes = [['Time Stamp','Read Bytes (KB)', 'Write Bytes (KB)' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        readWriteBytes.push([element.timestamp, element.readBytesPerSecond, element.writeBytesPerSecond])
    });
    chartElement = document.getElementById("input-output")
    title = "Number of Read/Write Operations"
    drawChart(readWriteBytes,title,chartElement);
    
    //Other IO in # of operations
    let otherIoOperations = [['Time Stamp','IO Data Operations', 'Other IO Operations' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        otherIoOperations.push([element.timestamp, element.dataOperationPerSecond, element.otherOperationsPerSecond])
    });
    chartElement = document.getElementById("misc-operations")
    title = "Number of Misc Operations"
    drawChart(otherIoOperations,title,chartElement);
    
    //Other IO in bytes
    let otherIoByes = [['Time Stamp','IO Data Bytes (KB)', 'Other IO Bytes (KB)' ]]
    performanceData.forEach(element => {
        //console.log("The element being read is", element)
        otherIoByes.push([element.timestamp, element.dataBytesPerSecond, element.otherBytesPerSecond])
    });
    chartElement = document.getElementById("other-data")
    title = "Misc IO in Bytes"
    drawChart(otherIoByes,title,chartElement);
})

function drawChart(inputData,title,element) {
    console.log("Input Data for line",inputData)
    var data = google.visualization.arrayToDataTable(inputData);

    var options = {
      title: title,
      curveType: 'function',
      legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(element);

    chart.draw(data, options);
  }