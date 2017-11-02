
$(document).ready(function(){
    checkOwners();
    /* if landing here after clicking "Detail" button in owner_list page, fill the field with the item selected */
    verifyIfInEditing();
});

/* save the values just inserted */
$("#pet-insert").click(function(){
    insertItem();
});

/* save the values just modified */
$("#pet-save").click(function(){
    saveItem(false);
});

/* save the values just modified */
$("#pet-save-clone").click(function(){
    saveItem(true);
});

/* delete the pet in editing */
$("#pet-delete-modal").click(function(){
    deleteItem();
});

/* modal canceling button */
$("#pet-delete-canceling").click(function(){
    this.close();
});

/* in case of editing an existing item, populate the form with the value og that item */
function verifyIfInEditing(){
    //var itemInEditing = localStorage.getItem("petInEdit");
    var itemInEditing = getPetInEditFromLS();
    if(itemInEditing != undefined){

        // enable Save / Save and Clone / Delete / Pet List button
        $("#pet-insert").hide();
        $("#pet-save").show();
        $("#pet-save-clone").show();
        $("#pet-delete").show();

        // populate the form
        var item = getPetFromLSbyId(itemInEditing);
        switch(item.pet_type){
            case "cane": 
                $("#pet-type-dog").attr("checked", "checked");
                $("#pet-type-other").val("");
                break;
            case "gatto": 
                $("#pet-type-cat").attr("checked", "checked");
                $("#pet-type-other").val("");
                break;
            default:    // other type
                $("#pet-type-other").attr("checked", "checked");
                $("#pet-type-other-value").val(item.pet_type);
                break;
                            }
        $("#name").val(item.name);
        item.sex == 'M'? $("#sex-m").attr("checked", "checked"): item.sex == 'F'? $("#sex-f").attr("checked", "checked") : "";
        item.sterilized == 'Si'? $("#sterilized-y").attr("checked", "checked"): item.sterilized== 'No'? $("#sterilized-n").attr("checked", "checked") : item.sterilized== '?'? $("#sterilized-x").attr("checked", "checked") : "";
        $("#race-size").val(item.race_size);
        $("#owner-list").val(item.owner);
        $("#vaccines").val(item.vaccines);
        $("#pesticides").val(item.pesticides);
        $("#feeding").val(item.feeding);
        $("#pesticides").val(item.pesticides);
        $("#health").val(item.health);
        $("#behavior").val(item.behavior);
        $("#taxi").val(item.taxi);
        $("#agreements").val(item.agreements);
        $("#extra").val(item.extra);
        $("#pesticides").val(item.pesticides);
        $("#can-share-with").val(item.can_share_with);
        $("#id").val(item.id);
    }
}

/* checks form's fields logical correctness */
function checkInputs(){

    var errorArray = [];
    var formattedErrors = "";
    if( $("#name").val() == undefined || $("#name").val() == ""){
        errorArray.push("NOME");
    }
    if( $('input[name=pet-type]:checked').val() == undefined || $('input[name=pet-type]:checked').val() == ""){
        // in save mode (not insert mode) of an "other" pet type item, jquery instruction $('input[name=pet-type]:checked').val() == undefined --> BUG (?!?!?)
        if(document.getElementById('pet-type-other').checked != true){
            errorArray.push("TIPO ANIMALE");
        }
    }
    if( $("#owner-list").val() == undefined || $("#owner-list").val() == ""){
        errorArray.push("PROPRIETARIO");
    }
    // same BUG as vefore (?!?!?)
    if( document.getElementById('pet-type-other').checked == true && $("#pet-type-other-value").val() == "") {
        errorArray.push("Devi specificare il tipo di animale ! ");
    }
    if(errorArray.length > 0) {
        formattedErrors = "<strong>ERORRE :</strong> I seguenti campi sono obbligatori: <ul>";
        errorArray.forEach(function(error, index){
            formattedErrors += "<li>" + error + "</li>";
        });
        formattedErrors += "</ul>";
    }
    /* */

    /* */
    if(formattedErrors != ""){
        $("#form-errors").html(formattedErrors);
        $("#form-errors").show();
        window.scrollTo(0, 0); // go to the top of the page ensuring the message error is visibile (false in small devices)
        return false;   // error found, show the error message and stay in page
    } else {
        $("#form-errors").show();
        return true;    // no errors found, continue with the insert and then go to pet_list.html page
    }
}

