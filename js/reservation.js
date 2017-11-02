
$(document).ready(function(){

    fillPetAndOwnerLists();
    /* if landing here after clicking "Detail" button in owner_list page, fill the field with the item selected */
    verifyIfInEditing();
    // fill the Pets and Owners SelectItem list
    initializeAutocompleteLists();
});

/* save the values just inserted */
$("#reservation-insert").click(function(){
    insertItem();
});

/* save the values just inserted */
$("#reservation-save").click(function(){
    saveItem();
});

/* save the values just modified */
$("#reservation-save-clone").click(function(){
    saveItem(true);
});

/* delete the pet in editing */
$("#reservation-delete-modal").click(function(){
    deleteItem();
});

/* modal canceling button */
$("#reservation-delete-canceling").click(function(){
    this.close();
});

/* checks form's fields logical correctness */
function checkInputs(){

    var errorArray = [];
    // mandatory fields missing check
    var formattedErrors = "";
    if( $("#pet-list").val() == undefined || $("#pet-list").val() == ""){
        errorArray.push("NOME ANIMALE");
    }
    if( $('#owner-list').val() == undefined || $('#owner-list').val() == ""){
        errorArray.push("NOME PADORNE");
    }
    if( $("#from").val() == undefined || $("#from").val() == ""){
        errorArray.push("DA");
    }
    if( $("#to").val() == undefined || $("#to").val() == ""){
        errorArray.push("A");
    }
    if( $("#box").val() == undefined || $("#box").val() == ""){
        errorArray.push("BOX");
    }
    if(errorArray.length > 0) {
        var formattedErrors = "<strong>ERORRE :</strong> I seguenti campi sono obbligatori: <ul>";
        errorArray.forEach(function(error, index){
            formattedErrors += "<li>" + error + "</li>";
        });
        formattedErrors += "</ul>";
    }

    // logical controls 
    if(new Date($("#from").val()).getTime() > new Date($("#to").val()).getTime()){
        formattedErrors += "<strong>ERORRE :</strong> La data di inzio è maggiore a quella di fine !!";
    }
    // show the error(s) in page
    if(formattedErrors != "") {
        $("#form-errors").html(formattedErrors);
        $("#form-errors").show();
        window.scrollTo(0, 0); // go to the top of the page ensuring the message error is visibile (false in small devices)
        return false;   // error found, show the error message and stay in page
    }
    return true;    // no errors found, continue with the insert and then go to pet_list.html page
}

/* if there are no owner pets nor owners in db show a warning message since without they are mandatory values prevent the insert / otherwise fill the comboboxes with their lists */
function fillPetAndOwnerLists(){
    fillOwnerList();
    fillPetList();
}

/* in case of editing an existing item, populate the form with the value og that item */
function verifyIfInEditing(){
    //var itemInEditing = localStorage.getItem("reservationInEdit");
    var itemInEditing = getReservationInEditFromLS();
    if(itemInEditing != undefined){

        // enable Save / Save and Clone / Delete / Pet List button
        $("#reservation-insert").hide();
        $("#reservation-save").show();
        $("#reservation-save-clone").show();
        $("#reservation-delete").show();

        // populate the form
        var item = getReservationFromLSbyId(itemInEditing);
        $("#pet-list").val(item.pet);
        $("#owner-list").val(item.owner);
        $("#from").val(item.from.substr(6,4) + "-" + item.from.substr(3,2) + "-" + item.from.substr(0,2));
        $("#to").val(item.to.substr(6,4) + "-" + item.to.substr(3,2) + "-" + item.to.substr(0,2));
        $("#cost-per-night").val(item.cost_per_night);
        $("#cost-per-day").val(item.cost_per_day);
        $("#days").val(item.days);
        $("#nights").val(item.nights);
        $("#notes").val(item.notes);
        $("#sale").val(item.sale);
        $("#payment-notes").val(item.payment_notes);
        if(item.payed == 'Si') {
            $("#payed").attr("checked", "checked");
        }
        $("#tot").val(item.tot);
        $("#box").val(item.box);
        $("#id").val(item.id);
    }
}

