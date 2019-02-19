// this will be the PouchDB database
var db = new PouchDB("shopping");

// Vue Material plugin
Vue.use(VueMaterial);

// Vue Material theme
Vue.material.registerTheme("default", {
  primary: "blue",
  accent: "white",
  warn: "red",
  background: "grey"
});

// template shopping list object
const sampleShoppingList = {
  _id: "",
  type: "list",
  version: 1,
  title: "",
  checked: false,
  place: {
    title: "",
    license: null,
    lat: null,
    lon: null,
    address: {}
  },
  createdAt: "",
  updatedAt: ""
};
