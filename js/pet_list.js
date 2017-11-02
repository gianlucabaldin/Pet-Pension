
/* when pages is loaded ..*/
$(document).ready(function() {
    readDataFromLS();
    loadDataTable();    
    // initialize tooltips one the pets name tooltips pet characterists
    initializeTooltips();
});

function readDataFromLS(){
    
    /* (try to) read PETS from LS */
    var petsFromLS = getPetsFromLS();
    /* if there are data */
    if(petsFromLS != undefined){
        var rows = "";
        petsFromLS.forEach(function(pet, index){
            /* format rows read from LS in html code */
            rows +=  "<tr><th scope=\"row\">" + pet.id + "</th>"
                + "<td>" + pet.name + "</td>"
                + "<td>" + pet.pet_type + "</td>"
                + "<td>" + pet.sex + "</td>"
                + "<td>" + pet.race_size + "</td>"
                + "<td class=\"owner-detail\">" + getOwnerFromLSbyId(pet.owner).name + "<input type=\"hidden\" name=\"ownerId\" value=\"" + pet.owner + "\"></td>" 
                + "<th><button class=\"btn btn-secondary col-sm-2 btn-detail\" id=\"detail_" + pet.id + "\">+</button></th>"
                + "</tr>";
        });
        /* insert rows into table body */
        $('#pet-list-table tbody').html(rows);
    }
}

/* Load the table with the jQuery DataTable third-party library to gain table filter, search, pagination etc.. */
function loadDataTable(){
    $('#pet-list-table').DataTable( {
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
}

/* click on Insert button --> go to insert page */
$("#pet-insert").click(function(){
    // remove (eventual) previous editing value
    localStorage.removeItem("petInEdit");
    window.location.replace('pet.html');
});

/* save the item id of the pet the user wants the detail, so it could be read from the pet page (the id is inside the button's id the user has clicked, that in this case is "this") */
$(document).on('click', '.btn-detail', function () {
    /**/
    localStorage.setItem("petInEdit", this.id.substring(this.id.indexOf("_")+1));
    window.location.replace('pet.html');
});

// create the html for each reservation tooltip
function initializeTooltips(){
    $('.owner-detail').tooltip({
        title: getTooltipContent,
        html: true,
        container: 'body'
    });
}

// calculates the content to be visualized on the hover event
function getTooltipContent(){
    var element = $(this);
    var title = "";
    // since for every pet in the list is represented in the table with and an <input type="hidden"> containing the pet's owner id, the ".children()" reads the owners's ID
    var ownerId = element.children("input[type='hidden']").val();
    if(ownerId){
        let owner = getOwnerFromLSbyId(ownerId);
        title = '<table><tr><th>Nome</th><td>' + owner.name + '</td></tr><tr><th>Indirizzo</th><td>' + owner.address + '</td></tr><tr><th>Amico di</th><td>' + owner.reference + '</td></tr><tr><th>Telefono</th><td>' + owner.phone1 + '</td></tr></table>';
    }
    return title;
}
