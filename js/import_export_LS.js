
// on click on "ExportDB" link, opens a windows shell to export&save the LS in json format
$("#exportDB").click(function(a){
    var uri = 'data:application/json;charset=UTF-8,' + encodeURIComponent(exportLSinJSONformat());
    $(this).attr("href", uri);
});

/* handler when upload a file contains the PetPension db to store into LocalStorage */
document.getElementById('file').addEventListener('change', handleFileSelect, false);

/* funtion imports, parse and store previously saved versions of the localStorage */
function handleFileSelect(evt)
{
    var files = evt.target.files; // FileList object
    var reader = new FileReader();
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++)
    {
        reader.onload = function(event)
        {
            // NOTE: event.target point to FileReader
            var contents = event.target.result;
            var jsonObj = JSON.parse(contents);
            // separate every single item
            var x1 = jsonObj["pets"];
            var x2 = jsonObj["owners"];
            var x3 = jsonObj["reservations"];
            // get stringified object ready to be stored into LS
            var pets = JSON.stringify(x1);
            var owners = JSON.stringify(x2);
            var reservations = JSON.stringify(x3);
            // remove the object in case already present
            localStorage.removeItem("pets");
            localStorage.removeItem("owners");
            localStorage.removeItem("reservations");
            // set the new items into LocalStorage
            localStorage.setItem("pets", pets);
            localStorage.setItem("owners", owners);
            localStorage.setItem("reservations", reservations);
        };
        reader.readAsText(f);   // TODO ERRORE A RUNTIME, CAPIRE PERCHE (FUNZIONA UGUALMENTE)
    }

    // create the modal popup will be inserted in the page's DOM dinamically
    let htmlModal = '<div class="modal fade" id="confirm-popup">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">Conferma</h5>' + 
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>' +
        '<div class="modal-body" id="overlapping-reservation-text">' +
        '<p>La tua copia locale del Database è stata inserita correttamente</p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-primary" data-dismiss="modal" id="close-modal">Ok, grazie!</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';   

    // append the modal to the body
    $('body').append(htmlModal);
    // activate the modal
    $('#confirm-popup').modal();
    // when click on the modal confirm button
    $('#confirm-popup').on('hide.bs.modal', function(){
        // wait 800 milliseconds
        $('#confirm-popup').delay(800);
        // refresh the page if not in home (there's nothing to refresh in home)
        if(window.location.href.indexOf("home") == -1){
            location.reload();
        };
    });

}

