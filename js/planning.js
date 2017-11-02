

$(document).ready(function() {
    
    // fill the table headers with the calculated dates
    setInitialBiweeklyDates();
    // read the items from LS and insert them in the page's DOM
    readDataFromLS();
    // format the table with DataTable theird-part library witch includes button for exporting data, search, pagination..
    loadDataTable();
    // initialize tooltips one the pets name tooltips pet characterists
    initializeTooltips();

});

// array with the biweek dates in JS Date format
var biweeklyDatesArray = new Array();

/* get the biweekly dates array represented in the table and insert them into column header in format DD/MM, starting from the monday of the current week */
function setInitialBiweeklyDates(){
    /* get the current monday date of this week */
    var today = new Date();
    var dayOfWeek = today.getDay();
    dayOfWeek = 0 ?  dayOfWeek = 6 : dayOfWeek= today.getDay();
    var firstSundayOfWeek = new Date(today.getTime() - 60 * 60 * 24 * dayOfWeek * 1000);    
    // since the italian week starts with Monday and not from Sunday..
    var firstMondayOfWeek = new Date(firstSundayOfWeek.setDate(firstSundayOfWeek.getDate()+1))
    // calculate a range of two starting from the Monday of the current week
    biweeklyDatesArray = calculateBiweeklyDates(firstMondayOfWeek);
    // fill table header with biweekly dates
    fillTableHeader();
}

/* calculate the biweekly dates array */
function calculateBiweeklyDates(startDate) {
    var currentDate = startDate;
    var dateArray = new Array();
    for(var i=0; i< 14; i++){
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate()+1) ;
    }
    return dateArray;
}

/* create a Matrix (2d object array) with this structure

    day1    day2    day3    ...     day14
    box1    pet1    pet1    pet1    ...     pet2
    box2    pet2    ---     pet3    ...     pet4
    ...     ...     ...     ...     ...     ...
    box14   pet5    pet5    ---     ---     ----       */
function matrix( rows, cols, defaultValue){
    var arr = [];
    // Creates all lines:
    for(var i=0; i < rows; i++){
        // Creates an empty line
        arr.push([]);
        // Adds cols to the empty line:
        arr[i].push( new Array(cols));
        for(var j=0; j < cols; j++){
            // Initializes:
            arr[i][j] = defaultValue;
        }
    }
    return arr;
}

// read the data from LS and create the table in page dinamically
function readDataFromLS(){
    // get reservations from LS
    var reservationsFromLS = getReservationsFromLS();
    // if there is at least one reservation
    if(reservationsFromLS){
        // array used later where to store each day of reservation with all its infos (pet id, pet name, date, reservation id)
        var reservationsObjectArray = new Array();
        // cycle on every reservation stored previously in the LS
        reservationsFromLS.forEach(function(reservation, index){
            // get start and end date for every single reservation
            var start = new Date(Number(reservation.from.substr(6,4)), Number(reservation.from.substr(3,2))-1,       Number(reservation.from.substr(0,2)));
            var end = new Date(Number(reservation.to.substr(6,4)), Number(reservation.to.substr(3,2))-1, Number(reservation.to.substr(0,2)));
            // create an array (reservationDates) with all the dates of each reservation period
            var reservationDates = new Array();
            while(start <= end){
                reservationDates.push(new Date(start));
                start.setDate(start.getDate() + 1);
            }
            // fill the "reservationDates" object array with this structure {date: "22/09/2017", box: "box1", pet_name: "Fufi", pet_id: "1", reservation_id: "2" }
            reservationDates.forEach(function(date, index){
                reservationsObjectArray.push({date: getFullDateFromDate(reservationDates[index]), box: reservation.box, pet_name: getPetFromLSbyId(reservation.pet).name, pet_id: reservation.pet, reservation_id: reservation.id});
            });
        });

        //  matrix representing the table - the first row contains the days in string format
        var biweekMatrix = matrix(11, 14, '');

        // fill the first matrix'row with the date in String format
        // example: biweekMatrix[0][0] = '01/01/2017', biweekMatrix[0][1] = '02/01/2017'..., biweekMatrix[0][13] = '14/01/2017'
        for(var i=0; i<14; i++){
            biweekMatrix[0][i] = getFullDateFromDate(biweeklyDatesArray[i]);
        }

        // with all the reservation transformed into obcjects, fill the matrix
        fillTheMatrix(biweekMatrix, reservationsObjectArray);

        // now we have the matrix filled, create the html table dinamically
        var htmlTable = "";
        for(let i=1; i<=10; i++){
            htmlTable += '<tr><th scope="row">' + getBoxName(i) +'</th>';
            for(var j=0; j<14; j++){
                if(biweekMatrix[i][j] == ''){
                    htmlTable+= '<td>&nbsp;</td>';
                } else if (biweekMatrix[i][j] instanceof Array) {
                    htmlTable+= '<td>';
                    for(let z in biweekMatrix[i][j]){
                        htmlTable+= '<a href=\"reservation.html\" class=\"slot-busy reservation-detail\" id=\"detail_' + biweekMatrix[i][j][z].reservation_id + '\">' + biweekMatrix[i][j][z].pet_name + '</a><input type=\"hidden\" name="petId" value="' + biweekMatrix[i][j][z].pet_id + '">';
                    }
                    htmlTable+= '</td>';
                } else {
                    htmlTable+= '<td><a href=\"reservation.html\" class=\"slot-busy reservation-detail\" id=\"detail_' + biweekMatrix[i][j].reservation_id + '\">' + biweekMatrix[i][j].pet_name + '</a><input type=\"hidden\" class="popover" name="petId" value="' + biweekMatrix[i][j].pet_id + '"></td>';
                }
            }
            htmlTable+= '</tr>';
        }
        // insert the table just created into the DOM
        $('table#planning-table tbody').html(htmlTable);
    }
}

