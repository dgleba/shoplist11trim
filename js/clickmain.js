/**
 * Called when the Back button is pressed. Returns to the
 * home screen with a lit of shopping lists.
 */
const fonback = function() {
  this.mode = "showlist";
  this.pagetitle = "Shopping Lists";
};

/**
 * Called when the delete button is pressed next to a shopping list.
 * The shopping list document is located, removed from PouchDB and
 * removed from Vue's shoppingLists array.
 * @param {String} id
 */
const fonClickDelete = function(id) {
  var match = this.findDoc(this.shoppingLists, id);
  db.remove(match.doc).then(() => {
    this.shoppingLists.splice(match.i, 1);
  });
};

/**
 * Called when the Edit button is pressed next to a shopping list.
 * We locate the list document by id and change mode to "addlist",
 * pre-filling the form with that document's details.
 * @param {String} id
 * @param {String} title
 */
const fonClickEdit = function(id, title) {
  this.singleList = this.findDoc(this.shoppingLists, id).doc;
  this.pagetitle = "Edit - " + title;
  this.places = [];
  this.selectedPlace = null;
  this.mode = "addlist";
};
