//create object
function CreateListItem(listItem, price, quantity) {
    this.id = Date.now();
    this.listItem = listItem;
    this.price = price;
    this.quantity = quantity;
    this.totalCost = price * quantity;
    this.done = false;

}

var shoppingList = [];
var totalSpending = [];

window.onload = init;

function init() {
    var submitButton = document.getElementById("submit");
    submitButton.onclick = getFormData;
    getListItems();
}

//get objects from local storage
function getListItems() {
    if (localStorage) {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.substring(0, 4) == "item") {
                var item = localStorage.getItem(key);
                var listItem = JSON.parse(item);
                shoppingList.push(listItem);
                totalSpending.push(listItem.totalCost);
                
            }
        }
        addListItemsToPage();
    } else {
        console.log("Error: you don't have local Storage!");
    }
}

//add complete list
function addListItemsToPage() {
    shoppingList.sortOnValue("id");
    var ul = document.getElementById("shopping-list");
    var listFragment = document.createDocumentFragment();
    for (var i = 0; i < shoppingList.length; i++) {
        var listItem = shoppingList[i];
        var li = createNewListItem(listItem);
        listFragment.appendChild(li);
    }
    ul.appendChild(listFragment);

}

//adding one item child to list
function addShoppingListToPage(listItem) {
    var ul = document.getElementById("shopping-list");
    var li = createNewListItem(listItem);
    ul.appendChild(li);
    document.forms[0].reset();
    location.reload();
}

//create row with object info
function createNewListItem(listItem) {

    //create row with id
    var li = document.createElement("li");
    li.setAttribute("id", listItem.id);
    li.setAttribute("class", "item-container")

    //create divs with attribute for each type of data
    var divItem = document.createElement("div");
    divItem.setAttribute("class", "item")
    divItem.innerHTML = `${listItem.listItem}`;

    var divPrice = document.createElement("div");

    divPrice.innerHTML = `${listItem.price}.-`;
    divPrice.setAttribute("class", "price");


    //find expensivest and least expensivest items
    var cheapest = shoppingList.reduce((min, p) => parseFloat(p.price) < min ? parseFloat(p.price) : min, shoppingList[0].price);
    var mostExpensive = shoppingList.reduce((max, p) => parseFloat(p.price) > max ? parseFloat(p.price) : max, shoppingList[0].price);

    //compare expensive and cheapest against list items
    if (shoppingList.length > 1) {
        if (parseFloat(listItem.price) === parseFloat(mostExpensive)) {
            divPrice.setAttribute("class", "price expensive");
        } else if (parseFloat(listItem.price) === parseFloat(cheapest)) {
            divPrice.setAttribute("class", "price cheap");
        }
    }

    var divQuantity = document.createElement("div");
    divQuantity.setAttribute("class", "quantity")
    divQuantity.innerHTML = `${listItem.quantity} pcs`;

    var divTotal = document.createElement("div");
    divTotal.setAttribute("class", "total");
    divTotal.innerHTML = `${listItem.totalCost}.-`;
    

    //check or not check button
    var divDone = document.createElement("div");
    if (!listItem.done) {
        divDone.setAttribute("class", "notDone");
        divDone.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    } else {
        divDone.setAttribute("class", "done");
        divDone.innerHTML = "&nbsp;&#10003;&nbsp;";
    }

    divDone.onclick = updateDone;

    //delete button
    var divDelete = document.createElement("div");
    divDelete.setAttribute("class", "delete");
    divDelete.innerHTML = "&nbsp;&#10005;&nbsp;";

    divDelete.onclick = deleteItem;


    li.appendChild(divDone);
    li.appendChild(divItem);
    li.appendChild(divPrice);
    li.appendChild(divQuantity);
    li.appendChild(divTotal);
    li.appendChild(divDelete);

    return li;

}

//fetch data from input
function getFormData() {
    var listItem = document.getElementById("input-list-item").value;
    if (checkInputText(listItem, "Please enter an item")) return;

    var price = document.getElementById("input-price").value;
    if (checkInputText(price, "Please enter a price")) return;

    var quantity = document.getElementById("input-quantity").value;
    if (checkInputText(quantity, "Please enter how much is needed")) return;

    var listItem = new CreateListItem(listItem, price, quantity);
    shoppingList.push(listItem);
    
    saveShoppingListItem(listItem);
}

function checkInputText(value, msg) {
    if (value == null || value == "") {
        alert(msg);
        return true;
    }
    return false;
}

//save data to local storage
function saveShoppingListItem(listItem) {
    if (localStorage) {
        var key = "item" + listItem.id;
        var item = JSON.stringify(listItem);
        localStorage.setItem(key, item);
    } else {
        console.log("Error: you don't have localStorage!")
    }

    addShoppingListToPage(listItem);
}

//done //not done
function updateDone(e) {
    var div = e.target;
    var id = div.parentElement.id;
    var key = "item" + id;
    for (var i = 0; i < shoppingList.length; i++) {
        if (shoppingList[i].id == id) {
            if (shoppingList[i].done === false) {
                //update object to done
                shoppingList[i].done === true;
                //update local storage to done
                listItem = JSON.parse(localStorage.getItem(key));
                listItem.done = true;
                localStorage.setItem(key, JSON.stringify(listItem));
                //console.log("check item as done: " + id);
            } else if (shoppingList[i].done === true) {
                //update object to done
                shoppingList[i].done === false;
                //update local storage to not done
                listItem = JSON.parse(localStorage.getItem(key));
                listItem.done = false;
                localStorage.setItem(key, JSON.stringify(listItem));
                //console.log("check item as undone: " + id);

            }
        }
    }

    location.reload()

}

//delete item
function deleteItem(e) {
    var div = e.target;
    var id = div.parentElement.id;
    //console.log("delete an item: " + id);

    var key = "item" + id;
    localStorage.removeItem(key);

    for (var i = 0; i < shoppingList.length; i++) {
        if (shoppingList[i].id == id) {
            shoppingList.splice(i, 1);
            break;
        }
    }

    getTotalSpending();
    var li = e.target.parentElement;
    var ul = document.getElementById("shopping-list");
    ul.removeChild(li);
}

//calculate the total spending amount
function getTotalSpending() {
    var costCounter = 0;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.substring(0, 4) == "item") {
            var item = localStorage.getItem(key);
            var listItem = JSON.parse(item);
            costCounter += listItem.totalCost;
            
        }
    }
    
    document.getElementById("total-spending").innerHTML =`the shopping list total is ${costCounter}.-`;
    
}

getTotalSpending();

//sorting list on id
Array.prototype.sortOnValue = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        }
        return 0;
    });
}


