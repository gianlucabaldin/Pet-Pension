

/* when pages is loaded ..*/
$(document).ready(function() {
    readDataFromLS();
    loadDataTable();    
});


function readDataFromLS(){
    /* (try to) read PETS from LS */
    var ownersFromLS = getOwnersFromLS();
    /* if there are data */
    if(ownersFromLS != undefined){
        var rows = "";
        ownersFromLS.forEach(function(owner, index){
            /* format rows read from LS in html code */
            rows +=  "<tr><th scope=\"row\">" + owner.id + "</th>"
                + "<td>" + owner.name + "</td>"
                + "<td>" + owner.address + "</td>"
                + "<td>" + owner.phone1 + "</td>"
                + "<td>" + owner.phone2 + "</td>"
                + "<td>" + owner.notes + "</td>"
                + "<th><button class=\"btn btn-secondary col-sm-2 btn-detail\" id=\"detail_" + owner.id + "\">+</button></th>"
                + "</tr>";
        });
        /* insert rows into table body */
        $('#owner-list-table tbody').html(rows);
    }
}

/* Load the table with the jQuery DataTable third-party library to gain table filter, search, pagination etc.. */
function loadDataTable(){
    $('#owner-list-table').DataTable( {
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
                title: 'Pensione Animali - Elenco Proprietari'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel', 
                className: 'btn btn-secondary',
                exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5 ]
                },
                title: 'Pensione Animali - Elenco Proprietari'
            },
            {
                extend: 'pdfHtml5',
                text: 'PDF', 
                className: 'btn btn-secondary',
                exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5 ]
                },
                title: 'Pensione Animali - Elenco Proprietari'
            }
        ]
    } );
}

/* click on Insert button --> replace pet_list.html's container with pet.html into the page through Ajax */
$("#owner-insert").click(function(){
    // remove (eventual) previous editing value
    localStorage.removeItem("ownerInEdit");
    window.location.replace('owner.html');
});

/* save the item id of the pet the user wants the detail, so it could be read from the pet page (the id is inside the button's id the user has clicked, that in this case is "this") */
$(document).on('click', '.btn-detail', function () {
    localStorage.setItem("ownerInEdit", this.id.substring(this.id.indexOf("_")+1));
    window.location.replace('owner.html');
});