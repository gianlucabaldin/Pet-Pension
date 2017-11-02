/* when pages is loaded ..*/
$(document).ready(function() {
    readDataFromLS();
    loadDataTable();  
    // initialize tooltips one the pets name tooltips pet characterists
    initializeTooltips();
});


function readDataFromLS(){
    /* (try to) read PETS from LS */
    //var reservationsFromLS = JSON.parse(localStorage.getItem("reservations"));
    var reservationsFromLS = getReservationsFromLS();
    /* if there are data */
    if(reservationsFromLS != undefined){
        var rows = "";
        reservationsFromLS.forEach(function(reservation, index){
            // instantiate a variable since it will be called twice next
            var pet = getPetFromLSbyId(reservation.pet);
            /* format rows read from LS in html code */
            rows +=  "<tr><th scope=\"row\">" + reservation.id + "</th>"
                + "<td>" + reservation.from + "</td>"
                + "<td>" + reservation.to + "</td>"
                + "<td>" + pet.pet_type + "</td>"
                + "<td class='pet-detail'>" + pet.name + "<input type=\"hidden\" name=\"petId\" value=\"" + pet.id + "\"></td>"
                + "<td class='owner-detail'>" + getOwnerFromLSbyId(reservation.owner).name + "<input type=\"hidden\" name=\"ownerId\" value=\"" + reservation.owner + "\"></td>"
                + "<td>" + getBoxName(reservation.box.substr(3)) + "</td>"
                + "<th><button class=\"btn btn-secondary col-sm-2 btn-detail\" id=\"detail_" + reservation.id + "\">+</button></th>"
                + "</tr>";
        });
        /* insert rows into table body */
        $('#reservation-list-table tbody').html(rows);
    }
}

/* Load the table with the jQuery DataTable third-party library to gain table filter, search, pagination etc.. */
function loadDataTable(){
    /* Load the table with the jQuery DataTable third-party library to gain table filter, search, pagination etc.. */
    $('#reservation-list-table').DataTable( {
        dom: 'Bfrtip',
        pageLength: '8',
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
        ]
    } );

    //$('[data-toggle="popover"]').popover(); 
};

/* click on Insert button --> replace pet_list.html's container with pet.html into the page through Ajax */
$("#reservation-insert").click(function(){
    // remove (eventual) previous editing value
    localStorage.removeItem("reservationInEdit");
    window.location.replace('reservation.html');
    //    $("#reservation-list" ).load("../pages/reservation.html #reservation-insert-modify" );
});

/* save the item pet id the user wants the detail on the LS, so it could be read from the pet page (the id is inside the button's id the user has clicked, that in this case is "this") */
$(document).on('click', '.btn-detail', function () {
    localStorage.setItem("reservationInEdit", this.id.substring(this.id.indexOf("_")+1));
    // go to reservation page with the form filled with that reservation
    window.location.replace('reservation.html');
});


// create the html for each reservation tooltip
function initializeTooltips(){
    $('.pet-detail').tooltip({
        title: getTooltipPetContent,
        html: true,
        container: 'body'
    });
    $('.owner-detail').tooltip({
        title: getTooltipOwnerContent,
        html: true,
        container: 'body'
    });
}

// calculates the owner content to be visualized on the hover event
function getTooltipOwnerContent(){
    var element = $(this);
    var title = "";
    // since for every pet in the list is represented in the table with and an <input type="hidden"> containing the pet's owner id, the ".children()" reads the owners's ID
    var ownerId = element.children("input[type='hidden']").val();
    if(ownerId){
        let owner = getOwnerFromLSbyId(ownerId);
        title = '<table><tr><th>' + $.i18n.prop('name') + '</th><td>' + owner.name + '</td></tr><tr><th>' + $.i18n.prop('address')+ '</th><td>' + owner.address + '</td></tr><tr><th>' + $.i18n.prop('reference')+ '</th><td>' + owner.reference + '</td></tr><tr><th>' + $.i18n.prop('contact1') + '</th><td>' + owner.phone1 + '</td></tr></table>';
    }
    return title;
}

// calculates the pet Content to be visualized on the hover event
function getTooltipPetContent(){
    var element = $(this);
    var title = "";
    // since for every pet in the list is represented in the table with and an <input type="hidden"> containing the pet's owner id, the ".children()" reads the pet's ID
    var petId = element.children("input[type='hidden']").val();
    if(petId){
        let pet = getPetFromLSbyId(petId);
        title = '<table><tr><th>' + $.i18n.prop('name') + '</th><td>' + pet.name + '</td></tr><tr><tr><th>' + $.i18n.prop('pet_type') + '</th><td>' + pet.pet_type + '</td></tr><tr><th>' + $.i18n.prop('race_size') + '</th><td>' + pet.race_size + '</td></tr><tr><th>' + $.i18n.prop('sex') + '</th><td>' + pet.sex + '</td></tr><tr><th>' + $.i18n.prop('may_share_with') + '</th><td>' + pet.can_share_with + '</td></tr></table>';
    }
    return title;
}