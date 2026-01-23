const Router = require('express');
const route = Router();

route.get('/', shelfController.displayShelf);

export default route;