// if "to" date has changed AND "from" date has already been filled, calculate nights/day/tot
$("#to").change(function(){
    if($("#to").val() != "" && $("#to").val() != ""){
        calculateNightDayDiff();
    }
});
// if "from" date has changed AND "to" date has already been filled, calculate nights/day/tot
$("#from").change(function(){
    if($("#to").val() != "" && $("#to").val() != ""){
        calculateNightDayDiff();
    } else {
        $("#to").val($(this).val());
    }
    
});
// cost per night changed, if "from" and "to" dates are already been filled recalculate the tot
$("#cost-per-day").change(function(){
    if($("#to").val() != "" && $("#to").val() != ""){
        calculateNightDayDiff();
    }
});
// cost per day changed, if "from" and "to" dates are already been filled recalculate the tot
$("#cost-per-night").change(function(){
    if($("#to").val() != "" && $("#to").val() != ""){
        calculateNightDayDiff();
    }
});
// cost per day changed, if "from" and "to" dates are already been filled recalculate the tot
$("#sale").change(function(){
    if($("#to").val() != "" && $("#to").val() != ""){
        calculateNightDayDiff();
    }
});
// calculate and then fill Nights, Days and Total
function calculateNightDayDiff(){
    var diff  = new Date($("#to").val()).getTime() - new Date($("#from").val()).getTime();
    var daysDifference  = diff/1000/60/60/24;
    $("#nights").val(daysDifference);
    $("#days").val(daysDifference+1);
    // just a day-reservation, apply cost_per_day * 1
    if($("#days").val() == 1 ){
        $("#tot").val(Number($("#cost-per-day").val()) + Number($("#sale").val()));
    } else if ($("#days").val() >1){
        // multiple day/nights reservation, apply cost_per_night * number of nights
        $("#tot").val(daysDifference * Number($("#cost-per-night").val()) + Number($("#sale").val()));
    }
    // in case days < 0 means the "from" date is major than the "to" date --> error will be shown after Insert click
}

/* save the values just inserted */
function insertItem(){
    // if previously shown, hide warning messages
    $("#form-warning2").hide();

    /* if validation is ok */
    if(checkInputs()){

        // if previously shown, hide error messages
        $("#form-errors").hide();
        var id;
        /* (try to) read RESERVATION from LS */
        //        var reservationsFromLS = JSON.parse(localStorage.getItem("reservations"));
        var reservationsFromLS = getReservationsFromLS();
        reservationsFromLS == undefined ? id = "1" : id = (reservationsFromLS.length +1).toString();    

        /* collect inserted values */
        var pet_id = $("#pet-list").val();
        var owner_id = $("#owner-list").val();
        //        var from = $("#from").val();
        var from = getFullDateFromDate( new Date( $("#from").val()) );
        //        var to= $("#to").val();
        var to = getFullDateFromDate( new Date( $("#to").val()) );
        var cost_per_night= $("#cost-per-night").val();
        var cost_per_day= $("#cost-per-day").val();
        var nights= $("#nights").val();
        var days= $("#days").val();
        var notes= $("#notes").val();
        var payment_notes= $("#payment-notes").val();
        var sale= $("#sale").val();
        var payed= $('input[id=payed]:checked').val() == 'Y' ? "Si" : "No";
        var tot= $("#tot").val();
        var box= $("#box").val();

        /* create Pet JSON item */
        var newReservation = {id: id, pet: pet_id, owner: owner_id, from: from, to: to, cost_per_night: cost_per_night, cost_per_day: cost_per_day, nights: nights, days: days, notes: notes, payment_notes: payment_notes, sale: sale, payed: payed, tot: tot, box: box };

        if(verifyOtherReservation(newReservation)){

            var reservations = [];
            /* if there was prevously items in the LS, add the new one to that list */
            if(reservationsFromLS != undefined) {
                reservations = reservationsFromLS;
            }
            reservations.push(newReservation);
            /* update the LS list with the new item */
            localStorage.setItem("reservations", JSON.stringify(reservations));
            /* go to the list page with the new value present */
            window.location.replace('reservation_list.html');
        }
    }
}

