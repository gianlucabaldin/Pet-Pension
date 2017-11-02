
$(document).ready(function(){
    /* if landing here after clicking "Detail" button in owner_list page, fill the field with the item selected */
    verifyIfInEditing();
});

/* save the values just inserted */
$("#owner-insert").click(function(){
    insertItem();
});

/* save the values just modified */
$("#owner-save").click(function(){
    saveItem(false);
});

/* save the values just modified */
$("#owner-save-clone").click(function(){
    saveItem(true);
});

/* delete the owner in editing */
$("#owner-delete-modal").click(function(){
    deleteItem();
});

/* modal canceling button */
$("#owner-delete-canceling").click(function(){
    this.close();
});

/* in case of editing an existing item, pre-polute the form with the value og that item */
function verifyIfInEditing(){
    //var itemInEditing = localStorage.getItem("ownerInEdit");
    var itemInEditing = getOwnerInEditFromLS();
    if(itemInEditing != undefined){

        // manage Insert / Save / Save and Clone / Delete / Owner List button
        $("#owner-insert").hide();
        $("#owner-save").show();
        $("#owner-save-clone").show();
        $("#owner-delete").show();


        var item = getOwnerFromLSbyId(itemInEditing);
        $("#name").val(item.name);
        $("#address").val(item.address);
        $("#phone1").val(item.phone1);
        $("#phone2").val(item.phone2);
        $("#where-calls").val(item.where_calls);
        $("#reference").val(item.reference);
        $("#notes").val(item.notes);
        $("#id").val(item.id);
    }
}

/* checks form's fields logical correctness */
function checkInputs(){

    var errorArray = [];
    if( $("#name").val() == undefined || $("#name").val() == ""){
        errorArray.push("\'NOME\'");
    }
    if(errorArray.length > 0) {
        var formattedErrors = "<strong>ERORRE :</strong> I seguenti campi sono obbligatori: <ul>";
        errorArray.forEach(function(error, index){
            formattedErrors += "<li>" + error + "</li>";
        });
        formattedErrors += "</ul>";
        $("#form-errors").html(formattedErrors);
        $("#form-errors").show();
        window.scrollTo(0, 0); // go to the top of the page ensuring the message error is visibile (false in small devices)
        return false;   // error found, show the error message and stay in page
    };
    return true;    // no errors found, continue with the insert and then go to owner_list.html page
}

/* save the values just inserted */
function insertItem(){
    /* if validation is ok */
    if(checkInputs()){

        // if previously shown, hide error messages
        $("#form-errors").hide();
        var id;
        /* (try to) read OwnerS from LS */
        //var ownersFromLS = JSON.parse(localStorage.getItem("owners"));
        var ownersFromLS = getOwnersFromLS();
        ownersFromLS == undefined ? id = "1" : id = (ownersFromLS.length +1).toString();    

        /* collect inserted values */
        var name = $("#name").val();
        var address = $('#address').val();
        var phone1 = $("#phone1").val();
        var phone2 = $("#phone2").val();
        var where_calls= $("#where-calls").val();
        var reference= $("#reference").val();
        var notes= $("#notes").val();

        /* create Owner JSON item */
        var newOwner = {id: id, name: name, address: address, phone1: phone1, phone2: phone2, where_calls: where_calls, reference: reference, notes: notes };

        var owners = [];
        /* if there was prevously items in the LS, add the new one to that list */
        if(ownersFromLS != undefined) {
            owners = ownersFromLS;
        }
        owners.push(newOwner);
        /* update the LS list with the new item */
        localStorage.setItem("owners", JSON.stringify(owners));
        /* go to the list page with the new value present */
        window.location.replace('owner_list.html');
    }
}

/* save item in editing with (eventual) updated fields and (eventual) item clone */
function saveItem(ownerClone){
    id = $("#id").val();

    /* (try to) read OWNERS from LS */
    //var ownersFromLS = JSON.parse(localStorage.getItem("owners"));
    var ownersFromLS = getOwnersFromLS();
    //ownersFromLS == undefined ? id = "1" : id = (ownersFromLS.length +1).toString();    

    /* collect inserted values */
    var name = $("#name").val();
    var address = $('#address').val();
    var phone1 = $("#phone1").val();
    var phone2 = $("#phone2").val();
    var where_calls= $("#where-calls").val();
    var reference= $("#reference").val();
    var notes= $("#notes").val();

    /* create Owner JSON item */
    var newOwner = {id: id, name: name, address: address, phone1: phone1, phone2: phone2, where_calls: where_calls, reference: reference, notes: notes };

    //var owners = [];
    ownersFromLS.forEach(function(owner, index, array){
        if(owner.id == id) {
            array[index] = newOwner;
        }
    });
    /* update the LS list with the new item */
    localStorage.setItem("owners", JSON.stringify(ownersFromLS));

    /* if clone, get the id of the Owner just inserted, copy it and add +1 to the id */
    if(ownerClone) {
        var ownerClone = getOwnerFromLSbyId(id);
        var ownersFromLS = getOwnersFromLS();
        ownerClone.id = Number(ownersFromLS.length +1).toString();
        ownerClone.name += "_clone";
        var owners = [];
        /* if there was prevously items in the LS, add the new one to that list */
        if(ownersFromLS != undefined) {
            owners = ownersFromLS;
        }
        owners.push(ownerClone);
        /* update the LS list with the new item just cloned */
        localStorage.setItem("owners", JSON.stringify(owners));
        /* remove the key so in case of new insert the form will be empty */
        localStorage.removeItem("ownerInEdit", ownerClone.id);

        // set the modal confirm popup 
        let modalText = '<p>Clonazione avenuta correttamente, i dati del nuovo clone:<br/>id = ' + ownerClone.id + '<br/>nome = ' + ownerClone.name + '</p>';
        $('#clone-confermed-text').html(modalText);
        // opens the modal confirmation popup
        $('#clone-confermed').modal();
    } else {
        /* go to the list page with the new value present */
        window.location.replace('owner_list.html');
    }
}

// closes the popup and goes to the list page
$('#close-modal').click(function(){
    // go to the owner list with the intial item saved (with eventual modifies) and its clone will have the latest number
    if(window.location.href.indexOf("home") == -1 && window.location.href.indexOf("list") == -1){
        window.location.replace('owner_list.html');
    }
});

/* delete the item in editing */
function deleteItem(){
    var id = getOwnerInEditFromLS();
    var owners = getOwnersFromLS();
    owners.forEach(function(owner, index, array){
        if(owner.id == id){
            array.splice(index, 1);
        }
    });
    localStorage.setItem("owners", JSON.stringify(owners));
    /* go to the list page with the new value present */
    window.location.replace('owner_list.html');
}

/* get (eventual) Owner in editing from Local Storage */
function getOwnerInEditFromLS(){
    return localStorage.getItem("ownerInEdit");
}