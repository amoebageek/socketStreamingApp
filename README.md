## **App to read data from web socket and publish in table with live sparkline graph**

**Stacks Used:**

 1. [stomp.js](http://jmesnil.net/stomp-websocket/doc/)
 2. [sparkline.js](https://github.com/mariusGundersen/sparkline)
 3. vanilla javascript
 4. Webpack
 
 

**Implementation :**

1)  This application is POC to read data from live streaming of objects, and push in table in sorted order (lastAskedBid)
2) Read the data, and prepare sparkline graph for the mid value of the askedBid, to provide clear visibilities of the graph delete all records of past 30 seconds.

**Globals**

`globalObject.sparkLineObj` =  [Keep record of data for sparkline];

`globalObject.bidCollection` =  [Hold all values published from websocket];

`globalObject.bidsInTable` =  [All obj pushed in table];

`globalObject.uniqueNameCollection` =  [Hold Unique name pushed in table];

**API**

|  SNo.|  Methods| Defination  |
|--|--|--|
| 1 | [`connectCallback`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L198)  |call back function to hook as successful connection established to web socket|
| 2 | [`flushPast30SecRec`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L180)  |this function deletes all records which are captured before 30 sec from now. *using client side date time*|
| 3 | [`prepareSparkLineObj`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L167)  |this function accepts current new object and prepare data for sparkline, this function is responsible for sparkline data|
| 4 | [`insertRowToTable`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L106)  |this function is responsible for inserting new row to table,and generating/updating `sparkline`  it accepts `index` where to push the data and `object` to be pushed|
| 5 | [`updateRow`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L78)  | this function will update the `innerText` of cells of particular index, and update `sparkline` to avoid duplicate row with the same name|
| 6 | [`convertTableToObject`](https://github.com/amoebageek/socketStreamingApp/blob/master/index.js#L22)  | generic function to convert table from DOM to json object, keeping header as key|