/* save item in editing with (eventual) updated fields and (eventual) item clone */
function saveItem(reservationClone){
    var id = $("#id").val();

    /* (try to) read reservation from LS */
    //var reservationsFromLS = JSON.parse(localStorage.getItem("reservations"));
    var reservationsFromLS = getReservationsFromLS();
    //reservationsFromLS == undefined ? id = "1" : id = (reservationsFromLS.length +1).toString();    

    /* collect inserted values */
    var pet_id = $("#pet-list").val();
    var owner_id = $("#owner-list").val();
    //        var from = $("#from").val();
    var from = getFullDateFromDate( new Date( $("#from").val()) );
    //    var to= $("#to").val();
    var to = getFullDateFromDate( new Date( $("#to").val()) );
    var cost_per_night= $("#cost-per-night").val();
    var cost_per_day= $("#cost-per-day").val();
    var nights= $("#nights").val();
    var days= $("#days").val();
    var notes= $("#notes").val();
    var payment_notes= $("#payment-notes").val();
    var sale= $("#sale").val();
    var payed= $('input[id=payed]:checked').val() == 'Y' ? "Si" : "No";
    var tot= $("#tot").val();
    var box= $("#box").val();

    /* create Pet JSON item */
    var newReservation = {id: id, pet: pet_id, owner: owner_id, from: from, to: to, cost_per_night: cost_per_night, cost_per_day: cost_per_day, nights: nights, days: days, notes: notes, payment_notes: payment_notes, sale: sale, payed: payed, tot: tot, box: box};

    //var reservations = [];
    reservationsFromLS.forEach(function(reservation, index, array){
        if(reservation.id == id) {
            array[index] = newReservation;
        }
    });
    /* update the LS list with the new item */
    localStorage.setItem("reservations", JSON.stringify(reservationsFromLS));

    /* if clone, get the id of the Owner just inserted, copy it and add +1 to the id */
    if(reservationClone) {
        var reservationClone = getReservationFromLSbyId(id);
        var reservationsFromLS = getReservationsFromLS();
        reservationClone.id = Number(reservationsFromLS.length +1).toString();
        var reservations = [];
        /* if there was prevously items in the LS, add the new one to that list */
        if(reservationsFromLS != undefined) {
            reservations = reservationsFromLS;
        }
        reservations.push(reservationClone);
        /* update the LS list with the new item just cloned */
        localStorage.setItem("reservations", JSON.stringify(reservations));
        /* remove the key so in case of new insert the form will be empty */
        localStorage.removeItem("reservationInEdit", reservationClone.id);

        // set the modal confirm popup 
        let modalText = '<p>Clonazione avenuta correttamente, i dati del nuovo clone:<br/>id = ' + reservationClone.id + '</p>';
        $('#clone-confermed-text').html(modalText);
        // opens the modal confirmation popup
        $('#clone-confermed').modal();
    } else {
        /* go to the list page with the new value present */
        window.location.replace('reservation_list.html');
    }
}

// closes the popup and goes to the list page
$('#close-modal').click(function(){
    // go to the reservation list with the intial item saved (with eventual modifies) and its clone will have the latest number
    if(window.location.href.indexOf("home") == -1 && window.location.href.indexOf("list") == -1){
        window.location.replace('reservation_list.html');
    }
});

/* delete the pet in editing */
function deleteItem(){
    var id = getReservationInEditFromLS();
    var reservations = getReservationsFromLS();
    reservations.forEach(function(reservation, index, array){
        if(reservation.id == id){
            array.splice(index, 1);
        }
    });
    localStorage.setItem("reservations", JSON.stringify(reservations));
    /* go to the list page with the new value present */
    window.location.replace('reservation_list.html');
}

/* get (eventual) Reservation in editing from Local Storage */
function getReservationInEditFromLS(){
    return localStorage.getItem("reservationInEdit");
}

