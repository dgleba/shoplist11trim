// this is the Vue.js app. It contains
// el - the HTML element where the app is rendered
// data - the data the app needs to be rendered
// computed - derived data required for the display logic
// method - JavaScript functions
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
    saveLocalDoc: function(doc) {
      return db
        .get(doc._id)
        .then(data => {
          doc._rev = data._rev;
          return db.put(doc);
        })
        .catch(e => {
          return db.put(doc);
        });
    },
    /**
     * Called when save button on the settings panel is clicked. The
     * Cloudant sync URL is saved in PouchDB and the sync process starts.
     */
    onClickStartSync: function() {
      var obj = {
        _id: "_local/user",
        syncURL: this.syncURL
      };
      this.saveLocalDoc(obj).then(() => {
        this.startSync();
      });
    },

    /**
     * Given a list of docs and an id, find the doc in the list that has
     * an '_id' (key) that matches the incoming id. Returns an object
     * with the
     *   i - the index where the item was found
     *   doc - the matching document
     * @param {Array} docs
     * @param {String} id
     * @param {String} key
     * @returns {Object}
     */
    findDoc: function(docs, id, key) {
      if (!key) {
        key = "_id";
      }
      var doc = null;
      for (var i in docs) {
        if (docs[i][key] == id) {
          doc = docs[i];
          break;
        }
      }
      return { i: i, doc: doc };
    },

    /**
     * Given a list of docs and an id, find the doc in the list that has
     * an '_id' (key) that matches the incoming id. Updates its "updatedAt"
     * attribute and write it back to PouchDB.
     *   i - the index where the item was found
     *   doc - the matching document
     * @param {Array} docs
     * @param {String} id

     */
    findUpdateDoc: function(docs, id) {
      // locate the doc
      var doc = this.findDoc(docs, id).doc;

      // if it exits
      if (doc) {
        // modift the updated date
        doc.updatedAt = new Date().toISOString();

        // write it on the next tick (to give Vue.js chance to sync state)
        this.$nextTick(() => {
          // write to database
          db.put(doc).then(data => {
            // retain the revision token
            doc._rev = data.rev;
          });
        });
      }
    },

    /**
     * Called when the user clicks the Add Shopping List button. Sets
     * the mode to 'addlist' to reveal the add shopping list form and
     * resets the form variables.
     */
    onClickAddShoppingList: function() {
      // open shopping list form
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
      this.singleList._id = "list:" + cuid();
      this.singleList.createdAt = new Date().toISOString();
      this.pagetitle = "New Shopping List";
      this.places = [];
      this.selectedPlace = null;
      this.mode = "addlist";
    },

    /**
     * Called when the Save Shopping List button is pressed.
     * Writes the new list to PouchDB and adds it to the Vue
     * model's shoppingLists array
     */
    onClickSaveShoppingList: function() {
      // add timestamps
      this.singleList.updatedAt = new Date().toISOString();

      // add to on-screen list, if it's not there already
      if (typeof this.singleList._rev === "undefined") {
        this.shoppingLists.unshift(this.singleList);
      }

      // write to database
      db.put(this.singleList).then(data => {
        // keep the revision tokens
        this.singleList._rev = data.rev;

        // switch mode
        this.onBack();
      });
    },

    onClickEdit: fonClickEdit,

    onClickDelete: fonClickDelete,

    onBack: fonback,
    startSync: fstartsync
  }
});
