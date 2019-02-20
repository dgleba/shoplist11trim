// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const fsaveLocalDoc = function(doc) {
  return db
    .get(doc._id)
    .then(data => {
      doc._rev = data._rev;
      return db.put(doc);
    })
    .catch(e => {
      return db.put(doc);
    });
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Given a list of docs and an id, find the doc in the list that has
 * an '_id' (key) that matches the incoming id. Updates its "updatedAt"
 * attribute and write it back to PouchDB.
 *   i - the index where the item was found
 *   doc - the matching document
 * @param {Array} docs
 * @param {String} id

 */
const ffindUpdateDoc = function(docs, id) {
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
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
const ffindDoc = function(docs, id, key) {
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
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Called when save button on the settings panel is clicked. The
 * Cloudant sync URL is saved in PouchDB and the sync process starts.
 */
const fonClickStartSync = function() {
  var obj = {
    _id: "_local/user",
    syncURL: this.syncURL
  };
  this.saveLocalDoc(obj).then(() => {
    this.startSync();
  });
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Called when the sync process is to start. Initiates a PouchDB to
 * to Cloudant two-way sync and listens to the changes coming in
 * from the Cloudant feed. We need to monitor the incoming change
 * so that the Vue.js model is kept in sync.
 */
const fstartsync = function() {
  this.syncStatus = "notsyncing";
  if (this.sync) {
    this.sync.cancel();
    this.sync = null;
  }
  if (!this.syncURL) {
    return;
  }
  this.syncStatus = "syncing";
  this.sync = db
    .sync(this.syncURL, {
      live: true,
      retry: false
    })
    .on("change", info => {
      // handle change
      // if this is an incoming change
      if (info.direction == "pull" && info.change && info.change.docs) {
        // loop through all the changes
        for (var i in info.change.docs) {
          var change = info.change.docs[i];
          var arr = null;

          // see if it's an incoming item or list or something else
          if (change._id.match(/^item/)) {
            arr = this.shoppingListItems;
          } else if (change._id.match(/^list/)) {
            arr = this.shoppingLists;
          } else {
            continue;
          }

          // locate the doc in our existing arrays
          var match = this.findDoc(arr, change._id);

          // if we have it already
          if (match.doc) {
            // and it's a deletion
            if (change._deleted == true) {
              // remove it
              arr.splice(match.i, 1);
            } else {
              // modify it
              delete change._revisions;
              Vue.set(arr, match.i, change);
            }
          } else {
            // add it
            if (!change._deleted) {
              arr.unshift(change);
            }
          }
        }
      }
    })
    .on("error", e => {
      this.syncStatus = "syncerror";
    })
    .on("denied", e => {
      this.syncStatus = "syncerror";
    })
    .on("paused", e => {
      if (e) {
        this.syncStatus = "syncerror";
      }
    });
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