// when an owner is selected from its list
$('#owner-list').change(function(event){
    // if the chosen one is "blank", the reset all --> both pet and owner list with all available items
    if($('#owner-list').val() == ""){
        fillOwnerList();
        fillPetList();
        // interrupt here and wait for other user interaction
        return;
    }
    /* if the chosen owner is a valid owner (meaning not the blank item) then filter the pet list with only the owner's pets which -rememeber- could be more than one */
    var petsFromLS = getPetsFromLSbyOwnerId(this.value);
    if(petsFromLS){
        var pet_list = "";
        if(petsFromLS.length > 1){
            pet_list += "<option selected></option>";  // default: an empty value
        }
        petsFromLS.forEach(function(pet, index){
            pet_list += "<option value =\"" + pet.id +"\">" + pet.name + "</option>";
        });
        $("#pet-list").html(pet_list);
    }
    $("#owner-list option").each(function(listItem){
        var cancellami ="";
        if(listItem.toString() != "" && listItem.toString() != event.target.value){
            $("#owner-list option[value=" +listItem + "]").remove();
        }
    });
    /* it can't happen to arrive here with an owner chosen AND a pet chosen from the pet-list because when a pet is chosen from a list:
        1 - if owner list has no selected item (pet has been chosen BEFORE choosing the owner) than the owner-list will be filled with only his (one and just one) owner, plus the empty item (to let reset both the lists)
        2 - if owner has a selected item it means it's beeen chosen another pet from the same owner's pets list 
    */
});

// when a pet is selected from its list
$('#pet-list').change(function(){
    /* if the chosen pet is a valid pet (meaning not the blank item) and no owner has already been chosen, means the pet has been chosen BEFORE the owner --> filter the owner list with only the owner of the pet it's just be chosen, plus the empty item (to let reset both the lists) */

    var ownerFromLS = getOwnerFromLSbyPetId(this.value);
    if(ownerFromLS){
        var owner_list = "";  // default: an empty value
        owner_list += "<option value =\"" + ownerFromLS.id +"\">" + ownerFromLS.name + "</option>";
        $("#owner-list").html(owner_list);
    }

    var y = "";
    /* if the flow code arrives here, it means a pet has been chosen and the owner was already been chosen BEFORE, so it means that the pet is the one of the owner's pet OR it's been chosen another pet from the owner's pets (remember: could be from zero to infinite) */

});

// get the pets from LS and -if there is at least one item- fill the owner-list, otherwise rise up a warning message
function fillOwnerList(){
    var ownersFromLS = getOwnersFromLS();
    if(ownersFromLS == undefined || ownersFromLS.length == 0){
        $("#form-warning2").html("<strong>WARNING :</strong> Non è ancora stato inserito alcun Proprietario, pertanto non sarà possibile inserire nuove Prenotazioni in quanto Proprietario è un campo obbligatorio!");
        $("#form-warning2").show();
    } else {
        var owner_list = "<option selected></option>";  // default: an empty value
        //        var owner_list = "";  // default: an empty value
        ownersFromLS.forEach(function(owner, index){
            owner_list += "<option value =\"" + owner.id +"\">" + owner.name + "</option>";
        });
        $("#owner-list").html(owner_list);
    }
};

// get the pets from LS and -if there is at least one item- fill the owner-list, otherwise rise up a warning message
function fillPetList(){
    var petsFromLS = getPetsFromLS();
    if(petsFromLS == undefined || petsFromLS.length == 0){
        $("#form-warning1").html("<strong>WARNING :</strong> Non è ancora stato inserito alcun Animale, pertanto non sarà possibile inserire nuove Prenotazioni in quanto Animale è un campo obbligatorio!");
        $("#form-warning1").show();
    } else {

        var pet_list = "<option selected></option>";  // default: an empty value
        //        var pet_list = "";  // default: an empty value
        petsFromLS.forEach(function(pet, index){
            pet_list += "<option value =\"" + pet.id +"\">" + pet.name + "</option>";
        });
        $("#pet-list").html(pet_list);
    }
}

// refreshes pet and owner list
$("#lists-refresh").click(function(){
    fillOwnerList();
    fillPetList();
});