/* Load the table with the jQuery DataTable third-party library to gain table filter, search, pagination etc.. */
function loadDataTable(){
    $('#planning-table').DataTable({
        dom: 'Bfrtip',
        paging: false,
        ordering: false,
        info: false,
        buttons: [
            {
                extend: 'print',
                text: localStorage.getItem("lang") =='en'? 'Print' : 'Stampa',
                className: 'btn btn-secondary',
                message: 'Pet Pension by Gianluca Baldin - This print was produced using the Print button for DataTables',
                exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5 ]
                },
                title: 'Pensione Animali - Elenco Animali'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel', 
                className: 'btn btn-secondary',
                exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5 ]
                },
                title: 'Pensione Animali - Elenco Animali'
            },
            {
                extend: 'pdfHtml5',
                text: 'PDF', 
                className: 'btn btn-secondary',
                exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5 ]
                },
                title: 'Pensione Animali - Elenco Animali'
            }
        ],
        columnDefs: [
            { "targets": [1,2,3,4,5,6,7,8,9,10,11,12,13,14], "type": "date"},
        ]
    });
};

/* save the item id of the reservation the user wants the detail about, so it could be read from the reservation page (the id is inside the button's id the user has clicked, that in this case is "this") */
$(document).on('click', '.reservation-detail', function () {
    /* save the reservation id into the LS temporary so it will be read in reservation page loading */
    localStorage.setItem("reservationInEdit", this.id.substring(this.id.indexOf("_")+1));
    // since the button just clicked is an <a> attribute with a "href" attribute to reservation page, the page will be switched automatically
});


// click on the right arrow --> add one day to the days represented in the table
$("#nextDay").click(function(){
    biweeklyDatesArray = calculateBiweeklyDates(addDays( new Date(biweeklyDatesArray[0]) , 1));
    // fill table header with biweekly dates
    fillTableHeader();
    // reload data after adding one day
    readDataFromLS();
    // since new reservation could be shown weren't loaded entering the page, it must be re-inialized the tooltip so for the (eventual) new reservation items is set its tooltip handler
    initializeTooltips();
});

// click on the left arrow --> subtract one day to the days represented in the table
$("#prevDay").click(function(){
    biweeklyDatesArray = calculateBiweeklyDates(addDays( new Date(biweeklyDatesArray[0]) , -1));
    // fill table header with biweekly dates
    fillTableHeader();
    // reload data after adding one day
    readDataFromLS();
    // since new reservation could be shown weren't loaded entering the page, it must be re-inialized the tooltip so for the (eventual) new reservation items is set its tooltip handler
    initializeTooltips();
});

// get a date plus (or minor) X days
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/* fill table header with biweekly dates (stored in the "biweeklyDatesArray") in this manner:
    - if after page loading --> the current week (starting from Monday) plus the next week
    - if after arrow left/right is pressed, the biweek calculated at page loaded shifted one day (plus or minor) per each time the arrow is clicked */