/* checks if there are no owner item in db, in case show a warning message since without any owner item (mandatory) no pet can be inserted */
function checkOwners(){
    //var ownersFromLS = JSON.parse(localStorage.getItem("owners"));
    var ownersFromLS = getOwnersFromLS();
    if(ownersFromLS == undefined || ownersFromLS.length == 0){
        $("#form-warning").html("<strong>WARNING :</strong> Non è ancora stato inserito alcun Proprietario, pertanto non sarà possibile inserire nuovi animali in quanto Proprietario è un campo obbligatorio!");
        $("#form-warning").show();
    } else {
        var owner_list = "<option selected></option>";  // default: an empty value
        ownersFromLS.forEach(function(owner, index){
            owner_list += "<option value =\"" + owner.id +"\">" + owner.name + "</option>";
        });
        $("#owner-list").html(owner_list);
    }
}

/* save the values just inserted */
function insertItem(){
    // if previously shown, hide warning messages
    $("#form-warning").hide();

    /* if validation is ok */
    if(checkInputs()){
        // if previously shown, hide error messages
        $("#form-errors").hide();
        var id;
        /* (try to) read PETS from LS */
        //var petsFromLS = JSON.parse(localStorage.getItem("pets"));
        var petsFromLS = getPetsFromLS();
        petsFromLS == undefined ? id = "1" : id = (petsFromLS.length +1).toString();    

        /* collect inserted values */
        var name = $("#name").val();
        var petType = $('input[name=pet-type]:checked').val() == undefined ? "" : $('input[name=pet-type]:checked').val();
        switch(petType){
            case "dog": 
                petType = "cane";
                break;
            case "cat": 
                petType = "gatto";
                break;
            case "other": 
                petType = $("#pet-type-other-value").val();
                break;
            default:
                petType = "";
                      }
        var sex = $('input[name=sex]:checked').val() == undefined ? "" : $('input[name=sex]:checked').val();
        var sterilized = $('input[name=sterilized]:checked').val() == undefined ? "" : $('input[name=sterilized]:checked').val() == 'Y' ? "Si" : $('input[name=sterilized]:checked').val() == 'N' ?"No": "?";
        var race_size= $("#race-size").val();
        var owner= $("#owner-list").val();
        var vaccines= $("#vaccine").val();
        var pesticides= $("#pesticides").val();
        var feeding= $("#feeding").val();
        var health= $("#health").val();
        var behavior= $("#behavior").val();
        var taxi= $("#taxi").val();
        var agreements= $("#agreements").val();
        var extra= $("#extra").val();
        var can_share_with= $("#can-share-with").val();

        /* create Pet JSON item */
        var newPet = {id: id, name: name, pet_type: petType, sex: sex, sterilized: sterilized, race_size: race_size, owner: owner, vaccines: vaccines, pesticides: pesticides, feeding: feeding, health: health, behavior: behavior, taxi: taxi, agreements: agreements, extra: extra, can_share_with: can_share_with};//, costPerNight: costPerNight, costPerDay: costPerDay };

        var pets = [];
        /* if there was prevously items in the LS, add the new one to that list */
        if(petsFromLS != undefined) {
            pets = petsFromLS;
        }
        pets.push(newPet);
        /* update the LS list with the new item */
        localStorage.setItem("pets", JSON.stringify(pets));
        /* go to the list page with the new value present */
        window.location.replace('pet_list.html');
    }
}

