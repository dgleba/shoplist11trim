//
// this is the Vue.js app. It contains
// el - the HTML element where the app is rendered
// data - the data the app needs to be rendered
// computed - derived data required for the display logic
// method - JavaScript functions
//
var app = new Vue({
  el: "#app",
  data: {
    mode: "showlist",
    pagetitle: "Shopping Lists",
    shoppingLists: [],
    shoppingListItems: [],
    singleList: null,
    currentListId: null,
    newItemTitle: "",
    places: [],
    selectedPlace: null,
    syncURL: "",
    syncStatus: "notsyncing"
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // computed functions return data derived from the core data.
  // if the core data changes, then this function will be called too.
  computed: {
    /**
     * Calculates the shopping list but sorted into
     * date order - newest first
     *
     * @returns {Array}
     */
    sortedShoppingLists: function() {
      return this.shoppingLists.sort(newestFirst);
    }
  },
  /**
   * Called once when the app is first loaded
   */

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  created: function() {
    // create database index on 'type'
    db.createIndex({ index: { fields: ["type"] } })
      .then(() => {
        // load all 'list' items
        var q = {
          selector: {
            type: "list"
          }
        };
        return db.find(q);
      })
      .then(data => {
        // write the data to the Vue model, and from there the web page
        app.shoppingLists = data.docs;

        // get all of the shopping list items
        var q = {
          selector: {
            type: "item"
          }
        };
        return db.find(q);
      })
      .then(data => {
        // write the shopping list items to the Vue model
        app.shoppingListItems = data.docs;

        // load settings (Cloudant sync URL)
        return db.get("_local/user");
      })
      .then(data => {
        // if we have settings, start syncing
        this.syncURL = data.syncURL;
        this.startSync();
      })
      .catch(e => {});
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  methods: {
    /**
     * Called when the settings button is pressed. Sets the mode
     * to 'settings' so the Vue displays the settings panel.
     */
    onClickSettings: function() {
      this.mode = "settings";
    },

    /**
     * Called when the about button is pressed. Sets the mode
     * to 'about' so the Vue displays the about panel.
     */
    onClickAbout: function() {
      this.mode = "about";
    },
    /**
     * Saves 'doc' to PouchDB. It first checks whether that doc
     * exists in the database. If it does, it overwrites it - if
     * it doesn't, it just writes it.
     * @param {Object} doc
     * @returns {Promise}
     */

    findDoc: ffindDoc,
    findUpdateDoc: ffindUpdateDoc,

    onClickAddShoppingList: fonClickAddShoppingList,
    onClickSaveShoppingList: fonClickSaveShoppingList,
    onClickEdit: fonClickEdit,
    onClickDelete: fonClickDelete,

    onBack: fonback,

    saveLocalDoc: fsaveLocalDoc,
    onClickStartSync: fonClickStartSync,
    startSync: fstartsync
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