function fillTableHeader(){
    // check locale in use
    if(localStorage.getItem("lang") == 'en'){
        var days = ['SUN','MON','TUE','WED','THI','FRI','SAT'];
    } else {
        var days = ['DOM','LUN','MAR','MER','GIO','VEN','SAB'];    
    }
    
    // cycle each date of the biweekly array calculated before
    for (let i = 0; i < biweeklyDatesArray.length; i ++ ) {
        let month = biweeklyDatesArray[i].getMonth() + 1;
        let day = biweeklyDatesArray[i].getDate();
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        // modify the DOM of the page setting table headers's text with the calculated dates
        $("#date" + (i+1)).text(days[biweeklyDatesArray[i].getDay()] // gets the "SUN", "MON" ecc..
                                + " " + day+"/" +month); // gets the "02/11", "03/11" ecc..
    }
}


/* fill the matrix in order properly with all the reservations transformed in objects with the essential data would be needed in page:
    - box for the appropriate row
    - pet name will be desplayed inside every cell 
    - reservation id to be stored because once clicked on a single cell it'd be moved to reservation page with that reservation in editing (with all its data filled), it works in this way: that reservation ID will be stored after the click and then read in reservation page loading
    - pet id needed to read pet's data from LS for the popup filled with that data will be triggerd on cell (pet) hover event (mouse over) */
function fillTheMatrix(biweekMatrix, reservationsObjectArray){
    reservationsObjectArray.forEach(function(res, index){
        if(res){
            // cycle over all the biweekMatrix's first row, which remember stores all the header dates in string format
            for(var j=0; j<14; j++){
                if(res.date == biweekMatrix[0][j]){
                    // if dates matches, then get the box and fill that matrix's box with the pet object
                    var box = res.box.substr(res.box.indexOf("box")+3);     // res.box is like box1, bo2, ..., box10

                    // if there were no pet inserted before threat the matrix's cell content as a single reservation (one reservation into a cell)
                    if(biweekMatrix[box][j] == "") {
                        biweekMatrix[box][j] = {box: res.box, pet_name: res.pet_name, pet_id: res.pet_id, reservation_id: res.reservation_id}; 

                        // if there were already more than one pets, then transform the matrix's cell content into another array with all the pets for that reservation in that day (cell)
                    } else if ( biweekMatrix[box][j] instanceof Array) {
                        let elements = new Array();
                        biweekMatrix[box][j].forEach(function(reserv, index){
                            elements.push(reserv);
                        });
                        elements.push( {box: res.box, pet_name: res.pet_name, pet_id: res.pet_id, reservation_id: res.reservation_id} );
                        biweekMatrix[box][j] = elements;

                        // if there was just one element
                    } else if ( biweekMatrix[box][j] instanceof Object) {    // only one element in json format, not as array
                        let reservationTmp =  biweekMatrix[box][j];
                        let arrayTmp = new Array();
                        arrayTmp.push(reservationTmp);
                        arrayTmp.push( {box: res.box, pet_name: res.pet_name, pet_id: res.pet_id, reservation_id: res.reservation_id} );
                        biweekMatrix[box][j] = arrayTmp;
                    }


                }
            };
        }
    });
}

// create the html for each reservation tooltip
function initializeTooltips(){
    $('.reservation-detail').tooltip({
        title: getTooltipContent,
        html: true,
        container: 'body'
    });
}
 
// calculates the content to be visualized on the hover event
function getTooltipContent(){
    var element = $(this);
    var title = "";
    // since for every reservation represented in the table has been written with an <a> tag and an <input type="hidden"> containing the input's value, the ".next().val()" reads the reservation's ID
    var petId = element.next().val();
    if(petId){
        let pet = getPetFromLSbyId(petId);
        let owner = getOwnerFromLSbyId(pet.owner);
        title = '<table><tr><th>' + $.i18n.prop('name') + '</th><td>' + pet.name + '</td></tr><tr><th>' + $.i18n.prop('pet_type') + '</th><td>' + pet.pet_type + '</td></tr><tr><th>' + $.i18n.prop('owner') + '</th><td>' + owner.name + '</td></tr><tr><th>' + $.i18n.prop('race_size') + '</th><td>' + pet.race_size + '</td></tr></table>';
    }
    return title;
}