/* save item in editing with (eventual) updated fields */
function saveItem(petClone){

    if(checkInputs()){    
        var id = $("#id").val();

        /* (try to) read PETS from LS */
        var petFromLS = getPetsFromLS();
        var name = $("#name").val();
        var petType = ($('input[name=pet-type]:checked').val() == undefined || $('input[name=pet-type]:checked').val() == "") ? "" : $('input[name=pet-type]:checked').val();
        // workaround for the bug mentioned in checkInputs() method
        if(document.getElementById('pet-type-other').checked == true) {
            petType = "other";
        }

        switch(petType){
            case "dog": 
                petType = "cane";
                break;
            case "cat": 
                petType = "gatto";
                break;
            case "other": 
                petType = $("#pet-type-other-value").val();
                break;
            default:
                petType = "";
                      }
        var sex = $('input[name=sex]:checked').val() == undefined ? "" : $('input[name=sex]:checked').val();
        var sterilized = $('input[name=sterilized]:checked').val() == undefined ? "" : $('input[name=sterilized]:checked').val() == 'Y' ? "Si" : $('input[name=sterilized]:checked').val() == 'N' ?"No": "?";
        var race_size= $("#race-size").val();
        var owner= $("#owner-list").val();
        var vaccines= $("#vaccines").val();
        var pesticides= $("#pesticides").val();
        var feeding= $("#feeding").val();
        var health= $("#health").val();
        var behavior= $("#behavior").val();
        var taxi= $("#taxi").val();
        var agreements= $("#agreements").val();
        var extra= $("#extra").val();
        var can_share_with= $("#can-share-with").val();

        /* create Pet JSON item */
        var newPet = {id: id, name: name, pet_type: petType, sex: sex, sterilized: sterilized, race_size: race_size, owner: owner, vaccines: vaccines, pesticides: pesticides, feeding: feeding, health: health, behavior: behavior, taxi: taxi, agreements: agreements, extra: extra, can_share_with: can_share_with};//, costPerNight: costPerNight, costPerDay: costPerDay };

        /* override existing Pets array in LS with the new item */
        petFromLS.forEach(function(pet, index, array){
            if(pet.id == id) {
                array[index] = newPet;
            }
        });
        /* update the LS list with the new item */
        localStorage.setItem("pets", JSON.stringify(petFromLS));
        /* if clone, get the id of the Pet just inserted, copy it and add +1 to the id */
        if(petClone) {
            var clonePet = getPetFromLSbyId(id);
            var petsFromLS = getPetsFromLS();
            clonePet.id = Number(petsFromLS.length +1).toString();
            clonePet.name += "_clone";
            var pets = [];
            /* if there was prevously items in the LS, add the new one to that list */
            if(petsFromLS != undefined) {
                pets = petsFromLS;
            }
            pets.push(clonePet);
            /* update the LS list with the new item just cloned */
            localStorage.setItem("pets", JSON.stringify(pets));
            /* remove the key so in case of new insert the form will be empty */
            localStorage.removeItem("petInEdit", clonePet.id);

            // set the modal confirm popup 
            let modalText = '<p>Clonazione avenuta correttamente, i dati del nuovo clone:<br/>id = ' + clonePet.id + '<br/>nome = ' + clonePet.name + '</p>';
            $('#clone-confermed-text').html(modalText);
            // opens the modal confirmation popup
            $('#clone-confermed').modal();
        } else {
            /* go to the list page with the new value present */
            window.location.replace('pet_list.html');;
        };
    }

    // closes the popup and goes to the list page
    $('#close-modal').click(function(){
        // go to the pet list with the intial item saved (with eventual modifies) and its clone will have the latest number
        if(window.location.href.indexOf("home") == -1 && window.location.href.indexOf("list") == -1){
            window.location.replace('pet_list.html');
        }
    });
}

/* delete the item in editing */
function deleteItem(){
    var id = getPetInEditFromLS();
    var pets = getPetsFromLS();
    pets.forEach(function(pet, index){
        if(pet.id == id){
            pets.splice(index, 1);
        }
    });
    /* update the LS list without the old item just removed */
    localStorage.setItem("pets", JSON.stringify(pets));
    /* go to the item list */
    window.location.replace('pet_list.html');    
}

/* get (eventual) Pet in editing from Local Storage */
function getPetInEditFromLS(){
    return localStorage.getItem("petInEdit");
}