const pinteresRouter = require('./pinteres_router');
const reviewRouter = require('./review_router.js');
const serviciosRouter = require('./servicio_router.js');
const userRouter = require('./user_router.js');
const zonaRouter = require('./zona_router.js');

function routerApi(app) {
  //app.use('/pinteres',pinteresRouter);
  //app.use('/review',reviewRouter);
  app.use('/servicio',serviciosRouter);
  //app.use('/user',userRouter);
  //app.use('/zona',zonaRouter);
}

module.exports = routerApi;
