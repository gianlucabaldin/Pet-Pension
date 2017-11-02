/* Baldin Gianluca 03/09/2017 */

$(document).ready(function(){
    
    // if it's not the first time the user enters the application, get the last language chosen from LS
    if(localStorage.getItem("lang") != undefined && localStorage.getItem("lang") != null){
        lang = localStorage.getItem("lang");
        changeLanguage(lang, getPath());
    } else {
        // if it's the first time the user opens the browser set italian language as default
        changeLanguage('it', getPath());
    }
});

// submit form by mouse-click on "Search" button
$("#search").click(function(){
    performRequest();
});

// submit form by "Enter key" press (same as click on search button)
$(document).keypress(function(e) {
    if(e.which == 13) {
        performRequest();
    }
});

// convert from unix timestamp format in dd/mm/yyyy format
function getFullDate(unix_timestamp){
    var date = new Date(unix_timestamp * 1000); // conversion rounded at seconds
    var time = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
    return time;
}

// given a date in Date format, it returns a string formatted ad 'dd/mm/yyyy'
function getFullDateFromDate(date) {
    //    var todayTime = new Date();
    var month = date.getMonth() + 1;
    month = month <10 ? "0" + month : month;
    var day = date.getDate();
    day = day < 10 ? "0" + day : day;
    var year = date .getFullYear();
    return day + "/" + month + "/" + year;
}

// return time from unix timestamp format in hh:mm format
function getFullTime(unix_timestamp){
    var date = new Date(unix_timestamp * 1000); // conversion rounded at seconds
    var hours = date.getHours() < 10 ? "0"+date.getHours(): date.getHours();
    var minutes = date.getMinutes() < 10 ? "0"+ date.getMinutes(): date.getMinutes();
    return hours + ":" + minutes;
}

/* get (eventual) list of Pets stored from Local Storage */
function getPetsFromLS(){
    return JSON.parse(localStorage.getItem("pets"));
}

/* get (eventual) list of Owners stored from Local Storage */
function getOwnersFromLS(){
    return JSON.parse(localStorage.getItem("owners"));
}

/* get (eventual) list of Reservations stored from Local Storage */
function getReservationsFromLS(){
    return JSON.parse(localStorage.getItem("reservations"));
}

/* get a Pet instance from LS by a given pet id */
function getPetFromLSbyId(id){
    var petsFromLS = getPetsFromLS();
    var pet_type = "";
    if(petsFromLS != undefined){
        for (let index = 0; index < petsFromLS.length; ++index) {
            if(id == petsFromLS[index].id){
                return petsFromLS[index];
            }
        }
    }
    return "";
}

/* get a Oner instance from LS by a given owner id */
function getOwnerFromLSbyId(id){
    //var ownersFromLS = JSON.parse(localStorage.getItem("owners"));
    var ownersFromLS = getOwnersFromLS();
    //    var owner = "";
    if(ownersFromLS != undefined){
        for (index = 0; index < ownersFromLS.length; ++index) {
            if(id == ownersFromLS[index].id){
                return ownersFromLS[index];
            }
        }
    }
    return "";
}

/* get a Reservation instance from LS by a given reservation id */
function getReservationFromLSbyId(id){
    var reservationsFromLS = getReservationsFromLS();
    if(reservationsFromLS != undefined){
        for (index = 0; index < reservationsFromLS.length; ++index) {
            if(id == reservationsFromLS[index].id){
                return reservationsFromLS[index];
            }
        }
    }
    return "";
}

/* get Pets list instance from LS by their owner id */
function getPetsFromLSbyOwnerId(id){
    var petsFromLS = getPetsFromLS();
    var pets = new Array();
    if(petsFromLS != undefined){
        for (index = 0; index < petsFromLS.length; ++index) {
            if(id == petsFromLS[index].owner){
                pets.push(petsFromLS[index]);
            }
        }
    }
    return pets;
}

/* get an Onwer instance from LS by a given pet id */
function getOwnerFromLSbyPetId(id){
    var pet = getPetFromLSbyId(id);
    var ownersFromLS = getOwnersFromLS();
    if(ownersFromLS){
        for (index = 0; index < ownersFromLS.length; ++index) {
            if(pet.owner == ownersFromLS[index].id){
                return ownersFromLS[index];
            }
        }
    }
    return "";
}

/* export the pets/owners/reservations as a unique json file to be stored locally, called on "ExportDB" link in the navbar */
function exportLSinJSONformat(){
    var pets = "\"pets\": " + JSON.stringify(localStorage.getItem("pets")).replace(/\\/g,'').replace("\"[", "[").replace("]\"", "]");
    var owners = "\"owners\": " +JSON.stringify(localStorage.getItem("owners")).replace(/\\/g,'').replace("\"[", "[").replace("]\"", "]");
    var reservations = "\"reservations\": " +JSON.stringify(localStorage.getItem("reservations")).replace(/\\/g,'').replace("\"[", "[").replace("]\"", "]");

    var jsonLS = "{" + pets + ", " + owners + ", " + reservations + "}";

    return jsonLS;  
}

// while box1...box6 are displayed with their own name, it's not the same for box7..box10 whitch have custom names
function getBoxName(box){
    switch(box.toString()){
        case '7': return "3x3";
        case '8': return "DogHouse";
        case '9': return "Casa 1";
        case '10': return "Casa 2";
        default: return "Box " + box;
                         }
}

// click on IT flag
$('#lang_it').click(function(){
    localStorage.setItem("lang", "it");
    changeLanguage('it', getPath());
});

// click on ENG flag
$('#lang_en').click(function(){
    localStorage.setItem("lang", "en");
    changeLanguage('en', getPath());
});

// i18n plugin initialization - it mas from the bundles every key/value entry and then it replace those values
function changeLanguage(lang, path){
    $.i18n.properties({ 
        name: 'Messages', 
        path: path, 
        mode: 'both', 
        language: lang, 
        async: true,
        callback: function() { 
            // get all DOM tags with 'data-i18n' attribute
            $("*[data-i18n]").each(function(){
                // use the 'data-i18n' value as key to get its value from the map and then replace its text with that value
                $(this).text( $.i18n.prop( $(this).attr('data-i18n')  ));
            });
        }
    });
}

// home and other html pages are in different root so it must be managed the location in order to pass the correct path to the plugin
function getPath(){
    var path ="../bundles/";
    if(window.location.pathname.search("home") != -1){
        path ="bundles/";
    }
    return path;
}
