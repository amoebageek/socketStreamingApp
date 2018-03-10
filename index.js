require('./site/index.html')
require('./site/style.css')

global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

var gloablObject = [];
    gloablObject.namesInTable = [];
    gloablObject.sparkLineObj = [];
    gloablObject.bidCollection = [];
    gloablObject.bidsInTable = [];
    gloablObject.uniqueNameCollection = [];

var convertTableToObject = function () {
    var currentTable = document.getElementById('dbTable');
    var tableBody = currentTable.rows;
    var headers = tableBody[0];    
    var hederArr = [];
    /*
        collectiong headers
    */
    for(var i=0;i<headers.cells.length; i++){
       hederArr.push(headers.cells[i].innerText)
    }
    
    /*
        collect objects from row
    */

    var rowBody = []
    
    for(var i = 1 ; i <= (tableBody.length-1) ; i ++) {  // first row is header
        var rowObj = {};    
        
        for(j= 0;j<hederArr.length;j++){
            rowObj[hederArr[j]] = tableBody[i].cells[j].innerText
        }

        rowBody.push(rowObj);
    }

    return rowBody;
}

var updateTable = function (objToRender) {
    var objectsInTable = convertTableToObject();  
    var indexToInsert  = 'last';
    var indexToRemove = null;
    var indexToUpdate = null;

    if(gloablObject.uniqueNameCollection.indexOf(objToRender.name) == -1){
        /*
            if name not present in the table push it
        */
          insertRowToTable('last',objToRender);
    } else {
        /*
            if name present in table update it
        */  
          for(var i=0; i<objectsInTable.length; i++){
             if(objToRender.name == objectsInTable[i].Name){
               indexToUpdate = i+1; // +1 because head is at pos 0
               updateRow(indexToUpdate, objToRender);
               break;
             }
          }
    }

}
function updateRow (index, obj){
      var table = document.getElementById('dbTable');
      var rowToUpdate = table.rows[index];


      for (var i=0; i< 6; i++){
           var cellToUpdate = rowToUpdate.cells[i];
            switch (i){
                case 0:
                    cellToUpdate.innerHTML = obj.name;
                    break;
                case 1:
                    cellToUpdate.innerHTML = obj.bestBid;
                    break;
                case 2:
                    cellToUpdate.innerHTML = obj.bestAsk;
                    break;
                case 3:
                    cellToUpdate.innerHTML = obj.lastChangeBid;
                    break;
                case 4:
                    cellToUpdate.innerHTML = obj.lastChangeAsk; 
                    break;
              }

      }
          var sparklineElem = document.getElementById('dbSparkLine');
          Sparkline.draw(sparklineElem, obj.sparkLineObj);

}
function deleteRow (index) {
    
    if(index){
        var table = document.getElementById('dbTable');
        table.deleteRow(0);
    }
}

function insertRowToTable (index, objToRender) {
      var table = document.getElementById('dbTable');
      /* Because header is also a row */
      gloablObject.uniqueNameCollection.push(objToRender.name);
      var currentRowCount = 
                  document.getElementById('dbTable').getElementsByTagName("tr");
      if(index === 'last') {
          var newRow = table.insertRow(currentRowCount.length);      
      } else {
        var newRow = table.insertRow(index);      
      }
      
      for (var i=0; i< 6; i++){
            var newRowCell = newRow.insertCell(i);
            switch (i){
                case 0:
                    newRowCell.innerHTML = objToRender.name;
                    break;
                case 1:
                    newRowCell.innerHTML = objToRender.bestBid;
                    break;
                case 2:
                    newRowCell.innerHTML = objToRender.bestAsk;
                    break;
                case 3:
                    newRowCell.innerHTML = objToRender.lastChangeBid;
                    break;
                case 4:
                    newRowCell.innerHTML = objToRender.lastChangeAsk; 
                    break;
                case 5:
                    if(gloablObject.uniqueNameCollection.length > 1){
                      /*
                          if row exists then, make the cell hidden for row[0] rowSpan
                      */
                    newRowCell.style.display = 'none';
                    } else {

                    var elem = document.createElement("span");
                        elem.setAttribute("id", "dbSparkLine");
                        newRowCell.appendChild(elem);
                    }
                    break;
            }
        }    
          var sparklineElem = document.getElementById('dbSparkLine');
          table.rows[1].cells[5].rowSpan = currentRowCount.length;
          Sparkline.draw(sparklineElem, objToRender.sparkLineObj);
    }
