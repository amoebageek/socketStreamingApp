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

var globalObject = [];
    globalObject.sparkLineObj = [];
    globalObject.bidCollection = [];
    globalObject.bidsInTable = [];
    globalObject.uniqueNameCollection = [];

var table = document.getElementById('dbTable');

    var convertTableToObject = function () {
        var tableBody = table.rows;
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

        if(globalObject.uniqueNameCollection.indexOf(objToRender.name) == -1){
            /*
                if name not present in the table push it
            */
              var rowInTable = table.rows.length;
              insertRowToTable((rowInTable-1), objToRender);
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

    function insertRowToTable (index, objToRender) {
          /* Because header is also a row */
          globalObject.uniqueNameCollection.push(objToRender.name);
          var currentRowCount =table.getElementsByTagName("tr");
          if(index === 0 ) {
              var newRow = table.insertRow(currentRowCount.length);      
          } else {
            /*
                    check if value of LastChangeBid at obj at index -1 < currentObj.LastChangeBid
            */
            var objectsInTable = convertTableToObject();
            if(parseFloat(objectsInTable[index-1].LastChangeAsk) < objToRender.lastChangeAsk ) {
              /*
                  before inserting new row check if lastChange bid in noew object is less than that of its previous index
                  if less
                    swap those rows
              */
              var newRow = table.insertRow(index);
            } else {
                  var newRow = table.insertRow(index+1);
            }      
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
                        if(globalObject.uniqueNameCollection.length > 1){
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

    function prepareSparkLineObj(obj) {
        var midValue = (obj.bestAsk + obj.bestBid)/2;

            globalObject.sparkLineObj.push({
            
              'receivedTime': new Date(),
              'val' : midValue
            
            });
        var  sparkLineObj = flushPast30SecRec(globalObject.sparkLineObj)
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
            var sparklineData = prepareSparkLineObj(this.parsedBody);
            this.parsedBody.sparkLineObj = sparklineData; 
              updateTable(this.parsedBody);
        });

    }

  client.connect({}, connectCallback, function(error) {
      alert(error.headers.message)
  });