// verify if in the actual insert there are other reservation for the same period in the same box, in that case arise a popup of confirmation with the list of the other pets in that box
function verifyOtherReservation(newReservation){

    // start Date of the new reservation
    var startNewReservation = new Date(Number(newReservation.from.substr(6,4)), Number(newReservation.from.substr(3,2))-1,       Number(newReservation.from.substr(0,2)));
    // end Date of the new reservation
    var endNewReservation = new Date(Number(newReservation.to.substr(6,4)), Number(newReservation.to.substr(3,2))-1, Number(newReservation.to.substr(0,2)));
    // create an array (reservationDates) with all the dates of each reservation period
    var newReservationDates = new Array();
    while(startNewReservation <= endNewReservation){
        newReservationDates.push(new Date(startNewReservation));
        startNewReservation.setDate(startNewReservation.getDate() + 1);
    }

    // create object array for the reservation present at the LS
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
    }

    // instantiate a temporary array where to store eventual date/pets/box
    var overlappingReservation = [];
    // match if there are overlapping reservation between the ones stored and the one in creating
    newReservationDates.forEach(function(newReservationDate, index1){
        reservationsObjectArray.forEach(function(storedReservation, index2){
            if(getFullDateFromDate(newReservationDate) == storedReservation.date && newReservation.box == storedReservation.box){
                overlappingReservation.push({date: newReservationDate, stored_pet: storedReservation.pet_name, box: storedReservation.box});
            }
        });
    });

    if(overlappingReservation.length >0){
        let message = "Per il periodo scelto sono già presenti le seguenti prenotazioni: <br/><br/><ol>";
        overlappingReservation.forEach(function(overlappingItem){
            message += '<li>' + getFullDateFromDate(overlappingItem.date) + ' - ' + overlappingItem.stored_pet + ' - ' + getBoxName(overlappingItem.box.substr(3)) + '</li>';
        });
        message += '</ol>';
        let newPet = getPetFromLSbyId(newReservation.pet);
        if(newPet.can_share_with){
            message += "Ti ricordiamo che <strong>" + newPet.name + " </strong>può condividere con " + newPet.can_share_with + "<br/>";
        }
        message += "<br/>Continuare?";
        $('#overlapping-reservation-text').html(message);

        $('#overlapping-reservation').modal();
        return false;
    }
    return true;
}

$('#confirm-overlapping-reservation').click(function(){
    var reservationsFromLS = getReservationsFromLS();
    var reservations = [];
    /* if there was prevously items in the LS, add the new one to that list */
    if(reservationsFromLS != undefined) {
        reservations = reservationsFromLS;
    }

    /* collect inserted values */
    var pet_id = $("#pet-list").val();
    var owner_id = $("#owner-list").val();
    var from = getFullDateFromDate( new Date( $("#from").val()) );
    var to = getFullDateFromDate( new Date( $("#to").val()) );
    var cost_per_night= $("#cost-per-night").val();
    var cost_per_day= $("#cost-per-day").val();
    var nights= $("#nights").val();
    var days= $("#days").val();
    var notes= $("#notes").val();
    var payment_notes= $("#payment-notes").val();
    var sale= $("#sale").val();
    var payed= $('input[id=payed]:checked').val() == 'Y' ? "Si" : "No";
    var tot= $("#tot").val();
    var box= $("#box").val();

    var id;
    /* (try to) read RESERVATION from LS */
    reservationsFromLS == undefined ? id = "1" : id = (reservationsFromLS.length +1).toString();    

    /* create Pet JSON item */
    var newReservation = {id: id, pet: pet_id, owner: owner_id, from: from, to: to, cost_per_night: cost_per_night, cost_per_day: cost_per_day, nights: nights, days: days, notes: notes, payment_notes: payment_notes, sale: sale, payed: payed, tot: tot, box: box };

    reservations.push(newReservation);
    /* update the LS list with the new item */
    localStorage.setItem("reservations", JSON.stringify(reservations));
    /* go to the list page with the new value present */
    window.location.replace('reservation_list.html');
});

/* apply Select2 3rd-party library transforms normal "select" widget item into an autocomplete widget where you can filter the list through an input string - https://select2.org/ */
function initializeAutocompleteLists(){
    $('#pet-list').select2();
    $('#owner-list').select2();
}