var updateTable_temp = function (totalRowToDisplay, objToRender) {
    var table = document.getElementById('dbTable');
        var currentRowCount = 
                  document.getElementById('dbTable').getElementsByTagName("tr");
    
        if (gloablObject.namesInTable.indexOf(objToRender.name) === -1) {
            
            /*
                Keep records for the unique name exists and need to be inserted
            */

            gloablObject.namesInTable.push(objToRender.name);
 
            var newRow = table.insertRow(currentRowCount.length);
            
            for (var i=0; i< 6; i++){
            var newRowCell = newRow.insertCell(i);;
            switch (i){
                case 0:
                    newRowCell.innerHTML = objToRender.name;
                    break;
                case 1:
                    newRowCell.innerHTML = objToRender.bestBid;
                    break;
                case 2:
                    newRowCell.innerHTML = objToRender.bestAsk;
                    break;
                case 3:
                    newRowCell.innerHTML = objToRender.lastChangeBid;
                    break;
                case 4:
                    newRowCell.innerHTML = objToRender.lastChangeAsk; 
                    break;
                case 5:
                    var elem = document.createElement("span");
                    newRowCell.appendChild(elem);
                    break;

                default:
                    break;
            }
        }
            
        } else {
          /*
              update / sort row for duplicate name
          */
        }


        /*
            add rowSpan to lastCell of first dynamic row (non header)
        */
         /*table.rows[1].cells[5].innerHTML ="NA";
         */

        table.rows[1].cells[5].rowSpan = currentRowCount.length;
        Sparkline.draw(table.rows[1].cells[5], objToRender.sparkLineObj);
        
        if(currentRowCount.length > 2 && table.rows[currentRowCount.length - 1].cells[5]) {
          table.rows[currentRowCount.length - 1].deleteCell(5);
        }

}

    function prepareSparkLineObj(obj) {
        var midValue = (obj.bestAsk + obj.bestBid)/2;

            gloablObject.sparkLineObj.push({
            
              'receivedTime': new Date(),
              'val' : midValue
            
            });
        var  sparkLineObj = flushPast30SecRec(gloablObject.sparkLineObj)
        return sparkLineObj; 
    }

    function flushPast30SecRec(allRecords) {
        var sparkLineArr = [];
        var timeNow = new Date();
        
        for (var i=0; i<allRecords.length; i++) {
            var timeDiff =  (
                              timeNow.getTime() - allRecords[i].receivedTime.getTime()
                            ) / 1000;
            /*
                keep bids of only last 30 sec for sparkline
            */
            if(timeDiff < 30) {
               sparkLineArr.push(allRecords[i].val);
            }
        }
        return sparkLineArr;
    }
   
    function connectCallback() {

        var subscribeRest = '/fx/prices';
        
        client.subscribe(subscribeRest,function(res){
            this.parsedBody = JSON.parse(res.body);
            
            if(gloablObject.uniqueNameCollection.indexOf(this.parsedBody.name) == -1) {
                gloablObject.bidCollection.push(this.parsedBody);
            }
              var sparklineData = prepareSparkLineObj(this.parsedBody);
                  this.parsedBody.sparkLineObj = sparklineData; 
              updateTable(this.parsedBody);
        });

    }

  client.connect({}, connectCallback, function(error) {
      alert(error.headers.message)
  });